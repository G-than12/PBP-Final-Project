import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Bookmark,
  ShieldCheck,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { exportBackup, importBackup } from "../../src/utils/backupManager";
import { safeBack } from "../../src/utils/navigation";

export default function BackupScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    Haptics.selectionAsync();
    setIsExporting(true);
    try {
      const res = await exportBackup();
      if (res) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Ekspor Berhasil",
          `Berkas cadangan berisi ${collections.length} koleksi dan ${items.length} tautan telah berhasil diekspor.`
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Gagal Mengekspor",
        err?.message || "Terjadi kendala saat membuat berkas cadangan."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    Haptics.selectionAsync();
    setIsImporting(true);
    try {
      const res = await importBackup();
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Pemulihan Berhasil",
          `${res.count} tautan dan koleksi terkait telah berhasil diimpor ke ruang kerja SimpanIn Anda.`
        );
      } else if (res.error) {
        Alert.alert("Gagal Mengimpor", res.error);
      }
    } catch (err: any) {
      Alert.alert(
        "Gagal Mengimpor",
        err?.message || "Gagal membaca atau memproses berkas cadangan."
      );
    } finally {
      setIsImporting(false);
    }
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
          Cadangan & Pemulihan
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Hero */}
        <NeoCard color="#D0B7FF" style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <FileJson size={28} color="#000000" strokeWidth={2.2} />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>Format JSON Terbuka</Text>
              <Text style={styles.heroSubtitle}>
                Cadangan Anda disimpan dalam format JSON murni. Kompatibel dengan semua
                perangkat (Web, Android, iOS) tanpa ketergantungan server berbayar.
              </Text>
            </View>
          </View>
        </NeoCard>

        {/* Section Ekspor */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            EKSPOR CADANGAN
          </Text>

          <NeoCard color={theme.card} style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <View
                style={[styles.actionIconBox, { backgroundColor: "#F7CB54" }]}
              >
                <Download size={22} color="#000000" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Unduh Berkas Cadangan
                </Text>
                <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                  Mencakup semua koleksi, subkoleksi, tag, catatan, dan tautan Anda.
                </Text>
              </View>
            </View>

            {/* Quick summary badges */}
            <View style={styles.badgeRow}>
              <View style={[styles.badgeItem, { backgroundColor: theme.cardSecondary }]}>
                <FolderTree size={14} color="#000000" />
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {collections.length} Koleksi
                </Text>
              </View>
              <View style={[styles.badgeItem, { backgroundColor: theme.cardSecondary }]}>
                <Bookmark size={14} color="#000000" />
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {items.length} Tautan
                </Text>
              </View>
            </View>

            <View style={styles.btnWrapper}>
              <NeoButton
                variant="yellow"
                onPress={handleExport}
                disabled={isExporting}
                icon={
                  isExporting ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Download size={18} color="#000000" />
                  )
                }
              >
                {isExporting ? "Membuat Cadangan..." : "Ekspor Sekarang (JSON)"}
              </NeoButton>
            </View>
          </NeoCard>
        </View>

        {/* Section Impor */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            PEMULIHAN DATA
          </Text>

          <NeoCard color={theme.card} style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <View
                style={[styles.actionIconBox, { backgroundColor: "#8FC9FF" }]}
              >
                <Upload size={22} color="#000000" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Impor Berkas Cadangan
                </Text>
                <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                  Pilih berkas .json yang sebelumnya diekspor dari aplikasi SimpanIn.
                </Text>
              </View>
            </View>

            <View style={[styles.infoBanner, { backgroundColor: "#E9F5FE" }]}>
              <ShieldCheck size={18} color="#0284C7" />
              <Text style={styles.infoBannerText}>
                Impor bersifat aman (non-destructive). Data baru akan digabungkan secara
                otomatis tanpa menghapus simpanan Anda yang sudah ada.
              </Text>
            </View>

            <View style={styles.btnWrapper}>
              <NeoButton
                variant="secondary"
                onPress={handleImport}
                disabled={isImporting}
                icon={
                  isImporting ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Upload size={18} color="#000000" />
                  )
                }
              >
                {isImporting ? "Membaca Berkas..." : "Pilih Berkas JSON"}
              </NeoButton>
            </View>
          </NeoCard>
        </View>

        {/* Schema Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            STRUKTUR DATA CADANGAN
          </Text>

          <NeoCard color={theme.cardSecondary} style={styles.codeCard}>
            <Text style={[styles.codeText, { color: theme.text }]}>
              {`{\n  "app": "SimpanIn",\n  "version": "2.0.0",\n  "collections": [ ... ],\n  "items": [ ... ],\n  "exportedAt": "2026-11-10T..."\n}`}
            </Text>
          </NeoCard>
        </View>

        {/* Mascot Helper */}
        <View style={styles.mascotBanner}>
          <SimpanInMascot size={54} />
          <Text style={[styles.mascotTip, { color: theme.textMuted }]}>
            Cadangan Anda sepenuhnya bebas dari kunci vendor. Anda dapat membukanya
            dengan teks editor apa saja!
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
    color: "#282522",
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  btnWrapper: {
    marginTop: 14,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#0284C7",
    marginTop: 14,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#0369A1",
    lineHeight: 16,
    fontWeight: "600",
  },
  codeCard: {
    padding: 14,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
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
