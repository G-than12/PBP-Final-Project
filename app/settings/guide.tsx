import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Share2,
  Copy,
  FolderPlus,
  Compass,
  CheckCircle2,
  Smartphone,
  ExternalLink,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoCard } from "../../src/components/ui/NeoCard";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { SimpanInMascot } from "../../src/components/ui/SimpanInMascot";
import { SaveLinkSheet } from "../../src/components/sheets/SaveLinkSheet";
import { CollectionFormSheet } from "../../src/components/sheets/CollectionFormSheet";
import { safeBack } from "../../src/utils/navigation";

const TUTORIAL_STEPS = [
  {
    step: "1",
    badgeColor: "#F7CB54",
    title: "Temukan Konten Favorit",
    description:
      "Buka aplikasi media sosial apa pun seperti Instagram Reels, TikTok, Pinterest, Twitter/X, YouTube, atau peramban Chrome.",
    icon: Compass,
  },
  {
    step: "2",
    badgeColor: "#FF8C79",
    title: "Ketuk Tombol Bagikan (Share)",
    description:
      "Cari ikon pesawat kertas pada Instagram, panah melengkung di TikTok, atau menu 'Bagikan' di browser pilihan Anda.",
    icon: Share2,
  },
  {
    step: "3",
    badgeColor: "#8FC9FF",
    title: "Salin Tautan (Copy Link)",
    description:
      "Pilih 'Salin Tautan' (Copy Link) dari menu bagikan sistem operasi ponsel Anda ke papan klip (clipboard).",
    icon: Copy,
  },
  {
    step: "4",
    badgeColor: "#A6E3D1",
    title: "Simpan & Kategorikan di SimpanIn",
    description:
      "Buka aplikasi SimpanIn. Tautan akan terdeteksi otomatis! Pilih koleksi, tambahkan tag atau catatan penting, lalu simpan.",
    icon: FolderPlus,
  },
];

const PLATFORMS = [
  {
    name: "Instagram",
    color: "#E1306C",
    tip: "Sangat cocok untuk Reels resep makanan, tips olahraga, dan inspirasi outfit.",
  },
  {
    name: "TikTok",
    color: "#000000",
    tip: "Simpan video tutorial memasak, lifehacks, dan rekomendasi tempat wisata.",
  },
  {
    name: "Pinterest",
    color: "#BD081C",
    tip: "Kumpulkan moodboard desain interior rumah, arsitektur, dan referensi seni.",
  },
  {
    name: "Web & Artikel",
    color: "#2563EB",
    tip: "Simpan artikel berita, jurnal akademik, dan dokumentasi koding untuk dibaca nanti.",
  },
];

export default function GuideScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const collections = useSimpanInStore((state) => state.collections);
  const addLink = useSimpanInStore((state) => state.addLink);
  const addCollection = useSimpanInStore((state) => state.addCollection);

  const [showSimulateSheet, setShowSimulateSheet] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

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
          Panduan Simpan Link
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Hero */}
        <NeoCard color="#FFB8D2" style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Smartphone size={28} color="#000000" strokeWidth={2.2} />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>Simpan dari Aplikasi Apa Pun</Text>
              <Text style={styles.heroSubtitle}>
                SimpanIn dirancang agar Anda bisa mengarsipkan tautan berharga dari mana
                saja hanya dalam hitungan detik.
              </Text>
            </View>
          </View>
        </NeoCard>

        {/* 4 Interactive Steps */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            4 LANGKAH MUDAH
          </Text>

          {TUTORIAL_STEPS.map((item) => {
            const IconComp = item.icon;
            return (
              <NeoCard
                key={item.step}
                color={theme.card}
                style={styles.stepCard}
              >
                <View style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepBadge,
                      { backgroundColor: item.badgeColor },
                    ]}
                  >
                    <Text style={styles.stepBadgeNumber}>{item.step}</Text>
                  </View>
                  <View style={styles.stepTextCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={[styles.stepTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      <IconComp size={18} color="#000000" />
                    </View>
                    <Text
                      style={[styles.stepDesc, { color: theme.textMuted }]}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
              </NeoCard>
            );
          })}
        </View>

        {/* Interactive Simulation Trigger */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            COBA LANGSUNG
          </Text>
          <NeoCard color={theme.card} style={styles.cardBox}>
            <Text style={[styles.simTitle, { color: theme.text }]}>
              Ingin mencoba alur simpan sekarang?
            </Text>
            <Text style={[styles.simSub, { color: theme.textMuted }]}>
              Buka formulir penyimpanan cepat untuk mencoba menempelkan link dan
              memasukkannya ke koleksi.
            </Text>
            <View style={styles.simBtnWrapper}>
              <NeoButton
                variant="yellow"
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowSimulateSheet(true);
                }}
                icon={<FolderPlus size={18} color="#000000" />}
              >
                Buka Formulir Simpan Link
              </NeoButton>
            </View>
          </NeoCard>
        </View>

        {/* Tips per Platform */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            TIPS PLATFORM POPULER
          </Text>

          {PLATFORMS.map((p) => (
            <NeoCard
              key={p.name}
              color={theme.cardSecondary}
              style={styles.platformCard}
            >
              <View style={styles.platformHeader}>
                <View
                  style={[
                    styles.platformDot,
                    { backgroundColor: p.color },
                  ]}
                />
                <Text style={[styles.platformName, { color: theme.text }]}>
                  {p.name}
                </Text>
              </View>
              <Text style={[styles.platformTip, { color: theme.textMuted }]}>
                {p.tip}
              </Text>
            </NeoCard>
          ))}
        </View>

        {/* Mascot Mascot Guide */}
        <View style={styles.mascotBanner}>
          <SimpanInMascot size={56} />
          <Text style={[styles.mascotTip, { color: theme.textMuted }]}>
            "Simpan sekali. Temukan kapan saja!" Semua tautan yang Anda simpan akan
            selalu siap dibuka kembali di Mode Fokus atau pencarian global.
          </Text>
        </View>
      </ScrollView>

      {/* Save Link Sheet Trigger */}
      <SaveLinkSheet
        visible={showSimulateSheet}
        collections={collections}
        onClose={() => setShowSimulateSheet(false)}
        onSave={(data) => {
          addLink(data);
          setShowSimulateSheet(false);
          Alert.alert("Tautan Disimpan!", `Tautan "${data.title}" berhasil disimpan.`);
        }}
        onRequestCreateCollection={() => {
          setShowSimulateSheet(false);
          setShowCreateCollection(true);
        }}
      />

      {/* Collection Form Sheet */}
      <CollectionFormSheet
        visible={showCreateCollection}
        existingCollections={collections}
        onClose={() => setShowCreateCollection(false)}
        onSave={(data) => {
          addCollection(data);
          setShowCreateCollection(false);
          setShowSimulateSheet(true);
        }}
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
  stepCard: {
    padding: 14,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  cardBox: {
    padding: 16,
  },
  simTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  simSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  simBtnWrapper: {
    marginTop: 14,
  },
  platformCard: {
    padding: 14,
    marginBottom: 8,
  },
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  platformDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  platformName: {
    fontSize: 13,
    fontWeight: "800",
  },
  platformTip: {
    fontSize: 12,
    lineHeight: 16,
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
