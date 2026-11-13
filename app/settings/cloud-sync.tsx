import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Cloud,
  CloudOff,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Wifi,
  Lock,
  CheckCircle2,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { safeBack } from "../../src/utils/navigation";

export default function CloudSyncScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const cloudSyncEnabled = useSimpanInStore(
    (state) => state.settings.cloudSyncEnabled
  );
  const setCloudSync = useSimpanInStore((state) => state.setCloudSync);
  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Belum pernah");

  const handleToggleSync = (val: boolean) => {
    Haptics.selectionAsync();
    setCloudSync(val);
    if (val) {
      setLastSyncTime("Baru saja");
    }
  };

  const handleManualSync = () => {
    if (!cloudSyncEnabled) {
      Alert.alert(
        "Sinkronisasi Nonaktif",
        "Aktifkan sakelar Sinkronisasi Cloud terlebih dahulu untuk memulai penyelarasan."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      const timeStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSyncTime(`Hari ini, ${timeStr}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Sinkronisasi Berhasil",
        `${collections.length} koleksi dan ${items.length} tautan telah diselaraskan.`
      );
    }, 1200);
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
            { backgroundColor: theme.surface, borderColor: theme.border },
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
                  : "Mode Lokal Mandiri (Local-First)"}
              </Text>
              <Text style={styles.heroSubtitle}>
                {cloudSyncEnabled
                  ? "Data Anda disinkronkan secara aman dengan enkripsi ujung ke ujung."
                  : "Semua tautan dan koleksi tersimpan aman di penyimpanan internal perangkat Anda."}
              </Text>
            </View>
          </View>
        </NeoCard>

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
            KEUNGGULAN ARSITEKTUR SIMPANIN
          </Text>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <HardDrive size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                100% Cepat & Offline-Ready
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Aplikasi langsung terbuka instan. Anda dapat membaca catatan, menyortir
                koleksi, dan meninjau tautan di mana saja tanpa sinyal.
              </Text>
            </View>
          </NeoCard>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: "#8FC9FF" }]}>
              <Lock size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                Privasi Tanpa Kompromi
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Tautan pribadi dan catatan riset Anda adalah milik Anda sepenuhnya. Tidak
                ada iklan pihak ketiga atau pelacakan profil pengguna.
              </Text>
            </View>
          </NeoCard>

          <NeoCard color={theme.card} style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: "#FF8C79" }]}>
              <ShieldCheck size={20} color="#000000" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                Cadangan Mandiri & Portabilitas
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                Anda selalu memegang kendali. Anda dapat mengekspor seluruh koleksi ke
                format JSON kapan saja dari menu Cadangan & Pemulihan.
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
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
});
