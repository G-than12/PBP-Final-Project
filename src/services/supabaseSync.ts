import { Collection, SavedItem, AppSettings } from "../types/models";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import { sanitizeCollectionHierarchy } from "../utils/collectionHierarchy";

export interface SupabaseUserInfo {
  id: string;
  email: string;
}

function mapCollectionToRow(col: Collection, userId: string) {
  return {
    id: col.id,
    user_id: userId,
    name: col.name,
    color: col.color,
    icon: col.icon,
    is_system: Boolean(col.isSystem),
    parent_id: col.parentId ?? null,
    created_at: col.createdAt,
  };
}

function mapRowToCollection(row: any): Collection {
  return {
    id: String(row.id),
    name: String(row.name || "Koleksi"),
    color: String(row.color || "#8FC9FF"),
    icon: String(row.icon || "folder"),
    isSystem: Boolean(row.is_system),
    parentId: row.parent_id ?? null,
    createdAt: Number(row.created_at) || Date.now(),
  };
}

function mapItemToRow(item: SavedItem, userId: string) {
  return {
    id: item.id,
    user_id: userId,
    url: item.url,
    title: item.title,
    description: item.description || "",
    source: item.source || "Web",
    collection_id: item.collectionId,
    is_pinned: Boolean(item.isPinned),
    is_reviewed: Boolean(item.isReviewed),
    tags: Array.isArray(item.tags) ? item.tags : [],
    notes: item.notes || "",
    image: item.image ?? null,
    author: item.author ?? null,
    deadline: item.deadline ?? null,
    reminder_timing: item.reminderTiming ?? null,
    custom_reminder_time: item.customReminderTime ?? null,
    created_at: item.createdAt,
  };
}

function mapRowToItem(row: any): SavedItem {
  return {
    id: String(row.id),
    url: String(row.url),
    title: String(row.title || row.url),
    description: String(row.description || ""),
    source: String(row.source || "Web"),
    collectionId: String(row.collection_id || "inbox"),
    isPinned: Boolean(row.is_pinned),
    isReviewed: Boolean(row.is_reviewed),
    tags: Array.isArray(row.tags) ? row.tags : [],
    notes: String(row.notes || ""),
    image: row.image ?? undefined,
    author: row.author ?? undefined,
    deadline: row.deadline !== null && row.deadline !== undefined ? Number(row.deadline) : null,
    reminderTiming: row.reminder_timing ?? null,
    customReminderTime:
      row.custom_reminder_time !== null && row.custom_reminder_time !== undefined
        ? Number(row.custom_reminder_time)
        : null,
    createdAt: Number(row.created_at) || Date.now(),
  };
}

export async function getCurrentSupabaseUser(): Promise<SupabaseUserInfo | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email || "",
  };
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseUserInfo> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase belum dikonfigurasi di file .env.");
  }
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Gagal masuk ke akun.");
  return { id: data.user.id, email: data.user.email || email.trim() };
}

export async function signUpWithSupabase(
  email: string,
  password: string
): Promise<{ user: SupabaseUserInfo | null; needsEmailConfirmation: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase belum dikonfigurasi di file .env.");
  }
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  const userInfo = data.user
    ? { id: data.user.id, email: data.user.email || email.trim() }
    : null;
  return {
    user: userInfo,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function verifySignupOtp(
  email: string,
  token: string
): Promise<SupabaseUserInfo> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Layanan cloud belum dikonfigurasi.");
  }
  const { data, error } = await client.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "signup",
  });
  if (error) throw error;
  if (!data.user) throw new Error("Verifikasi OTP gagal.");
  return { id: data.user.id, email: data.user.email || email.trim() };
}

export async function resendSignupOtp(email: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Layanan cloud belum dikonfigurasi.");
  }
  const { error } = await client.auth.resend({
    type: "signup",
    email: email.trim(),
  });
  if (error) throw error;
}

export function translateAuthError(err: any): string {
  const msg = String(err?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "Email atau kata sandi salah.";
  }
  if (msg.includes("email not confirmed")) {
    return "Email belum diverifikasi. Silakan masukkan kode OTP yang dikirim ke email Anda.";
  }
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Email ini sudah terdaftar. Silakan masuk dengan akun Anda.";
  }
  if (msg.includes("token has expired") || msg.includes("otp") || msg.includes("expired")) {
    return "Kode OTP salah atau sudah kedaluwarsa. Silakan kirim ulang kode.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("for security purposes")) {
    return "Terlalu banyak permintaan. Tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (msg.includes("password should be at least")) {
    return "Kata sandi minimal 6 karakter.";
  }
  return err?.message || "Terjadi kesalahan. Periksa koneksi internet dan coba lagi.";
}

export async function signOutSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function syncAllWithSupabase(
  localCollections: Collection[],
  localItems: SavedItem[],
  localSettings: AppSettings
): Promise<{ collections: Collection[]; items: SavedItem[] }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  const { data: userData, error: userErr } = await client.auth.getUser();
  if (userErr || !userData.user) {
    throw new Error("Silakan masuk ke akun Supabase terlebih dahulu.");
  }
  const userId = userData.user.id;

  const [colsRes, itemsRes] = await Promise.all([
    client.from("collections").select("*").eq("user_id", userId),
    client.from("saved_items").select("*").eq("user_id", userId),
  ]);

  if (colsRes.error) throw colsRes.error;
  if (itemsRes.error) throw itemsRes.error;

  const remoteCols = (colsRes.data || []).map(mapRowToCollection);
  const remoteItems = (itemsRes.data || []).map(mapRowToItem);

  // Merge by ID (local edits take precedence when same ID exists)
  const colMap = new Map<string, Collection>();
  remoteCols.forEach((c) => colMap.set(c.id, c));
  localCollections.forEach((c) => colMap.set(c.id, c));
  const mergedCollections = sanitizeCollectionHierarchy(Array.from(colMap.values()));

  const itemMap = new Map<string, SavedItem>();
  remoteItems.forEach((it) => itemMap.set(it.id, it));
  localItems.forEach((it) => itemMap.set(it.id, it));
  const mergedItems = Array.from(itemMap.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );

  // Push merged state back to Supabase
  if (mergedCollections.length > 0) {
    const { error } = await client
      .from("collections")
      .upsert(mergedCollections.map((c) => mapCollectionToRow(c, userId)), {
        onConflict: "user_id,id",
      });
    if (error) throw error;
  }

  if (mergedItems.length > 0) {
    const { error } = await client
      .from("saved_items")
      .upsert(mergedItems.map((it) => mapItemToRow(it, userId)), {
        onConflict: "user_id,id",
      });
    if (error) throw error;
  }

  await client.from("user_settings").upsert(
    {
      user_id: userId,
      dark_mode: localSettings.darkMode,
      home_title: localSettings.homeTitle,
      cloud_sync_enabled: localSettings.cloudSyncEnabled,
      auto_extract_metadata: localSettings.autoExtractMetadata,
      notifications_enabled: localSettings.notificationsEnabled,
    },
    { onConflict: "user_id" }
  );

  return { collections: mergedCollections, items: mergedItems };
}

async function getActiveSyncUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data.session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function pushCollectionToSupabase(col: Collection): Promise<void> {
  const client = getSupabaseClient();
  const userId = await getActiveSyncUserId();
  if (!client || !userId) return;
  await client
    .from("collections")
    .upsert(mapCollectionToRow(col, userId), { onConflict: "user_id,id" });
}

export async function deleteCollectionFromSupabase(collectionId: string): Promise<void> {
  const client = getSupabaseClient();
  const userId = await getActiveSyncUserId();
  if (!client || !userId) return;
  await client
    .from("collections")
    .delete()
    .eq("user_id", userId)
    .eq("id", collectionId);
}

export async function pushItemToSupabase(item: SavedItem): Promise<void> {
  const client = getSupabaseClient();
  const userId = await getActiveSyncUserId();
  if (!client || !userId) return;
  await client
    .from("saved_items")
    .upsert(mapItemToRow(item, userId), { onConflict: "user_id,id" });
}

export async function deleteItemFromSupabase(itemId: string): Promise<void> {
  const client = getSupabaseClient();
  const userId = await getActiveSyncUserId();
  if (!client || !userId) return;
  await client
    .from("saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("id", itemId);
}
