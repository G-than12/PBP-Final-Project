import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Search, X, ChevronRight, Bookmark } from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { AppIcon } from "../src/components/ui/AppIcon";
import { FigmaItemCard } from "../src/components/ui/FigmaItemCard";
import { ManilaFolderCard } from "../src/components/ui/ManilaFolderCard";
import { safeBack } from "../src/utils/navigation";

type TabType = "Ringkasan" | "Koleksi" | "Simpanan" | "Disematkan" | "Tag";

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

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => {
      it.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const tabs: TabType[] = ["Ringkasan", "Koleksi", "Simpanan", "Disematkan", "Tag"];

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
            >
              <Text style={styles.clearBtnText}>Bersihkan</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            Haptics.selectionAsync();
            safeBack(router, "/home");
          }}
        >
          <Text style={[styles.cancelBtnText, { color: theme.text }]}>Batal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Figma Pustakamu Library Card */}
        <View
          style={[
            styles.libraryCard,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={styles.libraryCardTop}>
            <Text style={styles.libraryLabel}>PUSTAKAMU</Text>
            <Text style={[styles.libraryStats, { color: theme.text }]}>
              {collections.length} koleksi · {items.length} simpanan
            </Text>
          </View>

          {/* Library Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    { borderColor: isDark ? "#4A4640" : "#000000" },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveTab(tab);
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                      { color: isActive ? "#000000" : theme.text },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content: Ringkasan */}
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
          </View>
        )}

        {/* Tab Content: Simpanan */}
        {activeTab === "Simpanan" && (
          <View>
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              SEMUA SIMPANAN ({filteredItems.length})
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

        {/* Tab Content: Disematkan */}
        {activeTab === "Disematkan" && (
          <View>
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              SIMPANAN DISEMATKAN ({items.filter((i) => i.isPinned).length})
            </Text>
            <View style={styles.itemGrid}>
              {items
                .filter((x) => x.isPinned)
                .map((item) => (
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

        {/* Tab Content: Tag */}
        {activeTab === "Tag" && (
          <View>
            <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>
              TAG POPULER ({allTags.length})
            </Text>
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
    paddingVertical: 12,
    borderBottomWidth: 2,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#666158",
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 12,
  },
  libraryLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#666158",
  },
  libraryStats: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  tabsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  tabButton: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#F7CB54",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#000000",
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
    marginBottom: 12,
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
});
