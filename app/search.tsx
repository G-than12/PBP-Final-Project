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
import { Search, X, ChevronRight, ChevronLeft, Pin, Folder, Bookmark, Tag, Clock } from "lucide-react-native";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { AppIcon } from "../src/components/ui/AppIcon";
import { FigmaItemCard } from "../src/components/ui/FigmaItemCard";
import { ManilaFolderCard } from "../src/components/ui/ManilaFolderCard";
import { TagBadge } from "../src/components/ui/TagBadge";
import { FolderQuickActionModal, FolderActionTarget } from "../src/components/ui/FolderQuickActionModal";
import { ItemQuickActionModal, ItemActionTarget } from "../src/components/ui/ItemQuickActionModal";
import { ShareCollectionSheet } from "../src/components/sheets/ShareCollectionSheet";
import { CollectionFormSheet } from "../src/components/sheets/CollectionFormSheet";
import { NeoConfirmModal } from "../src/components/ui/NeoConfirmModal";
import { Collection, SavedItem } from "../src/types/models";
import { safeBack } from "../src/utils/navigation";

type TabType = "Ringkasan" | "Koleksi" | "Simpanan" | "Disematkan" | "Tag";
type CategoryTab = "Koleksi" | "Simpanan" | "Disematkan" | "Tag";

const CATEGORY_TABS: CategoryTab[] = ["Koleksi", "Simpanan", "Disematkan", "Tag"];

export default function SearchScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);
  const updateCollection = useSimpanInStore((state) => state.updateCollection);
  const deleteCollection = useSimpanInStore((state) => state.deleteCollection);
  const togglePin = useSimpanInStore((state) => state.togglePin);
  const deleteLink = useSimpanInStore((state) => state.deleteLink);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Ringkasan");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Folder Quick Action Modal states on folder long-press
  const [actionTarget, setActionTarget] = useState<FolderActionTarget | null>(null);
  const [targetEditingCol, setTargetEditingCol] = useState<Collection | null>(null);
  const [targetSharingCol, setTargetSharingCol] = useState<Collection | null>(null);
  const [targetDeletingCol, setTargetDeletingCol] = useState<Collection | null>(null);

  // Item Quick Action Modal states on item long-press
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

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((x) =>
      `${x.title} ${x.source} ${x.description} ${x.notes} ${x.tags.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  const filteredCollections = useMemo(() => {
    if (!query.trim()) return collections;
    const q = query.toLowerCase();
    return collections.filter((x) => x.name.toLowerCase().includes(q));
  }, [collections, query]);

  const pinnedItems = useMemo(() => {
    return filteredItems.filter((i) => i.isPinned);
  }, [filteredItems]);

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    const sourceItems = query.trim() ? filteredItems : items;
    sourceItems.forEach((it) => {
      it.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items, filteredItems, query]);

  const filteredItemsForSelectedTag = useMemo(() => {
    if (!selectedTagFilter) return [];
    const cleanFilter = selectedTagFilter.toLowerCase().replace(/^#+/, "");
    return items.filter((item) =>
      item.tags.some((t) => t.toLowerCase().replace(/^#+/, "") === cleanFilter)
    );
  }, [items, selectedTagFilter]);

  const handleTabPress = (tab: CategoryTab) => {
    Haptics.selectionAsync();
    setSelectedTagFilter(null);
    // If the user clicks the currently active tab again, return to Ringkasan
    if (activeTab === tab) {
      setActiveTab("Ringkasan");
    } else {
      setActiveTab(tab);
    }
  };

  const handleReturnToRingkasan = () => {
    Haptics.selectionAsync();
    setSelectedTagFilter(null);
    setActiveTab("Ringkasan");
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Top Bar matching Figma search-top */}
      <View style={[styles.searchTop, { borderBottomColor: theme.border }]}>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Cari koleksi atau simpanan..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Hapus pencarian"
            >
              <X size={12} color="#000000" strokeWidth={3} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            Haptics.selectionAsync();
            safeBack(router, "/home");
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.cancelBtnText, { color: theme.text }]}>Batal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Figma Pustakamu Signature Yellow Hero Card (SimpanIn.pdf Page 54, 58, 59) */}
        <View style={styles.libraryCard}>
          <View style={styles.libraryCardTop}>
            <Text style={styles.libraryLabel}>
              PUSTAKAMU
            </Text>

            {/* Tombol "Ringkasan" muncul ketika memilih tab Koleksi / Simpanan / Disematkan / Tag */}
            {activeTab !== "Ringkasan" && (
              <TouchableOpacity
                style={styles.summaryBtn}
                onPress={handleReturnToRingkasan}
                accessibilityLabel="Kembali ke Ringkasan"
                activeOpacity={0.8}
              >
                <Text style={styles.summaryBtnText}>
                  Ringkasan ↗
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 4 Stat Columns (SimpanIn.pdf Page 54, 58, 59) */}
          <View style={styles.statsGridRow}>
            {/* Column 1: Koleksi */}
            <TouchableOpacity
              style={[
                styles.statCol,
                activeTab === "Koleksi" && styles.statColActive,
              ]}
              onPress={() => handleTabPress("Koleksi")}
              activeOpacity={0.75}
            >
              <Folder size={20} color="#000000" strokeWidth={2.2} />
              <Text style={styles.statNumber}>
                {collections.length}
              </Text>
              <Text style={styles.statLabel}>
                Koleksi
              </Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            {/* Column 2: Simpanan */}
            <TouchableOpacity
              style={[
                styles.statCol,
                activeTab === "Simpanan" && styles.statColActive,
              ]}
              onPress={() => handleTabPress("Simpanan")}
              activeOpacity={0.75}
            >
              <Bookmark size={20} color="#000000" strokeWidth={2.2} />
              <Text style={styles.statNumber}>
                {items.length}
              </Text>
              <Text style={styles.statLabel}>
                Simpanan
              </Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            {/* Column 3: Disematkan */}
            <TouchableOpacity
              style={[
                styles.statCol,
                activeTab === "Disematkan" && styles.statColActive,
              ]}
              onPress={() => handleTabPress("Disematkan")}
              activeOpacity={0.75}
            >
              <Pin size={20} color="#000000" strokeWidth={2.2} />
              <Text style={styles.statNumber}>
                {pinnedItems.length}
              </Text>
              <Text style={styles.statLabel}>
                Disematkan
              </Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            {/* Column 4: Tag */}
            <TouchableOpacity
              style={[
                styles.statCol,
                activeTab === "Tag" && styles.statColActive,
              ]}
              onPress={() => handleTabPress("Tag")}
              activeOpacity={0.75}
            >
              <Tag size={20} color="#000000" strokeWidth={2.2} />
              <Text style={styles.statNumber}>
                {allTags.length}
              </Text>
              <Text style={styles.statLabel}>
                Tag
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content: Ringkasan (Default View) */}
        {activeTab === "Ringkasan" && (
          <View>
            {/* Baru Disimpan section */}
            <View style={styles.sectionHeaderRowWithIcon}>
              <Clock size={16} color={isDark ? "#F7CB54" : "#000000"} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                BARU DISIMPAN
              </Text>
            </View>

            {items.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {items.slice(0, 4).map((x) => (
                  <View key={x.id} style={styles.horizontalItemWrap}>
                    <FigmaItemCard
                      item={x}
                      onPress={() => router.push(`/link/${x.id}`)}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyPrompt, { color: theme.textMuted }]}>
                Belum ada simpanan terbaru.
              </Text>
            )}

            {/* Search results prompt */}
            <Text style={[styles.searchPrompt, { color: theme.textSecondary }]}>
              {query
                ? `${filteredItems.length + filteredCollections.length} hasil ditemukan untuk "${query}"`
                : "Ketik sesuatu untuk mencari koleksi atau simpanan..."}
            </Text>

            {/* When query is present, show matching collections and items */}
            {query.length > 0 && (
              <>
                {filteredCollections.length > 0 && (
                  <View style={styles.matchedSection}>
                    <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
                      KOLEKSI TERKAIT ({filteredCollections.length})
                    </Text>
                    {filteredCollections.map((col) => {
                      const count = items.filter((i) => i.collectionId === col.id).length;
                      return (
                        <TouchableOpacity
                          key={col.id}
                          style={[
                            styles.collectionListRow,
                            {
                              backgroundColor: theme.surface,
                              borderColor: isDark ? "#4A4640" : "#000000",
                            },
                          ]}
                          onPress={() => router.push(`/collection/${col.id}`)}
                        >
                          <View style={[styles.colRowIcon, { backgroundColor: col.color }]}>
                            <AppIcon name={col.icon} size={18} color="#000000" />
                          </View>
                          <View style={styles.colRowText}>
                            <Text style={[styles.colRowTitle, { color: theme.text }]}>
                              {col.name}
                            </Text>
                            <Text style={[styles.colRowCount, { color: theme.textMuted }]}>
                              {count} simpanan
                            </Text>
                          </View>
                          <ChevronRight size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {filteredItems.length > 0 && (
                  <View style={styles.matchedSection}>
                    <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
                      SIMPANAN TERKAIT ({filteredItems.length})
                    </Text>
                    <View style={styles.itemGrid}>
                      {filteredItems.map((item) => (
                        <View key={item.id} style={styles.gridHalf}>
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

                {filteredCollections.length === 0 && filteredItems.length === 0 && (
                  <View style={styles.emptyCard}>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                      Tidak ada hasil yang cocok
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                      Coba cari dengan kata kunci lain atau periksa ejaan.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Tab Content: Koleksi */}
        {activeTab === "Koleksi" && (
          <View>
            <View style={styles.sectionHeaderRowWithIcon}>
              <Folder size={16} color={isDark ? "#8FC9FF" : "#000000"} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                SEMUA KOLEKSI ({filteredCollections.length})
              </Text>
            </View>
            {filteredCollections.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: isDark ? theme.card : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <View style={[styles.emptyIconCircle, { backgroundColor: "#8FC9FF" }]}>
                  <Folder size={22} color="#000000" strokeWidth={2.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Tidak ada koleksi ditemukan
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {query
                    ? `Tidak ada koleksi yang cocok dengan "${query}"`
                    : "Belum ada koleksi yang dibuat."}
                </Text>
              </View>
            ) : (
              <View style={styles.itemGrid}>
                {filteredCollections.map((col) => {
                  const count = items.filter((i) => i.collectionId === col.id).length;
                  return (
                    <View key={col.id} style={styles.gridHalf}>
                      <ManilaFolderCard
                        collection={col}
                        itemCount={count}
                        onPress={() => router.push(`/collection/${col.id}`)}
                        onLongPress={(rect) => {
                          setActionTarget({
                            collection: col,
                            itemCount: count,
                            rect,
                          });
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Tab Content: Simpanan */}
        {activeTab === "Simpanan" && (
          <View>
            <View style={styles.sectionHeaderRowWithIcon}>
              <Bookmark size={16} color={isDark ? "#A6E3D1" : "#000000"} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                SEMUA SIMPANAN ({filteredItems.length})
              </Text>
            </View>
            {filteredItems.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: isDark ? theme.card : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <View style={[styles.emptyIconCircle, { backgroundColor: "#A6E3D1" }]}>
                  <Bookmark size={22} color="#000000" strokeWidth={2.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Tidak ada simpanan ditemukan
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {query
                    ? `Tidak ada simpanan yang cocok dengan "${query}"`
                    : "Belum ada tautan yang disimpan."}
                </Text>
              </View>
            ) : (
              <View style={styles.itemGrid}>
                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.gridHalf}>
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
            )}
          </View>
        )}

        {/* Tab Content: Disematkan */}
        {activeTab === "Disematkan" && (
          <View>
            <View style={styles.sectionHeaderRowWithIcon}>
              <Pin size={16} color={isDark ? "#F7CB54" : "#000000"} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                SIMPANAN DISEMATKAN ({pinnedItems.length})
              </Text>
            </View>
            {pinnedItems.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: isDark ? theme.card : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <View style={[styles.emptyIconCircle, { backgroundColor: "#F7CB54" }]}>
                  <Pin size={22} color="#000000" strokeWidth={2.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Belum ada simpanan disematkan
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {query
                    ? `Tidak ada simpanan tersemat yang cocok dengan "${query}"`
                    : "Sematkan tautan penting untuk melihatnya dengan cepat di sini."}
                </Text>
              </View>
            ) : (
              <View style={styles.itemGrid}>
                {pinnedItems.map((item) => (
                  <View key={item.id} style={styles.gridHalf}>
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
            )}
          </View>
        )}

        {/* Tab Content: Tag (SimpanIn.pdf Page 59) */}
        {activeTab === "Tag" && !selectedTagFilter && (
          <View>
            <View style={styles.sectionHeaderRowWithIcon}>
              <Tag size={16} color={isDark ? "#D07BBF" : "#000000"} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                TAG ({allTags.length})
              </Text>
            </View>

            {allTags.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: isDark ? theme.card : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <View style={[styles.emptyIconCircle, { backgroundColor: "#D07BBF" }]}>
                  <Tag size={22} color="#000000" strokeWidth={2.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Belum ada tagar
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Tambahkan tagar pada tautan untuk mengelompokkannya secara fleksibel.
                </Text>
              </View>
            ) : (
              <View style={styles.tagGrid}>
                {allTags.map(([tag, count], idx) => (
                  <TagBadge
                    key={tag}
                    name={tag}
                    count={count}
                    index={idx}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTagFilter(tag);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab Content: Tag Filtered View (SimpanIn.pdf Page 60) */}
        {activeTab === "Tag" && selectedTagFilter && (
          <View>
            {/* Header: [ < ] Square Back Button + Active TagBadge */}
            <View style={styles.tagFilterHeaderRow}>
              <TouchableOpacity
                style={[
                  styles.tagBackSquareBtn,
                  {
                    backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTagFilter(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Kembali ke semua tag"
                activeOpacity={0.8}
              >
                <ChevronLeft size={22} color={theme.text} strokeWidth={2.8} />
              </TouchableOpacity>

              <TagBadge
                name={selectedTagFilter}
                count={filteredItemsForSelectedTag.length}
              />
            </View>

            {/* Section: 🔖 SIMPANAN */}
            <View style={styles.sectionHeaderRowWithIcon}>
              <Bookmark size={15} color={theme.text} strokeWidth={2.5} />
              <Text style={[styles.sectionEyebrowWithIcon, { color: theme.text }]}>
                SIMPANAN ({filteredItemsForSelectedTag.length})
              </Text>
            </View>

            {filteredItemsForSelectedTag.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Tidak ada simpanan
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Tidak ada simpanan dengan tagar ini.
                </Text>
              </View>
            ) : (
              <View style={styles.itemGrid}>
                {filteredItemsForSelectedTag.map((item) => (
                  <View key={item.id} style={styles.gridHalf}>
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
            )}
          </View>
        )}
      </ScrollView>

      {/* Folder Quick Action Modal on Long Press */}
      <FolderQuickActionModal
        visible={!!actionTarget}
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onEdit={(col) => setTargetEditingCol(col)}
        onShare={(col) => setTargetSharingCol(col)}
        onDelete={(col) => setTargetDeletingCol(col)}
        onOpen={(col) => router.push(`/collection/${col.id}`)}
      />

      {/* Share Collection Sheet */}
      {targetSharingCol && (
        <ShareCollectionSheet
          visible={!!targetSharingCol}
          collection={targetSharingCol}
          items={items}
          subcollections={collections.filter((c) => c.parentId === targetSharingCol.id)}
          onClose={() => setTargetSharingCol(null)}
        />
      )}

      {/* Edit Collection Sheet */}
      {targetEditingCol && (
        <CollectionFormSheet
          visible={!!targetEditingCol}
          editingCollection={targetEditingCol}
          existingCollections={collections}
          onClose={() => setTargetEditingCol(null)}
          onSave={(data) => {
            updateCollection(targetEditingCol.id, data);
            setTargetEditingCol(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {targetDeletingCol && (
        <NeoConfirmModal
          visible={!!targetDeletingCol}
          title={`Hapus "${targetDeletingCol.name}"?`}
          message="Koleksi ini akan dihapus. Semua tautan di dalamnya akan dipindahkan dengan aman ke koleksi 'Belum Diurutkan'."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDestructive
          onConfirm={() => {
            if (targetDeletingCol) {
              deleteCollection(targetDeletingCol.id);
              setTargetDeletingCol(null);
            }
          }}
          onCancel={() => setTargetDeletingCol(null)}
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
  searchTop: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    height: 42,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  libraryCard: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 22,
  },
  libraryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  libraryLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#000000",
  },
  summaryBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  summaryBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
  },
  statsGridRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  statColActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  statDivider: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  sectionHeaderRowWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionEyebrowWithIcon: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  tagFilterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  tagBackSquareBtn: {
    width: 36,
    height: 36,
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
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  horizontalScroll: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 10,
  },
  horizontalItemWrap: {
    width: 170,
  },
  emptyPrompt: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 16,
  },
  searchPrompt: {
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 14,
  },
  matchedSection: {
    marginTop: 14,
  },
  collectionListRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 6,
    padding: 12,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    marginBottom: 10,
  },
  colRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  colRowText: {
    flex: 1,
  },
  colRowTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  colRowCount: {
    fontSize: 11,
    marginTop: 2,
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridHalf: {
    width: "47.5%",
    marginBottom: 18,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tagName: {
    fontSize: 12,
    fontWeight: "800",
  },
  tagCountBadge: {
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000000",
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
