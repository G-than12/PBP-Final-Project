import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import {
  Search,
  Settings,
  Folder,
  Plus,
  Clipboard as ClipboardIcon,
  Bell,
  Pin,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { Collection, SavedItem, SortOption } from "../src/types/models";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { extractFirstUrl, isFetchableUrl } from "../src/utils/metadataParser";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { ManilaFolderCard } from "../src/components/ui/ManilaFolderCard";
import { FigmaItemCard } from "../src/components/ui/FigmaItemCard";
import { FolderQuickActionModal, FolderActionTarget } from "../src/components/ui/FolderQuickActionModal";
import { ItemQuickActionModal, ItemActionTarget } from "../src/components/ui/ItemQuickActionModal";
import { NeoConfirmModal } from "../src/components/ui/NeoConfirmModal";
import { SaveLinkSheet } from "../src/components/sheets/SaveLinkSheet";
import { CollectionFormSheet } from "../src/components/sheets/CollectionFormSheet";
import { ShareCollectionSheet } from "../src/components/sheets/ShareCollectionSheet";
import { HomeTitleEditorSheet } from "../src/components/sheets/HomeTitleEditorSheet";

export default function HomeScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const homeTitle = useSimpanInStore((state) => state.settings.homeTitle);
  const setHomeTitle = useSimpanInStore((state) => state.setHomeTitle);
  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const sortOption = useSimpanInStore((state) => state.sortOption);
  const setSortOption = useSimpanInStore((state) => state.setSortOption);

  const addLink = useSimpanInStore((state) => state.addLink);
  const addCollection = useSimpanInStore((state) => state.addCollection);
  const updateCollection = useSimpanInStore((state) => state.updateCollection);
  const deleteCollection = useSimpanInStore((state) => state.deleteCollection);
  const togglePin = useSimpanInStore((state) => state.togglePin);
  const deleteLink = useSimpanInStore((state) => state.deleteLink);

  const [quickUrl, setQuickUrl] = useState("");
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [saveInitialUrl, setSaveInitialUrl] = useState("");
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  // Quick Action Modal states on folder long-press
  const [actionTarget, setActionTarget] = useState<FolderActionTarget | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [sharingCollection, setSharingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  // Quick Action Modal states on item long-press
  const [itemActionTarget, setItemActionTarget] = useState<ItemActionTarget | null>(null);
  const [deletingItem, setDeletingItem] = useState<SavedItem | null>(null);

  const handleOpenLink = async (item: SavedItem) => {
    try {
      await Linking.openURL(item.url);
    } catch {
      Alert.alert("Error", "Tidak dapat membuka tautan.");
    }
  };

  const handleShareItem = async (item: SavedItem) => {
    try {
      if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(item.url);
      } else {
        await Clipboard.setStringAsync(item.url);
        Alert.alert("Tautan Disalin", "URL berhasil disalin ke clipboard.");
      }
    } catch {
      await Clipboard.setStringAsync(item.url);
      Alert.alert("Tautan Disalin", "URL berhasil disalin ke clipboard.");
    }
  };

  const unreviewedCount = useMemo(() => {
    return items.filter((i) => !i.isReviewed).length;
  }, [items]);

  const pinnedItems = useMemo(() => {
    return items.filter((i) => i.isPinned);
  }, [items]);

  // Collection stats
  const collectionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const subcounts: Record<string, number> = {};

    items.forEach((it) => {
      counts[it.collectionId] = (counts[it.collectionId] || 0) + 1;
    });

    collections.forEach((c) => {
      if (c.parentId) {
        subcounts[c.parentId] = (subcounts[c.parentId] || 0) + 1;
      }
    });

    return { counts, subcounts };
  }, [items, collections]);

  // Root collections sorted
  const sortedCollections = useMemo(() => {
    const roots = collections.filter((c) => !c.parentId);
    return roots.sort((a, b) => {
      if (sortOption === "title") return a.name.localeCompare(b.name);
      if (sortOption === "oldest") return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });
  }, [collections, sortOption]);

  const cycleSort = () => {
    Haptics.selectionAsync();
    const next: SortOption =
      sortOption === "newest"
        ? "oldest"
        : sortOption === "oldest"
        ? "title"
        : "newest";
    setSortOption(next);
  };

  const handleQuickPaste = async () => {
    Haptics.selectionAsync();
    try {
      const text = await Clipboard.getStringAsync();
      const extracted = extractFirstUrl(text || "");
      if (extracted && /^https?:\/\//i.test(extracted) && isFetchableUrl(extracted)) {
        setQuickUrl(extracted);
      }
    } catch {
      // ignore
    }
  };

  const handleQuickSubmit = () => {
    Haptics.selectionAsync();
    const extracted = extractFirstUrl(quickUrl);
    if (extracted) {
      setSaveInitialUrl(extracted);
      setShowSaveSheet(true);
      setQuickUrl("");
    } else {
      setSaveInitialUrl("");
      setShowSaveSheet(true);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Figma Faithful Main Header */}
      <View style={[styles.mainHeader, { borderBottomColor: theme.border }]}>
        {/* Settings button on the left */}
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/settings");
          }}
          accessibilityLabel="Pengaturan"
        >
          <Settings size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Wordmark Center: Mascot small + SimpanIn */}
        <View style={styles.wordmark}>
          <SimpanInMascot size={34} />
          <Text style={[styles.wordmarkText, { color: theme.text }]}>SimpanIn</Text>
        </View>

        {/* Right buttons: Folder+ and Search */}
        <View style={styles.headerRightBtns}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setShowCollectionSheet(true);
            }}
            accessibilityLabel="Tambah Koleksi"
          >
            <Folder size={18} color={theme.text} />
            <View style={styles.plusMiniBadge}>
              <Text style={styles.plusMiniBadgeText}>+</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/search");
            }}
            accessibilityLabel="Cari"
          >
            <Search size={19} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero 2-Line Title */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync();
            setShowTitleEditor(true);
          }}
          style={styles.heroTitleBox}
        >
          <Text style={[styles.heroTitleText, { color: theme.text }]}>
            {homeTitle[0]}
          </Text>
          <Text style={[styles.heroTitleText, { color: theme.text }]}>
            {homeTitle[1]}
          </Text>
        </TouchableOpacity>

        {/* Quick Save Bar */}
        <View
          style={[
            styles.quickSaveBar,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.quickSavePasteBtn}
            onPress={handleQuickPaste}
            accessibilityLabel="Salin dari Papan Klip"
          >
            <ClipboardIcon size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TextInput
            style={[styles.quickSaveInput, { color: theme.text }]}
            placeholder="# Tempel link untuk simpan cepat"
            placeholderTextColor={theme.textSecondary}
            value={quickUrl}
            onChangeText={setQuickUrl}
            onSubmitEditing={handleQuickSubmit}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.quickSaveActionBtn}
            onPress={handleQuickSubmit}
            accessibilityLabel="Simpan Tautan"
          >
            <Plus size={20} color="#000000" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Unreviewed Prompt Banner */}
        {unreviewedCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.reviewCard,
              {
                borderColor: isDark ? "#4A4640" : "#000000",
                backgroundColor: isDark ? "#1C2E26" : "#EBFBF5",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/focus");
            }}
          >
            <View style={styles.reviewIconSquare}>
              <Bell size={18} color="#FFFFFF" strokeWidth={2.5} />
            </View>

            <View style={styles.reviewTextCol}>
              <Text style={[styles.reviewHeadline, { color: theme.text }]}>
                {unreviewedCount} simpanan baru menunggu
              </Text>
              <Text style={styles.reviewSubline}>Tinjau sekarang</Text>
            </View>

            <Text style={[styles.reviewArrow, { color: theme.text }]}>›</Text>
          </TouchableOpacity>
        )}

        {/* Koleksiku Grid Section */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Koleksiku</Text>
            <TouchableOpacity
              style={[
                styles.sortPill,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={cycleSort}
            >
              <Text style={[styles.sortPillText, { color: theme.text }]}>
                {sortOption === "newest"
                  ? "Terbaru ⌄"
                  : sortOption === "oldest"
                  ? "Terlama ⌄"
                  : "Nama A–Z ⌄"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2-column Manila Folder Grid */}
          <View style={styles.folderGrid}>
            {sortedCollections.map((col, index) => {
              const count = collectionStats.counts[col.id] || 0;
              const subcount = collectionStats.subcounts[col.id] || 0;
              const fresh = items.filter(
                (i) => i.collectionId === col.id && !i.isReviewed
              ).length;

              return (
                <View key={col.id} style={styles.gridItem}>
                  <ManilaFolderCard
                    collection={col}
                    itemCount={count}
                    subcollectionCount={subcount}
                    freshCount={fresh}
                    isMain={index === 0 && (col.isSystem || col.id === "inbox")}
                    onPress={() => {
                      router.push(`/collection/${col.id}`);
                    }}
                    onLongPress={(rect) => {
                      setActionTarget({
                        collection: col,
                        itemCount: count,
                        subcollectionCount: subcount,
                        freshCount: fresh,
                        isMain: index === 0 && (col.isSystem || col.id === "inbox"),
                        rect,
                      });
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Pinned Bookmarks Section */}
        {pinnedItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.pinnedTitleRow}>
                <Pin size={16} color={theme.text} />
                <Text style={[styles.sectionHeading, { color: theme.text }]}>
                  Disematkan ({pinnedItems.length})
                </Text>
              </View>
            </View>

            <View style={styles.folderGrid}>
              {pinnedItems.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <FigmaItemCard
                    item={item}
                    onPress={() => router.push(`/link/${item.id}`)}
                    onLongPress={(rect) => {
                      setItemActionTarget({
                        item,
                        rect,
                      });
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fabBtn}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.selectionAsync();
          setSaveInitialUrl("");
          setShowSaveSheet(true);
        }}
        accessibilityLabel="Tambah Simpanan Cepat"
      >
        <Plus size={28} color="#000000" strokeWidth={3} />
      </TouchableOpacity>

      {/* Save Link Sheet */}
      <SaveLinkSheet
        visible={showSaveSheet}
        collections={collections}
        initialUrl={saveInitialUrl}
        onClose={() => {
          setShowSaveSheet(false);
          setSaveInitialUrl("");
        }}
        onSave={(data) => {
          addLink(data);
          setShowSaveSheet(false);
          setSaveInitialUrl("");
        }}
        onRequestCreateCollection={() => {
          setShowSaveSheet(false);
          setSaveInitialUrl("");
          setShowCollectionSheet(true);
        }}
      />

      {/* Create / Edit Collection Sheet */}
      <CollectionFormSheet
        visible={showCollectionSheet}
        existingCollections={collections}
        onClose={() => setShowCollectionSheet(false)}
        onSave={(data) => {
          addCollection(data);
          setShowCollectionSheet(false);
        }}
      />

      {/* Title Editor Sheet */}
      <HomeTitleEditorSheet
        visible={showTitleEditor}
        currentTitle={homeTitle}
        onClose={() => setShowTitleEditor(false)}
        onSave={(newTitle) => setHomeTitle(newTitle)}
      />

      {/* Folder Quick Action Modal on Long Press */}
      <FolderQuickActionModal
        visible={!!actionTarget}
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onEdit={(col) => setEditingCollection(col)}
        onShare={(col) => setSharingCollection(col)}
        onDelete={(col) => setDeletingCollection(col)}
        onOpen={(col) => router.push(`/collection/${col.id}`)}
      />

      {/* Share Collection Sheet */}
      {sharingCollection && (
        <ShareCollectionSheet
          visible={!!sharingCollection}
          collection={sharingCollection}
          items={items}
          subcollections={collections.filter((c) => c.parentId === sharingCollection.id)}
          onClose={() => setSharingCollection(null)}
        />
      )}

      {/* Edit Collection Sheet */}
      {editingCollection && (
        <CollectionFormSheet
          visible={!!editingCollection}
          editingCollection={editingCollection}
          existingCollections={collections}
          onClose={() => setEditingCollection(null)}
          onSave={(data) => {
            updateCollection(editingCollection.id, data);
            setEditingCollection(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCollection && (
        <NeoConfirmModal
          visible={!!deletingCollection}
          title={`Hapus "${deletingCollection.name}"?`}
          message="Koleksi ini akan dihapus. Semua tautan di dalamnya akan dipindahkan dengan aman ke koleksi 'Belum Diurutkan'."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDestructive
          onConfirm={() => {
            if (deletingCollection) {
              deleteCollection(deletingCollection.id);
              setDeletingCollection(null);
            }
          }}
          onCancel={() => setDeletingCollection(null)}
        />
      )}

      {/* Item Quick Action Modal on Long Press */}
      <ItemQuickActionModal
        visible={!!itemActionTarget}
        target={itemActionTarget}
        onClose={() => setItemActionTarget(null)}
        onOpenLink={handleOpenLink}
        onTogglePin={(it) => togglePin(it.id)}
        onShare={handleShareItem}
        onDelete={(it) => setDeletingItem(it)}
        onOpenDetail={(it) => router.push(`/link/${it.id}`)}
      />

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <NeoConfirmModal
          visible={!!deletingItem}
          title={`Hapus Simpanan?`}
          message={`Apakah Anda yakin ingin menghapus "${deletingItem.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDestructive
          onConfirm={() => {
            if (deletingItem) {
              deleteLink(deletingItem.id);
              setDeletingItem(null);
            }
          }}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainHeader: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  plusMiniBadge: {
    position: "absolute",
    top: 2,
    right: 3,
  },
  plusMiniBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  wordmarkText: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerRightBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  heroTitleBox: {
    marginTop: 10,
    marginBottom: 20,
  },
  heroTitleText: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.6,
    lineHeight: 38,
  },
  quickSaveBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 16,
  },
  quickSavePasteBtn: {
    width: 44,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  quickSaveInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 6,
  },
  quickSaveActionBtn: {
    width: 52,
    height: "100%",
    backgroundColor: "#F7CB54",
    borderLeftWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 6,
    padding: 12,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 20,
  },
  reviewIconSquare: {
    width: 38,
    height: 38,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewTextCol: {
    flex: 1,
  },
  reviewHeadline: {
    fontSize: 13,
    fontWeight: "800",
  },
  reviewSubline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#087E59",
    marginTop: 2,
  },
  reviewArrow: {
    fontSize: 24,
    fontWeight: "700",
    paddingRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  pinnedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortPill: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  folderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "47.5%",
    marginBottom: 18,
  },
  fabBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    zIndex: 99,
  },
});
