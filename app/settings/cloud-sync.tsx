import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Cloud,
  CloudOff,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Lock,
  LogOut,
  UserCheck,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { safeBack } from "../../src/utils/navigation";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import {
  SupabaseUserInfo,
  getCurrentSupabaseUser,
  signOutSupabase,
  syncAllWithSupabase,
} from "../../src/services/supabaseSync";

export default function CloudSyncScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const settings = useSimpanInStore((state) => state.settings);
  const cloudSyncEnabled = settings.cloudSyncEnabled;
  const setCloudSync = useSimpanInStore((state) => state.setCloudSync);
  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);
  const importDatabase = useSimpanInStore((state) => state.importDatabase);

  const [user, setUser] = useState<SupabaseUserInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Belum pernah");

  useFocusEffect(
    useCallback(() => {
      getCurrentSupabaseUser()
        .then((u) => setUser(u))
        .catch(() => setUser(null));
    }, [])
  );

  const runFullSync = async () => {
    setIsSyncing(true);
    try {
      const merged = await syncAllWithSupabase(collections, items, settings);
      importDatabase({
        collections: merged.collections,
        items: merged.items,
      });
      const timeStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSyncTime(`Hari ini, ${timeStr}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Sinkronisasi Berhasil",
        `${merged.collections.length} koleksi dan ${merged.items.length} tautan telah diselaraskan dengan cloud.`
      );
    } catch (err: any) {
      Alert.alert("Gagal Sinkronisasi", err?.message || "Periksa koneksi internet Anda.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.selectionAsync();
    await signOutSupabase();
    setUser(null);
    setCloudSync(false);
    setLastSyncTime("Belum pernah");
  };

  const handleToggleSync = (val: boolean) => {
    Haptics.selectionAsync();
    if (val && !user) {
      Alert.alert("Masuk Diperlukan", "Silakan masuk ke akun SimpanIn terlebih dahulu.");
      return;
    }
    setCloudSync(val);
    if (val && user) {
      runFullSync();
    }
  };

  const handleManualSync = () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        "Cloud Belum Dikonfigurasi",
        "Isi konfigurasi cloud di file .env terlebih dahulu."
      );
      return;
    }
    if (!user) {
      Alert.alert("Belum Masuk", "Silakan masuk ke akun SimpanIn terlebih dahulu.");
      return;
    }
    if (!cloudSyncEnabled) {
      setCloudSync(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    runFullSync();
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Top App Bar */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            safeBack(router, "/settings");
          }}
          accessibilityLabel="Kembali"
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Sinkronisasi Cloud
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Concept Card */}
        <NeoCard
          color={cloudSyncEnabled ? "#A6E3D1" : "#FFE7A3"}
          style={styles.heroCard}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              {cloudSyncEnabled ? (
                <Cloud size={28} color="#000000" strokeWidth={2.2} />
              ) : (
                <CloudOff size={28} color="#000000" strokeWidth={2.2} />
              )}
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>
                {cloudSyncEnabled
                  ? "Sinkronisasi Aktif"
                  : "Offline & Aman di HP"}
              </Text>
              <Text style={styles.heroSubtitle}>
                {cloudSyncEnabled
                  ? "Data disinkronkan secara aman."
                  : "Semua koleksi dan link tersimpan di memorimu tanpa perlu internet."}
              </Text>
            </View>
          </View>
        </NeoCard>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            AKUN SIMPANIN
          </Text>

          {!isSupabaseConfigured ? (
            <NeoCard color={theme.card} style={styles.cardBox}>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>
                Konfigurasi Cloud Diperlukan
              </Text>
              <Text style={[styles.toggleSubtitle, { color: theme.textMuted, marginTop: 4 }]}>
                Tambahkan konfigurasi cloud di file .env untuk mengaktifkan login & sinkronisasi antar perangkat.
              </Text>
            </NeoCard>
          ) : user ? (
            <NeoCard color={theme.card} style={styles.cardBox}>
              <View style={styles.accountRow}>
                <View style={styles.accountBadge}>
                  <UserCheck size={18} color="#000000" />
                </View>
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleTitle, { color: theme.text }]}>
                    Terhubung ke Cloud
                  </Text>
                  <Text style={[styles.toggleSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleSignOut}
                  style={[styles.logoutBtn, { borderColor: isDark ? "#4A4640" : "#000000" }]}
                >
                  <LogOut size={15} color="#EF4444" />
                  <Text style={styles.logoutBtnText}>Keluar</Text>
                </TouchableOpacity>
              </View>
            </NeoCard>
          ) : (
            <NeoCard color={theme.card} style={styles.cardBox}>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>
                Belum Masuk ke Akun
              </Text>
              <Text style={[styles.toggleSubtitle, { color: theme.textMuted, marginTop: 4, marginBottom: 14 }]}>
                Masuk atau daftar akun SimpanIn untuk menyinkronkan koleksi dan link kamu ke cloud.
              </Text>
              <NeoButton
                variant="primary"
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push("/auth");
                }}
              >
                Masuk / Daftar Akun →
              </NeoButton>
            </NeoCard>
          )}
        </View>

        {/* Sync Controls Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            PENGATURAN KONEKSI
          </Text>

          <NeoCard color={theme.card} style={styles.cardBox}>
            {/* Toggle Row */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>
                  Aktifkan Sinkronisasi Cloud
                </Text>
                <Text style={[styles.toggleSubtitle, { color: theme.textMuted }]}>
                  Cadangkan data secara otomatis saat terhubung ke internet
                </Text>
              </View>
              <Switch
                value={cloudSyncEnabled}
                onValueChange={handleToggleSync}
                trackColor={{ false: "#E5E1D8", true: "#A6E3D1" }}
                thumbColor={cloudSyncEnabled ? "#000000" : "#FFFFFF"}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Sync Status Row */}
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textMuted }]}>
                Terakhir disinkronkan
              </Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>
                {lastSyncTime}
              </Text>
            </View>

            {/* Manual Sync Trigger */}
            <View style={styles.syncBtnContainer}>
              <NeoButton
                variant="yellow"
                onPress={handleManualSync}
                disabled={isSyncing}
                icon={
                  isSyncing ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <RefreshCw size={18} color="#000000" />
                  )
                }
              >
                {isSyncing ? "Menyelaraskan..." : "Sinkronkan Sekarang"}
              </NeoButton>
            </View>
          </NeoCard>
        </View>

        {/* Local-First Architecture Advantages */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            KEUNGGULAN SIMPANIN
          </Text>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <HardDrive size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                Cepat & Siap Offline
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Buka aplikasi langsung jalan tanpa loading. Baca catatan dan atur link di mana pun, bahkan tanpa sinyal.
              </Text>
            </View>
          </NeoCard>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: "#8FC9FF" }]}>
              <Lock size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                Privasi Terjaga
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Link dan catatanmu 100% milikmu. Bebas iklan dan tanpa pelacak pengguna.
              </Text>
            </View>
          </NeoCard>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: "#FF8C79" }]}>
              <ShieldCheck size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                Bebas Dipindah
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Datamu bisa diekspor ke file JSON kapan saja dan dipindah ke HP lain dengan mudah.
              </Text>
            </View>
          </NeoCard>
        </View>

        {/* Mascot Bottom Banner */}
        <View style={styles.mascotBanner}>
          <SimpanInMascot size={54} />
          <Text style={[styles.mascotTip, { color: theme.textMuted }]}>
            Tip: Buat cadangan JSON berkala sebelum berganti perangkat agar data tetap
            tersimpan dengan aman!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerRightSpace: {
    width: 42,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 16,
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2B2927",
    marginTop: 4,
    lineHeight: 16,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardBox: {
    padding: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLeft: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  divider: {
    height: 1.5,
    marginVertical: 14,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  syncBtnContainer: {
    marginTop: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#A6E3D1",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  mascotBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  mascotTip: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accountBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#A6E3D1",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#EF4444",
  },
  authInput: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 10,
  },
  switchAuthBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
});
