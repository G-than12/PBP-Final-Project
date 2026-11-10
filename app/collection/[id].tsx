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
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  Plus,
  X,
  Share2,
  Trash2,
  Edit3,
  Layers,
  FolderPlus,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { AppIcon } from "../../src/components/ui/AppIcon";
import { FigmaItemCard } from "../../src/components/ui/FigmaItemCard";
import { ManilaFolderCard } from "../../src/components/ui/ManilaFolderCard";
import { NeoBottomSheet } from "../../src/components/ui/NeoBottomSheet";
import { NeoConfirmModal } from "../../src/components/ui/NeoConfirmModal";
import { SaveLinkSheet } from "../../src/components/sheets/SaveLinkSheet";
import { CollectionFormSheet } from "../../src/components/sheets/CollectionFormSheet";
import { ShareCollectionSheet } from "../../src/components/sheets/ShareCollectionSheet";
import { ShareGuideModal } from "../../src/components/sheets/ShareGuideModal";
import { safeBack } from "../../src/utils/navigation";

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const deleteCollection = useSimpanInStore((state) => state.deleteCollection);
  const updateCollection = useSimpanInStore((state) => state.updateCollection);
  const addCollection = useSimpanInStore((state) => state.addCollection);
  const addLink = useSimpanInStore((state) => state.addLink);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unreviewed" | "pinned">("all");
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showSubSheet, setShowSubSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentCollection = useMemo(() => {
    return collections.find((c) => c.id === id) || collections[0];
  }, [collections, id]);

  const parentCollection = useMemo(() => {
    if (!currentCollection.parentId) return null;
    return collections.find((c) => c.id === currentCollection.parentId) || null;
  }, [collections, currentCollection]);

  // Subcollections nested inside this collection
  const subcollections = useMemo(() => {
    return collections.filter((c) => c.parentId === id);
  }, [collections, id]);

  // Items directly inside this collection
  const collectionItems = useMemo(() => {
    return items.filter((it) => it.collectionId === id);
  }, [items, id]);

  // Filtered items
  const displayedItems = useMemo(() => {
    let result = [...collectionItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.url.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterType === "unreviewed") {
      result = result.filter((it) => !it.isReviewed);
    } else if (filterType === "pinned") {
      result = result.filter((it) => it.isPinned);
    }

    return result;
  }, [collectionItems, searchQuery, filterType]);

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteCollection(currentCollection.id);
    router.replace("/home");
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header matching Figma collection-header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.iconSquareBtn,
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

        <View style={styles.headerInfoCol}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {currentCollection.name}
          </Text>
          <Text style={[styles.headerSub, { color: theme.textMuted }]}>
            {collectionItems.length} simpanan · {subcollections.length} subkoleksi
          </Text>
        </View>

        <TouchableOpacity
          style={styles.focusBtn}
          onPress={() => {
            Haptics.selectionAsync();
            router.push(`/focus?collectionId=${currentCollection.id}`);
          }}
          accessibilityLabel="Mode Fokus"
        >
          <Text style={styles.focusBtnText}>Mode Fokus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconSquareBtn,
            { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowMenuSheet(true);
          }}
          accessibilityLabel="Opsi Koleksi"
        >
          <MoreHorizontal size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Figma Collection Banner */}
        <View
          style={[
            styles.collectionBanner,
            {
              backgroundColor: currentCollection.color,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={[styles.bannerIconSquare, { borderColor: isDark ? "#4A4640" : "#000000" }]}>
            <AppIcon name={currentCollection.icon} size={24} color="#000000" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTag}>KOLEKSI</Text>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {currentCollection.name}
            </Text>
          </View>
        </View>

        {/* Parent Breadcrumb if this is a subcollection */}
        {parentCollection && (
          <TouchableOpacity
            style={styles.breadcrumbBar}
            onPress={() => router.push(`/collection/${parentCollection.id}`)}
          >
            <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>
              ← Kembali ke {parentCollection.name}
            </Text>
          </TouchableOpacity>
        )}

        {/* Search in this collection */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={`Cari di ${currentCollection.name}...`}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Subcollections Section (UNLIMITED) */}
        {subcollections.length > 0 && (
          <View style={styles.subSection}>
            <View style={styles.subHead}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>
                SUBKOLEKSI ({subcollections.length})
              </Text>
              <TouchableOpacity
                style={[
                  styles.addSubBtn,
                  { backgroundColor: theme.surface, borderColor: isDark ? "#4A4640" : "#000000" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowSubSheet(true);
                }}
              >
                <Plus size={12} color={theme.text} strokeWidth={3} />
                <Text style={[styles.addSubBtnText, { color: theme.text }]}>Subkoleksi</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.subGrid}>
              {subcollections.map((sub) => {
                const subItemCount = items.filter((it) => it.collectionId === sub.id).length;
                return (
                  <View key={sub.id} style={styles.gridHalf}>
                    <ManilaFolderCard
                      collection={sub}
                      itemCount={subItemCount}
                      onPress={() => router.push(`/collection/${sub.id}`)}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filterType === "all" && styles.filterPillActive,
              { borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={() => setFilterType("all")}
          >
            <Text
              style={[
                styles.filterPillText,
                filterType === "all" && styles.filterPillTextActive,
                { color: filterType === "all" ? "#000000" : theme.text },
              ]}
            >
              Semua {collectionItems.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filterType === "unreviewed" && styles.filterPillActive,
              { borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={() => setFilterType("unreviewed")}
          >
            <Text
              style={[
                styles.filterPillText,
                filterType === "unreviewed" && styles.filterPillTextActive,
                { color: filterType === "unreviewed" ? "#000000" : theme.text },
              ]}
            >
              Belum Ditinjau {collectionItems.filter((i) => !i.isReviewed).length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filterType === "pinned" && styles.filterPillActive,
              { borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={() => setFilterType("pinned")}
          >
            <Text
              style={[
                styles.filterPillText,
                filterType === "pinned" && styles.filterPillTextActive,
                { color: filterType === "pinned" ? "#000000" : theme.text },
              ]}
            >
              Disematkan {collectionItems.filter((i) => i.isPinned).length}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Items Section Label */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          SIMPANAN ({displayedItems.length})
        </Text>

        {/* Empty State vs 2-Column Grid */}
        {displayedItems.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyFolderIcon}>▰</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Belum ada simpanan
            </Text>
            <Text style={[styles.emptyStateDesc, { color: theme.textMuted }]}>
              Ketuk + atau bagikan tautan dari aplikasi lain untuk menyimpan.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setShowGuideModal(true)}
            >
              <Text style={styles.emptyActionBtnText}>Lihat caranya</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemGrid}>
            {displayedItems.map((item) => (
              <View key={item.id} style={styles.gridHalf}>
                <FigmaItemCard
                  item={item}
                  onPress={() => router.push(`/link/${item.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fabBtn}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.selectionAsync();
          setShowSaveSheet(true);
        }}
        accessibilityLabel="Tambah Simpanan ke Koleksi Ini"
      >
        <Plus size={28} color="#000000" strokeWidth={3} />
      </TouchableOpacity>

      {/* Collection Options Menu Bottom Sheet */}
      <NeoBottomSheet
        visible={showMenuSheet}
        title="Opsi Koleksi"
        onClose={() => setShowMenuSheet(false)}
      >
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenuSheet(false);
              setShowSaveSheet(true);
            }}
          >
            <View style={[styles.menuIconSquare, { backgroundColor: "#F7CB54" }]}>
              <Plus size={18} color="#000000" />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Tambah Link</Text>
              <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                Simpan URL baru ke {currentCollection.name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenuSheet(false);
              setShowSubSheet(true);
            }}
          >
            <View style={[styles.menuIconSquare, { backgroundColor: "#A6E3D1" }]}>
              <FolderPlus size={18} color="#000000" />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Tambah Subkoleksi</Text>
              <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                Buat subfolder tanpa batas di dalam koleksi ini
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenuSheet(false);
              setShowEditSheet(true);
            }}
          >
            <View style={[styles.menuIconSquare, { backgroundColor: "#8FC9FF" }]}>
              <Edit3 size={18} color="#000000" />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Edit Koleksi</Text>
              <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                Ganti nama, warna ({currentCollection.color}), atau ikon
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenuSheet(false);
              setShowShareSheet(true);
            }}
          >
            <View style={[styles.menuIconSquare, { backgroundColor: "#D0B7FF" }]}>
              <Share2 size={18} color="#000000" />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Bagikan Koleksi</Text>
              <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                Kirim daftar link ke aplikasi lain
              </Text>
            </View>
          </TouchableOpacity>

          {!currentCollection.isSystem && (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowMenuSheet(false);
                setShowDeleteConfirm(true);
              }}
            >
              <View style={[styles.menuIconSquare, { backgroundColor: "#FEE2E2" }]}>
                <Trash2 size={18} color="#EF4444" />
              </View>
              <View style={styles.menuItemTextCol}>
                <Text style={[styles.menuItemTitle, { color: "#EF4444" }]}>Hapus Koleksi</Text>
                <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                  Hapus folder ini (link akan dipindah ke Belum Diurutkan)
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </NeoBottomSheet>

      {/* Save Link Sheet */}
      <SaveLinkSheet
        visible={showSaveSheet}
        collections={collections}
        defaultCollectionId={currentCollection.id}
        onClose={() => setShowSaveSheet(false)}
        onSave={(data) => {
          addLink({ ...data, collectionId: currentCollection.id });
          setShowSaveSheet(false);
        }}
        onRequestCreateCollection={() => {
          setShowSaveSheet(false);
          setShowSubSheet(true);
        }}
      />

      {/* Edit Collection Sheet */}
      <CollectionFormSheet
        visible={showEditSheet}
        editingCollection={currentCollection}
        existingCollections={collections}
        onClose={() => setShowEditSheet(false)}
        onSave={(data) => {
          updateCollection(currentCollection.id, data);
          setShowEditSheet(false);
        }}
      />

      {/* Add Subcollection Sheet */}
      <CollectionFormSheet
        visible={showSubSheet}
        defaultParentId={currentCollection.id}
        existingCollections={collections}
        onClose={() => setShowSubSheet(false)}
        onSave={(data) => {
          addCollection({ ...data, parentId: currentCollection.id });
          setShowSubSheet(false);
        }}
      />

      {/* Share Collection Sheet */}
      <ShareCollectionSheet
        visible={showShareSheet}
        collection={currentCollection}
        items={items}
        subcollections={subcollections}
        onClose={() => setShowShareSheet(false)}
      />

      {/* Share Guide Modal */}
      <ShareGuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <NeoConfirmModal
        visible={showDeleteConfirm}
        title={`Hapus "${currentCollection.name}"?`}
        message="Koleksi ini akan dihapus. Semua tautan di dalamnya akan dipindahkan dengan aman ke koleksi 'Belum Diurutkan'."
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
  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    gap: 10,
  },
  iconSquareBtn: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerInfoCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  focusBtn: {
    height: 36,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 6,
    backgroundColor: "#F7CB54",
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  focusBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  collectionBanner: {
    height: 92,
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
  },
  bannerIconSquare: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTag: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#111111",
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    marginTop: 2,
  },
  breadcrumbBar: {
    marginBottom: 12,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: "700",
  },
  searchBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  subSection: {
    marginBottom: 20,
  },
  subHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addSubBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addSubBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterPill: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: "#F7CB54",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  filterPillTextActive: {
    color: "#000000",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridHalf: {
    width: "48%",
    marginBottom: 12,
  },
  emptyStateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyFolderIcon: {
    fontSize: 72,
    color: "#F7CB54",
    textShadowColor: "#000000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000000",
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
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E1D8",
    gap: 12,
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  menuItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
