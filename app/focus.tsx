import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { X, Check, ExternalLink, Bookmark } from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { extractDomain } from "../src/utils/metadataParser";
import { AppIcon } from "../src/components/ui/AppIcon";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import { NeoButton } from "../src/components/ui/NeoButton";
import { NeoCard } from "../src/components/ui/NeoCard";
import { safeBack } from "../src/utils/navigation";

export default function FocusModeScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);
  const toggleReviewed = useSimpanInStore((state) => state.toggleReviewed);
  const markLinksReviewed = useSimpanInStore((state) => state.markLinksReviewed);

  // Review queue
  const queue = useMemo(() => {
    let pool = [...items];
    if (collectionId) {
      pool = pool.filter((i) => i.collectionId === collectionId);
    }
    const unreviewed = pool.filter((i) => !i.isReviewed);
    return unreviewed.length > 0 ? unreviewed : pool;
  }, [items, collectionId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  if (queue.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <SimpanInMascot size={90} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Semua simpanan rapi!</Text>
        <Text style={[styles.emptySub, { color: theme.textMuted }]}>
          Tidak ada simpanan yang menunggu untuk ditinjau saat ini.
        </Text>
        <NeoButton variant="primary" size="lg" onPress={() => safeBack(router, "/home")}>
          Kembali ke Beranda
        </NeoButton>
      </SafeAreaView>
    );
  }

  const isCompleted = currentIndex >= queue.length;

  if (isCompleted) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <View style={styles.successCircle}>
          <Check size={48} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={[styles.completedTitle, { color: theme.text }]}>
          Semua sudah kamu tinjau!
        </Text>
        <Text style={[styles.completedSub, { color: theme.textMuted }]}>
          Kerja bagus! Kamu telah meninjau {queue.length} simpanan di Mode Fokus.
        </Text>
        <NeoButton
          variant="yellow"
          size="lg"
          onPress={() => {
            Haptics.selectionAsync();
            if (reviewedIds.length > 0) {
              markLinksReviewed(reviewedIds);
            }
            safeBack(router, "/home");
          }}
        >
          Selesai & Simpan Progres
        </NeoButton>
      </SafeAreaView>
    );
  }

  const currentItem = queue[currentIndex];
  const collection = collections.find((c) => c.id === currentItem.collectionId) || collections[0];

  const getVisualConfig = () => {
    const imgType = currentItem.image || (currentItem.tags.includes("resep") ? "food" : currentItem.tags.includes("interior") ? "home" : currentItem.tags.includes("jepang") ? "travel" : "web");
    switch (imgType) {
      case "food":
        return { bg: "#ED7847", symbol: "15" };
      case "home":
        return { bg: "#9CD7BE", symbol: "⌂" };
      case "travel":
        return { bg: "#E7A997", symbol: "京都" };
      default:
        return { bg: "#9DC3E9", symbol: "↗" };
    }
  };

  const visual = getVisualConfig();

  const handleOpenLink = async () => {
    Haptics.selectionAsync();
    try {
      let target = currentItem.url.trim();
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "https://" + target;
      }
      const canOpen = await Linking.canOpenURL(target);
      if (canOpen) {
        await Linking.openURL(target);
      }
    } catch {
      Alert.alert("Error", "Gagal membuka tautan");
    }
  };

  const handleMarkReviewed = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleReviewed(currentItem.id);
    setReviewedIds([...reviewedIds, currentItem.id]);
    setCurrentIndex((i) => i + 1);
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    setCurrentIndex((i) => i + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.subHead, { color: theme.textSecondary }]}>
            MODE FOKUS
          </Text>
          <Text style={[styles.countText, { color: theme.text }]}>
            0{currentIndex + 1} / 0{queue.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.closeBtn,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            if (reviewedIds.length > 0) {
              markLinksReviewed(reviewedIds);
            }
            safeBack(router, "/home");
          }}
        >
          <X size={20} color={theme.text} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Progress Bars */}
      <View style={styles.progressRow}>
        {queue.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressBar,
              idx <= currentIndex && styles.progressBarActive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.cardWrapper} showsVerticalScrollIndicator={false}>
        {/* Tinder-style Focus Card */}
        <NeoCard style={styles.focusCard}>
          {/* Visual Hero Banner matching Figma */}
          <View style={[styles.visualHero, { backgroundColor: visual.bg }]}>
            <Text style={styles.visualSymbol}>{visual.symbol}</Text>
          </View>

          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: collection.color }]}>
              <AppIcon name={collection.icon} size={24} color="#000000" />
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.sourceText}>{currentItem.source || extractDomain(currentItem.url)}</Text>
              <View style={[styles.colChip, { backgroundColor: collection.color }]}>
                <Text style={styles.colChipText}>{collection.name}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{currentItem.title}</Text>

          {currentItem.description ? (
            <Text style={[styles.description, { color: theme.textMuted }]}>
              {currentItem.description}
            </Text>
          ) : null}

          {currentItem.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Catatan Kamu:</Text>
              <Text style={styles.notesBody}>{currentItem.notes}</Text>
            </View>
          ) : null}

          {currentItem.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {currentItem.tags.map((t) => (
                <View key={t} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>#{t}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.openBtn} onPress={handleOpenLink}>
            <ExternalLink size={16} color="#000000" />
            <Text style={styles.openBtnText}>Buka Tautan Asli di Browser</Text>
          </TouchableOpacity>
        </NeoCard>

        {/* Figma Help Prompt */}
        <View style={styles.focusHelp}>
          <Text style={[styles.focusHelpText, { color: theme.textMuted }]}>
            Mode Fokus menampilkan simpananmu satu per satu. Buka yang penting, lewati sisanya.
          </Text>
          <Text style={[styles.focusHelpSub, { color: theme.text }]}>
            {currentIndex === queue.length - 1
              ? "← Selesaikan tinjauan terakhirmu"
              : "Ketuk 'Selesai Ditinjau' untuk melanjutkan →"}
          </Text>
        </View>
      </ScrollView>

      {/* Tinder Actions Footer */}
      <View style={styles.footer}>
        <NeoButton
          variant="secondary"
          size="lg"
          onPress={handleSkip}
          style={styles.skipBtn}
        >
          Lewati
        </NeoButton>

        <NeoButton
          variant="yellow"
          size="lg"
          icon={<Check size={18} color="#000000" strokeWidth={3} />}
          onPress={handleMarkReviewed}
          style={styles.reviewBtn}
        >
          Selesai Ditinjau
        </NeoButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subHead: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  countText: {
    fontSize: 18,
    fontWeight: "900",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D6CFC4",
    borderWidth: 1,
    borderColor: "#000000",
  },
  progressBarActive: {
    backgroundColor: "#000000",
  },
  cardWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1,
    justifyContent: "center",
  },
  focusCard: {
    padding: 16,
    borderRadius: 16,
  },
  visualHero: {
    height: 140,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  visualSymbol: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  focusHelp: {
    marginTop: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  focusHelpText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  focusHelpSub: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  metaBox: {
    flex: 1,
  },
  sourceText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#666158",
    textTransform: "uppercase",
  },
  colChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginTop: 4,
  },
  colChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  notesBox: {
    backgroundColor: "#F5F0E8",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginBottom: 14,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#666158",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesBody: {
    fontSize: 13,
    color: "#000000",
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F0E8",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    gap: 8,
  },
  openBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },
  skipBtn: {
    flex: 1,
  },
  reviewBtn: {
    flex: 1.8,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#10B981",
    borderWidth: 2.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  completedSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
});
