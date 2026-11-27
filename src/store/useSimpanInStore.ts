import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Collection, SavedItem, SortOption, AppSettings } from "../types/models";
import { FOLDER_COLORS } from "../constants/theme";
import {
  preserveFormattingDescription,
  stripSocialPlatformWrappers,
} from "../utils/metadataParser";
import { cancelDeadlineNotification } from "../utils/notificationManager";
import {
  isValidParentChoice,
  sanitizeCollectionHierarchy,
} from "../utils/collectionHierarchy";
import {
  pushCollectionToSupabase,
  deleteCollectionFromSupabase,
  pushItemToSupabase,
  deleteItemFromSupabase,
} from "../services/supabaseSync";

const ssrSafeStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return null;
    }
    return AsyncStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    await AsyncStorage.removeItem(name);
  },
};

export const SYSTEM_COLLECTION: Collection = {
  id: "inbox",
  name: "Utama",
  color: "#8FC9FF",
  icon: "archive",
  isSystem: true,
  parentId: null,
  createdAt: 1700000000000,
};

interface SimpanInStoreState {
  isOnboarded: boolean;
  settings: AppSettings;
  collections: Collection[];
  items: SavedItem[];
  sortOption: SortOption;

  // Onboarding & Preferences
  setOnboarded: (val: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setHomeTitle: (title: [string, string]) => void;
  setCloudSync: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSortOption: (option: SortOption) => void;

  // Collections (UNLIMITED)
  addCollection: (col: {
    name: string;
    color: string;
    icon: string;
    parentId?: string | null;
  }) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;

  // Saved Links (UNLIMITED)
  addLink: (item: {
    url: string;
    title: string;
    description?: string;
    source?: string;
    collectionId?: string;
    isPinned?: boolean;
    tags?: string[];
    notes?: string;
    image?: string;
    author?: string;
    deadline?: number | null;
    reminderTiming?: "h3" | "h1" | "h0" | "custom" | null;
    reminderNotificationId?: string | null;
    customReminderTime?: number | null;
  }) => SavedItem;
  updateLink: (id: string, updates: Partial<SavedItem>) => void;
  deleteLink: (id: string) => void;
  togglePin: (id: string) => void;
  toggleReviewed: (id: string) => void;
  moveLink: (id: string, targetCollectionId: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;

  // Bulk & Maintenance
  markLinksReviewed: (ids: string[]) => void;
  resetToCleanDatabase: () => void;
  loadSampleDemoData: () => void;
  importDatabase: (data: {
    collections?: Collection[];
    items?: SavedItem[];
    settings?: Partial<AppSettings>;
  }) => void;
}

function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useSimpanInStore = create<SimpanInStoreState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      settings: {
        darkMode: false,
        homeTitle: ["Simpan sekarang.", "Temukan kapan saja."],
        cloudSyncEnabled: false,
        autoExtractMetadata: true,
        notificationsEnabled: false,
      },
      collections: [SYSTEM_COLLECTION],
      items: [],
      sortOption: "title",

      setOnboarded: (val: boolean) => {
        set((state) => {
          // If first time completing onboarding, strictly ensure clean database
          if (val && !state.isOnboarded) {
            return {
              isOnboarded: true,
              collections: [SYSTEM_COLLECTION],
              items: [],
            };
          }
          return { isOnboarded: val };
        });
      },

      setDarkMode: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, darkMode: enabled },
        })),

      setHomeTitle: (title) =>
        set((state) => ({
          settings: { ...state.settings, homeTitle: title },
        })),

      setCloudSync: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, cloudSyncEnabled: enabled },
        })),

      setNotificationsEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: enabled },
        })),

      setSortOption: (option) => set({ sortOption: option }),

      addCollection: ({ name, color, icon, parentId = null }) => {
        const newCol: Collection = {
          id: generateId("col"),
          name: name.trim(),
          color: color || FOLDER_COLORS[0],
          icon: icon || "folder",
          parentId: parentId || null,
          createdAt: Date.now(),
        };
        set((state) => ({ collections: [...state.collections, newCol] }));
        if (get().settings.cloudSyncEnabled) {
          pushCollectionToSupabase(newCol).catch(() => {});
        }
        return newCol;
      },

      updateCollection: (id, updates) => {
        set((state) => {
          const cleanUpdates = { ...updates };
          // Validasi parentId untuk mencegah circular dependency / perulangan siklus
          if (cleanUpdates.parentId !== undefined && cleanUpdates.parentId !== null) {
            if (!isValidParentChoice(id, cleanUpdates.parentId, state.collections)) {
              cleanUpdates.parentId = null;
            }
          }

          const updatedCols = state.collections.map((c) =>
            c.id === id ? { ...c, ...cleanUpdates } : c
          );

          return {
            collections: sanitizeCollectionHierarchy(updatedCols),
          };
        });
        if (get().settings.cloudSyncEnabled) {
          const updated = get().collections.find((c) => c.id === id);
          if (updated) pushCollectionToSupabase(updated).catch(() => {});
        }
      },

      deleteCollection: (id) => {
        const { collections } = get();
        const target = collections.find((c) => c.id === id);
        if (!target || target.isSystem) return; // Prevent deleting system collection

        set((state) => {
          // Flatten subcollections to parent
          const updatedCols = state.collections
            .filter((c) => c.id !== id)
            .map((c) =>
              c.parentId === id ? { ...c, parentId: target.parentId || null } : c
            );

          // Move any orphaned links to system collection
          const updatedItems = state.items.map((it) =>
            it.collectionId === id
              ? { ...it, collectionId: SYSTEM_COLLECTION.id }
              : it
          );

          return {
            collections: sanitizeCollectionHierarchy(updatedCols),
            items: updatedItems,
          };
        });
        if (get().settings.cloudSyncEnabled) {
          deleteCollectionFromSupabase(id).catch(() => {});
        }
      },

      addLink: ({
        url,
        title,
        description = "",
        source = "",
        collectionId,
        isPinned = false,
        tags = [],
        notes = "",
        image,
        author,
        deadline = null,
        reminderTiming = null,
        reminderNotificationId = null,
        customReminderTime = null,
      }) => {
        const fallbackCol = get().collections[0]?.id || SYSTEM_COLLECTION.id;
        const newLink: SavedItem = {
          id: generateId("link"),
          url: url.trim(),
          title: title.trim() || url.trim(),
          description: preserveFormattingDescription(description.trim()),
          source: source.trim() || "Web",
          collectionId: collectionId || fallbackCol,
          isPinned,
          isReviewed: false,
          tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
          notes: notes.trim(),
          createdAt: Date.now(),
          image,
          author: author?.trim(),
          deadline,
          reminderTiming,
          reminderNotificationId,
          customReminderTime,
        };
        set((state) => ({ items: [newLink, ...state.items] }));
        if (get().settings.cloudSyncEnabled) {
          pushItemToSupabase(newLink).catch(() => {});
        }
        return newLink;
      },

      updateLink: (id, updates) => {
        const target = get().items.find((i) => i.id === id);
        // If deadline is explicitly removed or notification ID changed, cancel old notification
        if (target?.reminderNotificationId) {
          if (updates.deadline === null || (updates.reminderNotificationId && updates.reminderNotificationId !== target.reminderNotificationId)) {
            cancelDeadlineNotification(target.reminderNotificationId);
          }
        }

        const cleanUpdates = { ...updates };
        if (cleanUpdates.description !== undefined) {
          cleanUpdates.description = preserveFormattingDescription(cleanUpdates.description);
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...cleanUpdates } : i)),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      deleteLink: (id) => {
        const target = get().items.find((i) => i.id === id);
        if (target?.reminderNotificationId) {
          cancelDeadlineNotification(target.reminderNotificationId);
        }
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        if (get().settings.cloudSyncEnabled) {
          deleteItemFromSupabase(id).catch(() => {});
        }
      },

      togglePin: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, isPinned: !i.isPinned } : i
          ),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      toggleReviewed: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, isReviewed: !i.isReviewed } : i
          ),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      moveLink: (id, targetCollectionId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, collectionId: targetCollectionId } : i
          ),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      addTag: (id, rawTag) => {
        const clean = rawTag.trim().toLowerCase().replace(/^#/, "");
        if (!clean) return;
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.tags.includes(clean)) return i;
            return { ...i, tags: [...i.tags, clean] };
          }),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      removeTag: (id, tagToRemove) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            return { ...i, tags: i.tags.filter((t) => t !== tagToRemove) };
          }),
        }));
        if (get().settings.cloudSyncEnabled) {
          const updated = get().items.find((i) => i.id === id);
          if (updated) pushItemToSupabase(updated).catch(() => {});
        }
      },

      markLinksReviewed: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          items: state.items.map((i) =>
            idSet.has(i.id) ? { ...i, isReviewed: true } : i
          ),
        }));
      },

      resetToCleanDatabase: () => {
        set({
          collections: [SYSTEM_COLLECTION],
          items: [],
          sortOption: "newest",
        });
      },

      loadSampleDemoData: () => {
        const demoCols: Collection[] = [
          SYSTEM_COLLECTION,
          {
            id: "col_resep",
            name: "Resep Lezat",
            color: "#ED7847",
            icon: "utensils",
            isSystem: false,
            parentId: null,
            createdAt: Date.now() - 3600000 * 24 * 3,
          },
          {
            id: "col_resep_dessert",
            name: "Dessert & Pastry",
            color: "#FFE7A3",
            icon: "sparkles",
            isSystem: false,
            parentId: "col_resep",
            createdAt: Date.now() - 3600000 * 24 * 2,
          },
          {
            id: "col_rumah",
            name: "Ide Rumah & Interior",
            color: "#9CD7BE",
            icon: "home",
            isSystem: false,
            parentId: null,
            createdAt: Date.now() - 3600000 * 24 * 4,
          },
          {
            id: "col_liburan",
            name: "Rencana Liburan",
            color: "#E7A997",
            icon: "plane",
            isSystem: false,
            parentId: null,
            createdAt: Date.now() - 3600000 * 24 * 5,
          },
        ];

        const demoItems: SavedItem[] = [
          {
            id: "item_demo_1",
            url: "https://vt.tiktok.com/ZSpAvdyTJ",
            title: "Recommended hotel Semarang arah/wilayah Pemuda ada Hotel Louis Kienne Pemuda salah satu hotel yang lokasinya sangat strategis, dekat Bandara...",
            description: "Recommended hotel Semarang arah/wilayah Pemuda ada Hotel Louis Kienne Pemuda salah satu hotel yang lokasinya sangat strategis, dekat Bandara dan pusat kota Semarang.\n\nFasilitas lengkap:\n- Rooftop infinity pool dengan pemandangan kota\n- Gym modern & sauna\n- Sarapan prasmanan lezat\n\n#semarang #hotelsemarang #rekomendasihotel #liburan",
            source: "TikTok",
            author: "Alippp | Hotel & Wisata",
            collectionId: "col_liburan",
            isPinned: true,
            isReviewed: false,
            tags: ["liburan", "semarang", "hotel", "wisata"],
            notes: "Lokasi di Jalan Pemuda, dekat Simpang Lima dan Paragon Mall.",
            createdAt: Date.now() - 3600000 * 2,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          },
          {
            id: "item_demo_2",
            url: "https://vt.tiktok.com/ZSpAvdyTK",
            title: "Rekomendasi 15 Wisata Populer di Semarang yang Wajib Dikunjungi",
            description: "Daftar 15 tempat wisata terbaik di Semarang:\n1. Lawang Sewu\n2. Kota Lama Semarang\n3. Sam Poo Kong\n4. Umbul Sidomukti\n5. Dusun Semilir\n\nTips perjalanan:\n- Berkunjung saat sore hari untuk pencahayaan terbaik\n- Beli lumpia basah khas Semarang di dekat lokasi",
            source: "TikTok",
            author: "Alippp | Hotel & Wisata",
            collectionId: "col_liburan",
            isPinned: false,
            isReviewed: false,
            tags: ["liburan", "wisata", "semarang"],
            notes: "Rencana trip akhir tahun bareng teman.",
            createdAt: Date.now() - 3600000 * 4,
            image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
          },
          {
            id: "item_demo_3",
            url: "https://id.pinterest.com/pin/japandi-living-room-inspo/",
            title: "Inspirasi Dekorasi Ruang Tamu Minimalis Gaya Japandi",
            description: "Konsep perpaduan minimalis Jepang dan Skandinavia dengan kayu natural, pencahayaan alami, dan furnitur fungsional.",
            source: "Pinterest",
            author: "Studio Desain",
            collectionId: "col_rumah",
            isPinned: true,
            isReviewed: true,
            tags: ["interior", "japandi", "dekorasi", "minimalis"],
            notes: "Warna dinding rekomendasi: Warm White atau Cream.",
            createdAt: Date.now() - 3600000 * 24,
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
          },
          {
            id: "item_demo_4",
            url: "https://www.instagram.com/reel/kyoto_travel_guide/",
            title: "Itinerary 5 Hari Keliling Kyoto & Hidden Gems Murah",
            description: "Panduan lengkap keliling Arashiyama, kuil tersembunyi, dan kuliner matcha authentic.",
            source: "Instagram",
            author: "Traveler ID",
            collectionId: "col_liburan",
            isPinned: false,
            isReviewed: true,
            tags: ["jepang", "kyoto", "travel", "itinerary"],
            notes: "Gunakan Kansai Thru Pass untuk transportasi hemat.",
            createdAt: Date.now() - 3600000 * 48,
            image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
          },
          {
            id: "item_demo_5",
            url: "https://reactnative.dev/docs/intro-to-react-native",
            title: "Arsitektur Expo Router & TypeScript Terbaik untuk Aplikasi Mobile",
            description: "Panduan best practice struktur folder, local-first state, dan Neobrutalist design.",
            source: "Web",
            collectionId: "inbox",
            isPinned: true,
            isReviewed: true,
            tags: ["coding", "reactnative", "typescript", "pbp"],
            notes: "Referensi untuk presentasi Final Project PBP.",
            createdAt: Date.now() - 3600000 * 72,
          },
          {
            id: "item_demo_lomba",
            url: "https://instagram.com/p/lomba-desain-nasional-2026",
            title: "Lomba Desain UI/UX & Web Nasional 2026",
            description: "Pendaftaran Kompetisi UI/UX Nasional tingkat mahasiswa. Tema: Inovasi Digital untuk Masa Depan.\n\nBatas Pengumpulan: 25 November 2026\nHadiah total: Rp 25.000.000",
            source: "Instagram",
            author: "BEM Fasilkom",
            collectionId: "inbox",
            isPinned: true,
            isReviewed: false,
            tags: ["lomba", "uiux", "kompetisi", "desain"],
            notes: "Tim terdiri dari 3 orang. Proposal wajib dikirim sebelum deadline.",
            createdAt: Date.now() - 3600000 * 5,
            deadline: Date.now() + 3600000 * 24 * 3, // 3 days from now
            reminderTiming: "h3",
          },
          {
            id: "item_demo_6",
            url: "https://twitter.com/design_gems/status/189283749281",
            title: "Prinsip Neobrutalisme dalam Desain Antarmuka Modern 2026",
            description: "Kombinasi border 2px, shadow offset tajam, dan kontras warna pastel cerah.",
            source: "X",
            collectionId: "inbox",
            isPinned: false,
            isReviewed: false,
            tags: ["ui", "design", "neobrutalism"],
            notes: "Palet warna cocok untuk maskot SimpanIn.",
            createdAt: Date.now() - 3600000 * 96,
          },
        ];

        set({
          collections: demoCols,
          items: demoItems,
          sortOption: "newest",
        });
      },

      importDatabase: (data) => {
        set((state) => {
          let cols =
            data.collections && Array.isArray(data.collections) && data.collections.length > 0
              ? sanitizeCollectionHierarchy(data.collections)
              : state.collections;

          if (!cols.some((c) => c.id === SYSTEM_COLLECTION.id || c.isSystem)) {
            cols = [SYSTEM_COLLECTION, ...cols];
          }

          const its = data.items && Array.isArray(data.items) ? data.items : state.items;
          const settings = { ...state.settings, ...data.settings };

          return {
            collections: sanitizeCollectionHierarchy(cols),
            items: its,
            settings,
          };
        });
      },
    }),
    {
      name: "simpanin_app_store_v2",
      storage: createJSONStorage(() => ssrSafeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.collections && Array.isArray(state.collections)) {
            state.collections = sanitizeCollectionHierarchy(state.collections).map((c) =>
              (c.id === SYSTEM_COLLECTION.id || c.isSystem) && c.name === "Belum Diurutkan"
                ? { ...c, name: SYSTEM_COLLECTION.name }
                : c
            );
          }
          if (state.items && Array.isArray(state.items)) {
            const seenIds = new Set<string>();
            state.items = state.items.map((it, idx) => {
              let cleanId = it.id;
              if (seenIds.has(cleanId)) {
                cleanId = `${cleanId}_dup_${idx}`;
              }
              seenIds.add(cleanId);

              let desc = it.description;
              if (desc) {
                desc = preserveFormattingDescription(desc);
              }

              let title = it.title;
              let author = it.author;
              if (title) {
                const stripped = stripSocialPlatformWrappers(title);
                if (stripped.cleaned && stripped.cleaned !== title) {
                  title = stripped.cleaned;
                  if (stripped.author && !author) {
                    author = stripped.author;
                  }
                }
              }

              return { ...it, id: cleanId, description: desc, title, author };
            });
          }
        }
      },
    }
  )
);

