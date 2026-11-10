import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Share2, Folder, Layers } from "lucide-react-native";
import { Collection, SavedItem } from "../../types/models";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { NeoCard } from "../ui/NeoCard";

interface ShareCollectionSheetProps {
  visible: boolean;
  collection: Collection;
  items: SavedItem[];
  subcollections: Collection[];
  onClose: () => void;
}

export function ShareCollectionSheet({
  visible,
  collection,
  items,
  subcollections,
  onClose,
}: ShareCollectionSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [shareScope, setShareScope] = useState<"top" | "all">("top");

  const topLevelCount = items.filter((i) => i.collectionId === collection.id).length;
  const subIds = new Set(subcollections.map((s) => s.id));
  const allCount = items.filter((i) => i.collectionId === collection.id || subIds.has(i.collectionId)).length;

  const handleShare = async () => {
    Haptics.selectionAsync();

    const targetItems =
      shareScope === "top"
        ? items.filter((i) => i.collectionId === collection.id)
        : items.filter((i) => i.collectionId === collection.id || subIds.has(i.collectionId));

    const exportText = [
      `📂 Koleksi SimpanIn: ${collection.name}`,
      `Total: ${targetItems.length} simpanan`,
      "---",
      ...targetItems.map(
        (it, idx) => `${idx + 1}. ${it.title}\n   ${it.url}`
      ),
    ].join("\n\n");

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Can share via native dialog
        await Clipboard.setStringAsync(exportText);
        Alert.alert(
          "Tautan Koleksi Disalin",
          `Daftar ${targetItems.length} simpanan telah disalin ke papan klip untuk dibagikan.`
        );
      } else {
        await Clipboard.setStringAsync(exportText);
        Alert.alert(
          "Tautan Koleksi Disalin",
          `Daftar ${targetItems.length} simpanan telah disalin ke papan klip untuk dibagikan.`
        );
      }
      onClose();
    } catch {
      await Clipboard.setStringAsync(exportText);
      Alert.alert("Berhasil Disalin", "Daftar simpanan telah disalin.");
      onClose();
    }
  };

  return (
    <NeoBottomSheet visible={visible} title="Pilih yang Mau Dibagikan" onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.desc, { color: theme.textMuted }]}>
          Pilih cakupan simpanan yang ingin kamu bagikan dari koleksi "{collection.name}".
        </Text>

        {/* Option 1: Tingkat atas */}
        <NeoCard
          color={shareScope === "top" ? "#F7CB54" : theme.cardSecondary}
          style={styles.optionCard}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <Folder size={20} color="#000000" />
              <Text style={styles.optionTitle}>Tingkat Atas Saja</Text>
            </View>
            <NeoButton
              size="sm"
              variant={shareScope === "top" ? "primary" : "secondary"}
              onPress={() => setShareScope("top")}
            >
              {shareScope === "top" ? "Dipilih" : "Pilih"}
            </NeoButton>
          </View>
          <Text style={styles.optionCount}>{topLevelCount} simpanan langsung</Text>
        </NeoCard>

        {/* Option 2: Semua link termasuk subkoleksi */}
        <NeoCard
          color={shareScope === "all" ? "#F7CB54" : theme.cardSecondary}
          style={styles.optionCard}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <Layers size={20} color="#000000" />
              <Text style={styles.optionTitle}>Semua Link & Subkoleksi</Text>
            </View>
            <NeoButton
              size="sm"
              variant={shareScope === "all" ? "primary" : "secondary"}
              onPress={() => setShareScope("all")}
            >
              {shareScope === "all" ? "Dipilih" : "Pilih"}
            </NeoButton>
          </View>
          <Text style={styles.optionCount}>
            {allCount} total simpanan ({subcollections.length} subkoleksi)
          </Text>
        </NeoCard>

        <NeoButton
          variant="primary"
          size="lg"
          icon={<Share2 size={18} color="#FFFFFF" />}
          onPress={handleShare}
          style={styles.shareBtn}
        >
          Bagikan Koleksi Sekarang
        </NeoButton>
      </View>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
  },
  optionCount: {
    fontSize: 12,
    color: "#666158",
    marginTop: 6,
    fontWeight: "600",
  },
  shareBtn: {
    marginTop: 8,
  },
});

