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
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { NeoConfirmModal } from "../../src/components/ui/NeoConfirmModal";
import { HomeTitleEditorSheet } from "../../src/components/sheets/HomeTitleEditorSheet";
import { safeBack } from "../../src/utils/navigation";

export default function SettingsMainScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const setDarkMode = useSimpanInStore((state) => state.setDarkMode);
  const homeTitle = useSimpanInStore((state) => state.settings.homeTitle);
  const setHomeTitle = useSimpanInStore((state) => state.setHomeTitle);
  const cloudSyncEnabled = useSimpanInStore(
    (state) => state.settings.cloudSyncEnabled
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
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const totalLinks = items.length;
  const totalCollections = collections.length;
  const pinnedLinks = items.filter((i) => i.isPinned).length;
  const reviewedLinks = items.filter((i) => i.isReviewed).length;

  const handleToggleDarkMode = (val: boolean) => {
    Haptics.selectionAsync();
    setDarkMode(val);
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
            { backgroundColor: theme.surface, borderColor: theme.border },
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
        {/* Unlocked & Academic Free Rule Banner */}
        <NeoCard color="#F7CB54" style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconBadge}>
              <Sparkles size={22} color="#000000" strokeWidth={2.5} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>100% Bebas & Terbuka</Text>
              <Text style={styles.bannerSubtitle}>
                Akses tanpa batas: Buat koleksi bertingkat, simpan tautan, dan tandai
                tag sebanyak yang Anda inginkan tanpa batasan kuota.
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
                  Mode Gelap (Dark Mode)
                </Text>
                <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                  {isDark ? "Tema gelap kontras aktif" : "Tema terang neobrutalist aktif"}
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

          {/* Edit Home Title */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              setShowTitleEditor(true);
            }}
            style={styles.touchableCard}
          >
            <NeoCard color={theme.card} style={styles.settingRowCard}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: "#FF8C79" }]}
                >
                  <Type size={20} color="#000000" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Judul Beranda
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    "{homeTitle[0]} {homeTitle[1]}"
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </NeoCard>
          </TouchableOpacity>
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
                      ? "Aktif · Pencadangan terenkripsi"
                      : "Lokal-first · Data aman di perangkat Anda"}
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
                    Panduan Berbagi Link
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Cara menyimpan link dari IG, TikTok, X, & Browser
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
            ZONA PEMELIHARAAN & PENGUJIAN
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
                    Muat Contoh Data Demo
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Isi sampel koleksi (Resep, Rumah, Liburan) & link untuk presentasi
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
                    Reset ke Database Bersih
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    Kembalikan ke kondisi awal (hanya "Belum Diurutkan")
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

      {/* Title Editor Sheet */}
      <HomeTitleEditorSheet
        visible={showTitleEditor}
        currentTitle={homeTitle}
        onClose={() => setShowTitleEditor(false)}
        onSave={(newTitle) => setHomeTitle(newTitle)}
      />

      {/* Reset Confirmation Modal */}
      <NeoConfirmModal
        visible={showResetConfirm}
        title="Reset Semua Data?"
        message="Tindakan ini akan mengosongkan semua link dan koleksi kustom. Ruang kerja Anda akan dimulai fresh hanya dengan koleksi 'Belum Diurutkan'. Pastikan Anda sudah membuat cadangan data jika diperlukan."
        confirmText="Ya, Reset Sekarang"
        cancelText="Batal"
        isDestructive
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Demo Data Confirmation Modal */}
      <NeoConfirmModal
        visible={showDemoConfirm}
        title="Muat Data Sampel Demo?"
        message="Aplikasi akan memuat contoh koleksi (Resep Lezat, Inspirasi Rumah, Liburan) beserta tautan sampel TikTok, Pinterest, Instagram, dan Web untuk keperluan pengujian dan presentasi."
        confirmText="Muat Sampel"
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
