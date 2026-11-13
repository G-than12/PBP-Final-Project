import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { X, Check, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { PlatformLogo } from "../src/components/ui/PlatformLogo";
import { LinkThumbnail } from "../src/components/ui/LinkThumbnail";
import { NeoButton } from "../src/components/ui/NeoButton";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import { safeBack } from "../src/utils/navigation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FocusModeScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();
  const router = useRouter();

  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);
  const toggleReviewed = useSimpanInStore((state) => state.toggleReviewed);
  const markLinksReviewed = useSimpanInStore((state) => state.markLinksReviewed);

  // Review queue: prioritizes unreviewed links
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
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: "#141414" }]}>
        <SimpanInMascot size={90} />
        <Text style={[styles.emptyTitle, { color: "#FFFFFF" }]}>Semua simpanan rapi!</Text>
        <Text style={[styles.emptySub, { color: "#A09D95" }]}>
          Tidak ada simpanan yang menunggu untuk ditinjau saat ini.
        </Text>
        <NeoButton variant="yellow" size="lg" onPress={() => safeBack(router, "/home")}>
          Kembali ke Beranda
        </NeoButton>
      </SafeAreaView>
    );
  }

  const isCompleted = currentIndex >= queue.length;

  if (isCompleted) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: "#141414" }]}>
        <View style={styles.successCircle}>
          <Check size={48} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={[styles.completedTitle, { color: "#FFFFFF" }]}>
          Semua sudah kamu tinjau!
        </Text>
        <Text style={[styles.completedSub, { color: "#A09D95" }]}>
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
  const nextItem = currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;
  const collection =
    collections.find((c) => c.id === currentItem.collectionId) || collections[0];

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
      } else {
        Alert.alert("Error", "Tidak dapat membuka tautan: " + target);
      }
    } catch {
      Alert.alert("Error", "Gagal membuka tautan");
    }
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    if (!currentItem.isReviewed) {
      toggleReviewed(currentItem.id);
      setReviewedIds((prev) => [...prev, currentItem.id]);
    }
    setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      Haptics.selectionAsync();
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleCardPress = () => {
    Haptics.selectionAsync();
    // Navigates directly to Link Detail view matching Reference Image 2
    router.push(`/link/${currentItem.id}`);
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    if (reviewedIds.length > 0) {
      markLinksReviewed(reviewedIds);
    }
    safeBack(router, "/home");
  };

  const currentNum = String(currentIndex + 1).padStart(2, "0");
  const totalNum = String(queue.length).padStart(2, "0");

  // Format subtitle matching reference: e.g. "By Alippp | Hotel & Wisata"
  const subtitleAuthor = currentItem.author || currentItem.source || "Alippp";
  const subtitleCategory = collection?.name || "Hotel & Wisata";
  const subtitleText = `By ${subtitleAuthor} | ${subtitleCategory}`;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>SIMPANAN BARU</Text>
          <View style={styles.counterRow}>
            <Text style={styles.counterCurrent}>{currentNum}</Text>
            <Text style={styles.counterTotal}> / {totalNum}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          accessibilityLabel="Tutup Mode Fokus"
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Progress Bars matching reference (Active: Yellow, Inactive: Dark Grey) */}
      <View style={styles.progressRow}>
        {queue.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressBar,
              idx <= currentIndex ? styles.progressBarActive : styles.progressBarInactive,
            ]}
          />
        ))}
      </View>

      {/* Center Stack Card Section */}
      <View style={styles.stackWrapper}>
        {/* Next Card Peek (Stacked Card Effect behind main card) */}
        {nextItem ? (
          <View style={styles.stackedCardBack}>
            <View style={styles.stackedCardBackInner} />
          </View>
        ) : null}

        {/* Front Active Card matching Image 1 */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleCardPress}
          style={styles.frontCard}
        >
          {/* Card Top Row: Platform Icon + Name */}
          <View style={styles.platformRow}>
            <PlatformLogo platform={currentItem.source} size={24} />
            <Text style={styles.platformName}>
              {currentItem.source || "TikTok"}
            </Text>
          </View>

          {/* Media / Thumbnail Box */}
          <View style={styles.thumbnailContainer}>
            <LinkThumbnail
              image={currentItem.image}
              tags={currentItem.tags}
              symbolSize="md"
              style={StyleSheet.absoluteFill}
            />

            {/* Floating Collection Badge at bottom-left */}
            <View style={styles.collectionPill}>
              <View
                style={[
                  styles.collectionColorBox,
                  { backgroundColor: collection.color || "#F7CB54" },
                ]}
              />
              <Text style={styles.collectionPillText}>{collection.name}</Text>
            </View>
          </View>

          {/* Highlights: Title (truncated, concise) and Subtitle */}
          <View style={styles.cardContent}>
            <Text
              style={styles.cardTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {currentItem.title}
            </Text>

            <Text
              style={styles.cardSubtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitleText}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls matching reference */}
      <View style={styles.bottomControls}>
        {/* Left Arrow Button */}
        <TouchableOpacity
          style={[
            styles.arrowBtn,
            currentIndex === 0 && styles.arrowBtnDisabled,
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
          accessibilityLabel="Sebelumnya"
        >
          <ArrowLeft
            size={22}
            color={currentIndex === 0 ? "#55524B" : "#FFFFFF"}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* Center Yellow "Buka link ↗" Button */}
        <TouchableOpacity
          style={styles.openLinkBtn}
          onPress={handleOpenLink}
          activeOpacity={0.85}
          accessibilityLabel="Buka tautan"
        >
          <Text style={styles.openLinkText}>Buka link</Text>
          <ExternalLink size={18} color="#000000" strokeWidth={3} />
        </TouchableOpacity>

        {/* Right Arrow Button */}
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={handleNext}
          accessibilityLabel="Berikutnya"
        >
          <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 18,
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 24,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#8E8B85",
    marginBottom: 2,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  counterCurrent: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  counterTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6E6B65",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#222220",
    borderWidth: 1.5,
    borderColor: "#3A3834",
    justifyContent: "center",
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: "#F7CB54",
  },
  progressBarInactive: {
    backgroundColor: "#2E2C28",
  },
  stackWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    position: "relative",
  },
  stackedCardBack: {
    position: "absolute",
    width: SCREEN_WIDTH - 44,
    height: 430,
    borderRadius: 24,
    backgroundColor: "#2A2927",
    borderWidth: 1.5,
    borderColor: "#3E3B36",
    right: 14,
    top: "50%",
    marginTop: -215,
    transform: [{ scaleY: 0.96 }],
    zIndex: 1,
  },
  stackedCardBackInner: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#22211F",
  },
  frontCard: {
    width: SCREEN_WIDTH - 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    zIndex: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
  thumbnailContainer: {
    height: 250,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#000000",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E1D8",
  },
  collectionPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  collectionColorBox: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  collectionPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  cardContent: {
    marginTop: 14,
    paddingHorizontal: 2,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 25,
    color: "#000000",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666158",
    marginTop: 6,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 12,
  },
  arrowBtn: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#222220",
    borderWidth: 1.5,
    borderColor: "#3A3834",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  openLinkBtn: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  openLinkText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
});
