import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Pin,
  Edit3,
  Share2,
  Folder,
  RotateCcw,
  Trash2,
  ExternalLink,
  Plus,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { NeoConfirmModal } from "../../src/components/ui/NeoConfirmModal";
import { MoveCollectionSheet } from "../../src/components/sheets/MoveCollectionSheet";
import { TagManagerSheet } from "../../src/components/sheets/TagManagerSheet";
import { formatDateRelative } from "../../src/utils/metadataParser";
import { safeBack } from "../../src/utils/navigation";

export default function LinkDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const updateLink = useSimpanInStore((state) => state.updateLink);
  const deleteLink = useSimpanInStore((state) => state.deleteLink);
  const togglePin = useSimpanInStore((state) => state.togglePin);
  const moveLink = useSimpanInStore((state) => state.moveLink);
  const addTag = useSimpanInStore((state) => state.addTag);
  const removeTag = useSimpanInStore((state) => state.removeTag);

  const [showMoveSheet, setShowMoveSheet] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const currentItem = useMemo(() => {
    return items.find((i) => i.id === id);
  }, [items, id]);

  const currentCollection = useMemo(() => {
    if (!currentItem) return collections[0];
    return collections.find((c) => c.id === currentItem.collectionId) || collections[0];
  }, [collections, currentItem]);

  if (!currentItem) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textMuted }]}>
          Simpanan tidak ditemukan.
        </Text>
        <NeoButton variant="primary" size="md" onPress={() => router.replace("/home")}>
          Kembali ke Beranda
        </NeoButton>
      </SafeAreaView>
    );
  }

  // Visual background & symbol matching Figma
  const getVisualConfig = () => {
    const imgType =
      currentItem.image ||
      (currentItem.tags.includes("resep")
        ? "food"
        : currentItem.tags.includes("interior")
        ? "home"
        : currentItem.tags.includes("jepang")
        ? "travel"
        : "web");

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
      } else {
        Alert.alert("Tidak dapat membuka tautan", target);
      }
    } catch {
      Alert.alert("Gagal membuka tautan");
    }
  };

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentItem.url, {
          dialogTitle: currentItem.title,
        });
      } else {
        await Clipboard.setStringAsync(currentItem.url);
        Alert.alert("Tautan Disalin", "Tautan telah disalin ke papan klip.");
      }
    } catch {
      await Clipboard.setStringAsync(currentItem.url);
      Alert.alert("Tautan Disalin", "Tautan telah disalin ke papan klip.");
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteLink(currentItem.id);
    safeBack(router, "/home");
  };

  const handleSaveTitle = () => {
    Haptics.selectionAsync();
    if (editedTitle.trim()) {
      updateLink(currentItem.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Figma Detail Hero Banner */}
        <View style={[styles.detailHero, { backgroundColor: visual.bg }]}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.heroBackBtn}
            onPress={() => {
              Haptics.selectionAsync();
              safeBack(router, "/home");
            }}
            accessibilityLabel="Kembali"
          >
            <ChevronLeft size={22} color="#000000" />
          </TouchableOpacity>

          {/* Giant Symbol */}
          <Text style={styles.heroGiantSymbol}>{visual.symbol}</Text>

          {/* Pin toggle button */}
          <TouchableOpacity
            style={[
              styles.heroPinBtn,
              currentItem.isPinned && styles.heroPinBtnActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              togglePin(currentItem.id);
            }}
            accessibilityLabel="Sematkan Tautan"
          >
            <Pin
              size={18}
              color="#000000"
              fill={currentItem.isPinned ? "#000000" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Figma Detail Body */}
        <View style={styles.detailBody}>
          {/* Platform Badge */}
          <View style={styles.platformBadge}>
            <Text style={styles.platformBadgeText}>{currentItem.source || "WEB"}</Text>
          </View>

          {/* Title with edit button */}
          <View style={styles.titleRow}>
            {isEditingTitle ? (
              <View style={styles.titleEditBox}>
                <TextInput
                  style={[styles.titleInput, { color: theme.text }]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  autoFocus
                  onSubmitEditing={handleSaveTitle}
                />
                <TouchableOpacity style={styles.titleSaveBtn} onPress={handleSaveTitle}>
                  <Text style={styles.titleSaveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.titleDisplayRow}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  {currentItem.title}
                </Text>
                <TouchableOpacity
                  style={styles.editTitleBtn}
                  onPress={() => {
                    setEditedTitle(currentItem.title);
                    setIsEditingTitle(true);
                  }}
                >
                  <Edit3 size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Collection Pill + Date */}
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={[styles.collectionPill, { backgroundColor: currentCollection.color }]}
              onPress={() => router.push(`/collection/${currentCollection.id}`)}
            >
              <Text style={styles.collectionPillText}>{currentCollection.name}</Text>
            </TouchableOpacity>
            <Text style={[styles.metaDate, { color: theme.textSecondary }]}>
              Disimpan {formatDateRelative(currentItem.createdAt)}
            </Text>
          </View>

          {/* Open Link Button */}
          <View style={styles.btnWrapper}>
            <NeoButton
              variant="yellow"
              size="lg"
              icon={<ExternalLink size={18} color="#000000" />}
              onPress={handleOpenLink}
            >
              Buka link ↗
            </NeoButton>
          </View>

          {/* 4 Action Buttons Row matching Figma */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" }]}
              onPress={handleShare}
            >
              <Share2 size={16} color={theme.text} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Bagikan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" }]}
              onPress={() => setShowMoveSheet(true)}
            >
              <Folder size={16} color={theme.text} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Pindahkan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" }]}
              onPress={() => setShowReloadConfirm(true)}
            >
              <RotateCcw size={16} color={theme.text} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Muat Ulang</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Hapus</Text>
            </TouchableOpacity>
          </View>

          {/* Section: DESKRIPSI */}
          {currentItem.description ? (
            <View style={styles.detailSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                DESKRIPSI
              </Text>
              <Text style={[styles.descText, { color: theme.text }]}>
                {currentItem.description}
              </Text>
            </View>
          ) : null}

          {/* Section: TAG */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              TAG
            </Text>
            <View style={styles.tagsContainer}>
              {currentItem.tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    removeTag(currentItem.id, tag);
                  }}
                >
                  <Text style={[styles.tagPillText, { color: theme.text }]}>#{tag} ×</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.addTagBtn, { borderColor: isDark ? "#4A4640" : "#000000" }]}
                onPress={() => setShowTagSheet(true)}
              >
                <Plus size={12} color={theme.text} strokeWidth={3} />
                <Text style={[styles.addTagBtnText, { color: theme.text }]}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: CATATAN */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              CATATAN
            </Text>
            <TextInput
              style={[
                styles.notesTextarea,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? "#4A4640" : "#000000",
                  color: theme.text,
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="Ketuk untuk menambahkan catatan..."
              placeholderTextColor={theme.textSecondary}
              value={currentItem.notes}
              onChangeText={(txt) => updateLink(currentItem.id, { notes: txt })}
            />
          </View>
        </View>
      </ScrollView>

      {/* Move Collection Sheet */}
      <MoveCollectionSheet
        visible={showMoveSheet}
        collections={collections}
        currentCollectionId={currentItem.collectionId}
        onClose={() => setShowMoveSheet(false)}
        onMove={(newColId) => {
          moveLink(currentItem.id, newColId);
          setShowMoveSheet(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />

      {/* Tag Manager Sheet */}
      <TagManagerSheet
        visible={showTagSheet}
        tags={currentItem.tags}
        onClose={() => setShowTagSheet(false)}
        onAddTag={(tag) => addTag(currentItem.id, tag)}
        onRemoveTag={(tag) => removeTag(currentItem.id, tag)}
      />

      {/* Reload Metadata Modal */}
      <NeoConfirmModal
        visible={showReloadConfirm}
        title="Muat Ulang Metadata Link?"
        message="Muat Ulang akan memperbarui pratinjau link. Catatan, status sematan, dan koleksimu tidak akan berubah."
        confirmText="Ya, Muat Ulang"
        cancelText="Batal"
        onConfirm={() => {
          setShowReloadConfirm(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Metadata Diperbarui", "Data pratinjau telah disegarkan.");
        }}
        onCancel={() => setShowReloadConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <NeoConfirmModal
        visible={showDeleteConfirm}
        title="Hapus Link Ini?"
        message="Link ini akan dihapus secara permanen dari SimpanIn. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
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
  notFoundText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  detailHero: {
    height: 280,
    borderBottomWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroBackBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    zIndex: 2,
  },
  heroPinBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    zIndex: 2,
  },
  heroPinBtnActive: {
    backgroundColor: "#F7CB54",
  },
  heroGiantSymbol: {
    fontSize: 92,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  detailBody: {
    padding: 20,
  },
  platformBadge: {
    backgroundColor: "#111111",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  titleRow: {
    marginBottom: 12,
  },
  titleDisplayRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  editTitleBtn: {
    padding: 6,
  },
  titleEditBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
  },
  titleSaveBtn: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  titleSaveBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  collectionPill: {
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  collectionPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  metaDate: {
    fontSize: 11,
    fontWeight: "600",
  },
  btnWrapper: {
    marginBottom: 18,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  actionBtnDanger: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F87171",
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: "800",
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  addTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F7CB54",
  },
  addTagBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  notesTextarea: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontWeight: "500",
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
