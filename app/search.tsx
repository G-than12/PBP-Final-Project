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
import { Search, X, ChevronRight, Pin } from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { AppIcon } from "../src/components/ui/AppIcon";
import { FigmaItemCard } from "../src/components/ui/FigmaItemCard";
import { ManilaFolderCard } from "../src/components/ui/ManilaFolderCard";
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

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Ringkasan");

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

  const handleTabPress = (tab: CategoryTab) => {
    Haptics.selectionAsync();
    // If the user clicks the currently active tab again, return to Ringkasan
    if (activeTab === tab) {
      setActiveTab("Ringkasan");
    } else {
      setActiveTab(tab);
    }
  };

  const handleReturnToRingkasan = () => {
    Haptics.selectionAsync();
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
        {/* Figma Pustakamu Library Card */}
        <View
          style={[
            styles.libraryCard,
            {
              backgroundColor: isDark ? "#2A261C" : "#F7CB54",
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={styles.libraryCardTop}>
            <View>
              <Text style={styles.libraryLabel}>PUSTAKAMU</Text>
              <Text style={[styles.libraryStats, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                {collections.length} koleksi · {items.length} simpanan
              </Text>
            </View>

            {/* Revisi logic: Tombol "Ringkasan" HANYA MUNCUL ketika memilih tab Koleksi / Simpanan / Disematkan / Tag */}
            {activeTab !== "Ringkasan" && (
              <TouchableOpacity
                style={[
                  styles.summaryBtn,
                  {
                    backgroundColor: isDark ? "#1C1A17" : "#000000",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={handleReturnToRingkasan}
                accessibilityLabel="Kembali ke Ringkasan"
              >
                <Text style={styles.summaryBtnText}>Ringkasan ↗</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 4 Category Tabs in a 100% responsive 4-column row */}
          <View style={styles.tabsRow}>
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    {
                      backgroundColor: isActive
                        ? "#000000"
                        : isDark
                        ? "#1C1A17"
                        : "#FFFFFF",
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => handleTabPress(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                      { color: isActive ? "#FFFFFF" : isDark ? "#E5E1D8" : "#000000" },
                    ]}
                    numberOfLines={1}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tab Content: Ringkasan (Default View) */}
        {activeTab === "Ringkasan" && (
          <View>
            {/* Baru Disimpan section */}
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              BARU DISIMPAN
            </Text>

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
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              SEMUA KOLEKSI ({filteredCollections.length})
            </Text>
            {filteredCollections.length === 0 ? (
              <View style={styles.emptyCard}>
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
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              SEMUA SIMPANAN ({filteredItems.length})
            </Text>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyCard}>
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
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              SIMPANAN DISEMATKAN ({pinnedItems.length})
            </Text>
            {pinnedItems.length === 0 ? (
              <View style={styles.emptyCard}>
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
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab Content: Tag */}
        {activeTab === "Tag" && (
          <View>
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              TAG POPULER ({allTags.length})
            </Text>
            {allTags.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Belum ada tagar
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Tambahkan tagar pada tautan untuk mengelompokkannya secara fleksibel.
                </Text>
              </View>
            ) : (
              <View style={styles.tagGrid}>
                {allTags.map(([tag, count]) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuery(tag);
                      setActiveTab("Ringkasan");
                    }}
                  >
                    <Text style={[styles.tagName, { color: theme.text }]}>#{tag}</Text>
                    <View style={styles.tagCountBadge}>
                      <Text style={styles.tagCountText}>{count}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    height: 46,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  libraryCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 20,
  },
  libraryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  libraryLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#4A4640",
  },
  libraryStats: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  summaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  summaryBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tabsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  tabButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  tabButtonActive: {
    shadowOffset: { width: 2, height: 2 },
  },
  tabText: {
    fontSize: 11,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
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
    width: "48%",
    marginBottom: 4,
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
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#A8A29E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
});
