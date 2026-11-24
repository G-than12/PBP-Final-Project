import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cloud,
  HardDriveDownload,
  BookOpen,
  RotateCcw,
  Sun,
  Moon,
  Type,
  FolderTree,
  Bookmark,
  CheckCircle,
  Pin,
  Compass,
  Bell,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { NeoConfirmModal } from "../../src/components/ui/NeoConfirmModal";
import { safeBack } from "../../src/utils/navigation";
import {
  requestNotificationPermission,
  cancelAllReminders,
} from "../../src/utils/notificationManager";

export default function SettingsMainScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const setDarkMode = useSimpanInStore((state) => state.setDarkMode);
  const homeTitle = useSimpanInStore((state) => state.settings.homeTitle);
  const setHomeTitle = useSimpanInStore((state) => state.setHomeTitle);
  const cloudSyncEnabled = useSimpanInStore(
    (state) => state.settings.cloudSyncEnabled
  );
  const notificationsEnabled = useSimpanInStore(
    (state) => state.settings.notificationsEnabled
  );
  const setNotificationsEnabled = useSimpanInStore(
    (state) => state.setNotificationsEnabled
  );
  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const resetToCleanDatabase = useSimpanInStore(
    (state) => state.resetToCleanDatabase
  );
  const loadSampleDemoData = useSimpanInStore(
    (state) => state.loadSampleDemoData
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const totalLinks = items.length;
  const totalCollections = collections.length;
  const pinnedLinks = items.filter((i) => i.isPinned).length;
  const reviewedLinks = items.filter((i) => i.isReviewed).length;

  const unreviewedCount = items.filter((i) => !i.isReviewed).length;

  const handleToggleDarkMode = (val: boolean) => {
    Haptics.selectionAsync();
    setDarkMode(val);
  };

  const handleToggleNotifications = async (val: boolean) => {
    Haptics.selectionAsync();
    if (val) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert(
          "Notifikasi Diaktifkan",
          "SimpanIn akan mengirimkan pengingat santai saat simpanan Anda menumpuk."
        );
      } else {
        Alert.alert(
          "Izin Notifikasi Dibutuhkan",
          "Mohon izinkan notifikasi untuk SimpanIn di Pengaturan sistem ponsel Anda agar pengingat dapat muncul."
        );
      }
    } else {
      setNotificationsEnabled(false);
      await cancelAllReminders();
    }
  };

  const handleConfirmReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetToCleanDatabase();
    setShowResetConfirm(false);
    Alert.alert(
      "Database Direset",
      "Semua simpanan dan koleksi kustom telah dibersihkan. Ruang kerja Anda kini bersih dengan koleksi 'Belum Diurutkan'."
    );
  };

  const handleConfirmLoadDemo = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadSampleDemoData();
    setShowDemoConfirm(false);
    Alert.alert(
      "Data Demo Berhasil Dimuat",
      "Koleksi contoh (Resep, Ide Rumah, Liburan) beserta tautan sampel berhasil dimuat untuk pengujian dan demo!"
    );
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
            safeBack(router, "/home");
          }}
          accessibilityLabel="Kembali"
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Pengaturan</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Identity Banner */}
        <NeoCard color="#F7CB54" style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconBadge}>
              <SimpanInMascot small size={32} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>SimpanIn</Text>
              <Text style={styles.bannerSubtitle}>
                Ruang simpan personal yang rapi, privat, dan bebas distraksi.
              </Text>
            </View>
          </View>
        </NeoCard>

        {/* Statistics Dashboard */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            RINGKASAN RUANG KERJA
          </Text>
          <NeoCard color={theme.card} style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Bookmark size={18} color="#000000" />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {totalLinks}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Tautan
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

              <View style={styles.statCol}>
                <FolderTree size={18} color="#000000" />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {totalCollections}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Koleksi
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

              <View style={styles.statCol}>
                <Pin size={18} color="#000000" />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {pinnedLinks}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Semat
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

              <View style={styles.statCol}>
                <CheckCircle size={18} color="#000000" />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {reviewedLinks}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Ditinjau
                </Text>
              </View>
            </View>
          </NeoCard>
        </View>

        {/* Tampilan & Kustomisasi */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            TAMPILAN & PREFERENSI
          </Text>

          {/* Dark Mode Row */}
          <NeoCard color={theme.card} style={styles.settingRowCard}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isDark ? "#4B443B" : "#FFE7A3" },
                ]}
              >
                {isDark ? (
                  <Moon size={20} color="#F7CB54" />
                ) : (
                  <Sun size={20} color="#000000" />
                )}
              </View>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  Mode Gelap
                </Text>
                <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                  {isDark ? "Tema gelap kontras" : "Tema terang neobrutalisme"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: "#E5E1D8", true: "#F7CB54" }}
              thumbColor={isDark ? "#000000" : "#FFFFFF"}
            />
          </NeoCard>

          {/* Notifications & Reminders Row */}
          <NeoCard color={theme.card} style={styles.settingRowCard}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: notificationsEnabled
                      ? "#F7CB54"
                      : isDark
                      ? "#4B443B"
                      : "#F5F0E8",
                  },
                ]}
              >
                <Bell size={20} color="#000000" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  Pengingat Simpanan
                </Text>
                <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                  {notificationsEnabled
                    ? "Ingatkan saat simpanan menumpuk"
                    : "Mati"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#E5E1D8", true: "#F7CB54" }}
              thumbColor={notificationsEnabled ? "#000000" : "#FFFFFF"}
            />
          </NeoCard>


        </View>

        {/* Data, Cloud & Panduan */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            SISTEM & PENYIMPANAN
          </Text>

          {/* Cloud Sync */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/settings/cloud-sync");
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: cloudSyncEnabled ? "#A6E3D1" : "#8FC9FF",
                    },
                  ]}
                >
                  <Cloud size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Sinkronisasi Cloud
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    {cloudSyncEnabled
                      ? "Aktif"
                      : "Offline · Data tersimpan di HP"}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>

          {/* Backup & Restore */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/settings/backup");
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: "#D0B7FF" }]}
                >
                  <HardDriveDownload size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Cadangan & Pemulihan
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Ekspor dan impor data format JSON
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>

          {/* Guide / How to Share */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/settings/guide");
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: "#FFB8D2" }]}
                >
                  <BookOpen size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Cara Simpan Link
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Panduan simpan dari Instagram, TikTok, dan web
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>

          {/* Re-run Onboarding Tour */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/onboarding");
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: "#F7CB54" }]}
                >
                  <Compass size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Tur Aplikasi
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Lihat kembali simulasi fitur SimpanIn
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>
        </View>

        {/* Maintenance / Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            DATA & PENGUJIAN
          </Text>

          {/* Load Sample Demo Data */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              setShowDemoConfirm(true);
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#FFE7A3" }]}>
                  <Sparkles size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Muat Data Contoh
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Isi contoh koleksi & link untuk dicoba
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              setShowResetConfirm(true);
            }}
            style={styles.touchableCard}
          >
            <NeoCard
              color={isDark ? "#3A1B1B" : "#FEE2E2"}
              style={styles.settingRowCard}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#EF4444" }]}>
                  <RotateCcw size={20} color="#FFFFFF" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.danger }]}>
                    Hapus Semua Data
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Kosongkan semua link dan koleksi
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.danger} />
            </NeoCard>
          </TouchableOpacity>
        </View>

        {/* Footer Brand */}
        <View style={styles.footerContainer}>
          <SimpanInMascot size={64} />
          <Text style={[styles.appName, { color: theme.text }]}>SimpanIn</Text>
          <Text style={[styles.appTagline, { color: theme.textMuted }]}>
            Simpan sekali. Temukan kapan saja.
          </Text>
          <Text style={[styles.versionLabel, { color: theme.textSecondary }]}>
            Versi 2.0.0 (Local-First Architecture)
          </Text>
        </View>
      </ScrollView>



      {/* Reset Confirmation Modal */}
      <NeoConfirmModal
        visible={showResetConfirm}
        title="Hapus semua data?"
        message="Semua link dan koleksi kustom akan dihapus permanen. Folder 'Belum Diurutkan' akan dikosongkan."
        confirmText="Hapus Semua"
        cancelText="Batal"
        isDestructive
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Demo Data Confirmation Modal */}
      <NeoConfirmModal
        visible={showDemoConfirm}
        title="Muat data contoh?"
        message="Aplikasi akan menambahkan koleksi contoh (Resep, Rumah, Liburan) beserta link sampel untuk dicoba."
        confirmText="Muat Data"
        cancelText="Batal"
        onConfirm={handleConfirmLoadDemo}
        onCancel={() => setShowDemoConfirm(false)}
      />
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
  bannerCard: {
    marginBottom: 20,
    padding: 14,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#000000",
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  statsCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  statDivider: {
    width: 1.5,
    height: 32,
  },
  touchableCard: {
    marginBottom: 10,
  },
  settingRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  rowTextCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  versionLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 6,
  },
});
