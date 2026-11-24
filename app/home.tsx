import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
  Dimensions,
  Modal,
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
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Check,
  ChevronDown,
  ArrowDownAZ,
  History,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { Collection, SavedItem, SortOption } from "../src/types/models";
import { THEME_LIGHT, THEME_DARK, NEO_SHADOW_SM } from "../src/constants/theme";
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
import { NeoBottomSheet } from "../src/components/ui/NeoBottomSheet";
import { SaveLinkSheet } from "../src/components/sheets/SaveLinkSheet";
import { CollectionFormSheet } from "../src/components/sheets/CollectionFormSheet";
import { ShareCollectionSheet } from "../src/components/sheets/ShareCollectionSheet";
import { useIncomingShare } from "../src/hooks/useIncomingShare";

export default function HomeScreen() {
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const homeTitle = useSimpanInStore((state) => state.settings.homeTitle);
  const collections = useSimpanInStore((state) => state.collections);
  const rawItems = useSimpanInStore((state) => state.items);
  const items = useMemo(() => {
    const seen = new Set<string>();
    let hasDupes = false;
    const unique = rawItems.map((it, idx) => {
      if (seen.has(it.id)) {
        hasDupes = true;
        return { ...it, id: `${it.id}_dup_${idx}` };
      }
      seen.add(it.id);
      return it;
    });
    if (hasDupes) {
      setTimeout(() => {
        useSimpanInStore.setState({ items: unique });
      }, 0);
    }
    return unique;
  }, [rawItems]);
  const sortOption = useSimpanInStore((state) => state.sortOption);
  const setSortOption = useSimpanInStore((state) => state.setSortOption);

  const addLink = useSimpanInStore((state) => state.addLink);
  const addCollection = useSimpanInStore((state) => state.addCollection);
  const updateCollection = useSimpanInStore((state) => state.updateCollection);
  const deleteCollection = useSimpanInStore((state) => state.deleteCollection);
  const togglePin = useSimpanInStore((state) => state.togglePin);
  const deleteLink = useSimpanInStore((state) => state.deleteLink);

  const [quickUrl, setQuickUrl] = useState("");
  // Speed Dial FAB state ("bola-bola kecil") with staggered springs & haptics
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const fabRotateAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const bubble1Anim = useRef(new Animated.Value(0)).current; // Simpan Tautan (bawah)
  const bubble2Anim = useRef(new Animated.Value(0)).current; // Kalender & Tenggat (atas)

  // Count of urgent/overdue deadlines for Calendar bubble badge
  const urgentDeadlinesCount = useMemo(() => {
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return items.filter((it) => {
      if (!it.deadline) return false;
      return it.deadline <= now + threeDaysMs;
    }).length;
  }, [items]);

  const toggleSpeedDial = () => {
    if (speedDialOpen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.timing(fabRotateAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(bubble2Anim, { toValue: 0, duration: 130, useNativeDriver: true }),
        Animated.timing(bubble1Anim, { toValue: 0, duration: 170, useNativeDriver: true }),
      ]).start(() => setSpeedDialOpen(false));
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSpeedDialOpen(true);
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(fabRotateAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.spring(bubble1Anim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(45),
          Animated.spring(bubble2Anim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        ]),
      ]).start();
    }
  };

  const closeSpeedDial = (callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fabRotateAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(bubble2Anim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(bubble1Anim, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setSpeedDialOpen(false);
      if (callback) callback();
    });
  };

  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [saveInitialUrl, setSaveInitialUrl] = useState("");
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [defaultColIdForSave, setDefaultColIdForSave] = useState<string | undefined>(undefined);
  const [isIncomingShare, setIsIncomingShare] = useState(false);
  const [justSavedTarget, setJustSavedTarget] = useState<{
    collectionName: string;
    sourcePlatform: string;
  } | null>(null);

  // System Share Target & Clipboard Auto-Detection
  const {
    detectedClipboard,
    dismissDetectedClipboard,
    markUrlProcessed,
    returnToPreviousApp,
  } = useIncomingShare((share) => {
    // If incoming share is from native system SEND intent, auto-open SaveLinkSheet immediately
    if (share.source === "share_intent") {
      setSaveInitialUrl(share.url);
      setIsIncomingShare(true);
      setShowSaveSheet(true);
    }
  });

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

  const deadlineItems = useMemo(() => {
    const now = Date.now();
    return items
      .filter((i) => i.deadline && i.deadline > now - 24 * 3600 * 1000)
      .sort((a, b) => (a.deadline || 0) - (b.deadline || 0));
  }, [items]);

  const recentItems = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
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
      if (sortOption === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [collections, sortOption]);

  const sortButtonRef = useRef<any>(null);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortMenuPos, setSortMenuPos] = useState({ top: 220, right: 16 });

  const openSortMenu = () => {
    Haptics.selectionAsync();
    if (sortButtonRef.current && sortButtonRef.current.measureInWindow) {
      sortButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setSortMenuPos({
          top: y + height + 6,
          right: Math.max(16, Dimensions.get("window").width - (x + width)),
        });
        setSortMenuVisible(true);
      });
    } else {
      setSortMenuVisible(true);
    }
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
        {/* Detected Incoming Link Banner (from Clipboard / Shared App) */}
        {detectedClipboard && (
          <View
            style={[
              styles.detectedBanner,
              {
                backgroundColor: theme.surface,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <View style={styles.detectedBannerTop}>
              <View style={styles.detectedBadge}>
                <Sparkles size={12} color="#000000" />
                <Text style={styles.detectedBadgeText}>
                  LINK {detectedClipboard.platformName.toUpperCase()} TERDETEKSI
                </Text>
              </View>
              <TouchableOpacity
                onPress={dismissDetectedClipboard}
                style={styles.detectedDismissBtn}
                accessibilityLabel="Tutup pemberitahuan"
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text
              style={[styles.detectedUrlText, { color: theme.text }]}
              numberOfLines={1}
            >
              {detectedClipboard.url}
            </Text>

            <View style={styles.detectedBtnRow}>
              <TouchableOpacity
                style={styles.detectedDismissTextBtn}
                onPress={dismissDetectedClipboard}
              >
                <Text style={[styles.detectedDismissText, { color: theme.textMuted }]}>
                  Tutup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detectedSaveBtn}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSaveInitialUrl(detectedClipboard.url);
                  setIsIncomingShare(true);
                  setShowSaveSheet(true);
                  dismissDetectedClipboard();
                }}
              >
                <Text style={styles.detectedSaveBtnText}>Simpan Link →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hero 2-Line Title */}
        <View style={styles.heroTitleBox}>
          <Text style={[styles.heroTitleText, { color: theme.text }]}>
            {homeTitle[0]}
          </Text>
          <Text style={[styles.heroTitleText, { color: theme.text }]}>
            {homeTitle[1]}
          </Text>
        </View>

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
            placeholder="Tempel link di sini..."
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
            <View ref={sortButtonRef} collapsable={false}>
              <TouchableOpacity
                style={[
                  styles.sortPill,
                  {
                    backgroundColor: sortMenuVisible ? "#F7CB54" : theme.surface,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={openSortMenu}
                accessibilityLabel="Buka menu urutan koleksi"
              >
                <Text style={[styles.sortPillText, { color: theme.text }]}>
                  {sortOption === "newest"
                    ? "Terbaru"
                    : sortOption === "oldest"
                    ? "Terlama"
                    : "Nama A–Z"}
                </Text>
                <ChevronDown size={13} color={theme.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
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

        {/* Approaching Deadlines Section */}
        {deadlineItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.pinnedTitleRow}>
                <Clock size={16} color={theme.text} strokeWidth={2.4} />
                <Text style={[styles.sectionHeading, { color: theme.text }]}>
                  Tenggat Terdekat ({deadlineItems.length})
                </Text>
              </View>
            </View>

            <View style={styles.folderGrid}>
              {deadlineItems.map((item, index) => (
                <View key={`deadline-${item.id}-${index}`} style={styles.gridItem}>
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
              {pinnedItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.gridItem}>
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

        {/* Recent Saves Section */}
        {items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                Simpanan Terbaru ({items.length})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push("/search");
                }}
              >
                <Text style={[styles.seeAllText, { color: theme.primary }]}>
                  Lihat Semua →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.folderGrid}>
              {recentItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.gridItem}>
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

      {/* Dimmed backdrop when Speed Dial is open */}
      {speedDialOpen && (
        <Animated.View
          style={[
            styles.speedDialBackdrop,
            { opacity: backdropAnim },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeSpeedDial()}
          />
        </Animated.View>
      )}

      {/* Speed Dial Mini Action Bubbles ("bola-bola kecil") with staggered springs */}
      {speedDialOpen && (
        <View style={styles.speedDialContainer} pointerEvents="box-none">
          {/* Bubble 2: Kalender & Tenggat (dengan jeda stagger 45ms & badge notifikasi) */}
          <Animated.View
            style={[
              styles.speedDialRow,
              {
                opacity: bubble2Anim,
                transform: [
                  {
                    translateY: bubble2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: bubble2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.speedDialLabelPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.speedDialLabelText, { color: theme.text }]}>
                Kalender & Tenggat
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.speedDialBubble, { backgroundColor: "#A6E3D1" }]}
              activeOpacity={0.8}
              onPress={() => {
                closeSpeedDial(() => router.push("/calendar"));
              }}
              accessibilityLabel="Buka Kalender"
            >
              <Calendar size={22} color="#000000" strokeWidth={2.4} />
              {urgentDeadlinesCount > 0 && (
                <View style={styles.bubbleNotificationBadge}>
                  <Text style={styles.bubbleNotificationText}>
                    {urgentDeadlinesCount > 9 ? "9+" : urgentDeadlinesCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Bubble 1: Simpan Tautan (muncul seketika) */}
          <Animated.View
            style={[
              styles.speedDialRow,
              {
                opacity: bubble1Anim,
                transform: [
                  {
                    translateY: bubble1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                  {
                    scale: bubble1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.speedDialLabelPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.speedDialLabelText, { color: theme.text }]}>
                Simpan Tautan
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.speedDialBubble, { backgroundColor: "#F7CB54" }]}
              activeOpacity={0.8}
              onPress={() => {
                closeSpeedDial(() => {
                  setSaveInitialUrl("");
                  setShowSaveSheet(true);
                });
              }}
              accessibilityLabel="Simpan Tautan Baru"
            >
              <Plus size={24} color="#000000" strokeWidth={3} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Main Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fabBtn}
        activeOpacity={0.85}
        onPress={toggleSpeedDial}
        accessibilityLabel={speedDialOpen ? "Tutup Menu Aksi" : "Buka Menu Aksi"}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: fabRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "45deg"],
                }),
              },
            ],
          }}
        >
          <Plus size={28} color="#000000" strokeWidth={3} />
        </Animated.View>
      </TouchableOpacity>

      {/* Save Link Sheet */}
      <SaveLinkSheet
        visible={showSaveSheet}
        collections={collections}
        initialUrl={saveInitialUrl}
        defaultCollectionId={defaultColIdForSave}
        onClose={() => {
          setShowSaveSheet(false);
          setSaveInitialUrl("");
          setIsIncomingShare(false);
          setDefaultColIdForSave(undefined);
        }}
        onSave={(data) => {
          addLink(data);
          setShowSaveSheet(false);
          markUrlProcessed(data.url);
          setSaveInitialUrl("");
          setDefaultColIdForSave(undefined);

          const colName =
            collections.find((c) => c.id === data.collectionId)?.name || "Koleksi";
          const sourceName = data.source || "Aplikasi Sebelumnya";

          if (isIncomingShare || Platform.OS === "android") {
            setJustSavedTarget({
              collectionName: colName,
              sourcePlatform: sourceName,
            });
          }
          setIsIncomingShare(false);
        }}
        onRequestCreateCollection={() => {
          setShowSaveSheet(false);
          setShowCollectionSheet(true);
        }}
      />

      {/* Create / Edit Collection Sheet */}
      <CollectionFormSheet
        visible={showCollectionSheet}
        existingCollections={collections}
        onClose={() => {
          setShowCollectionSheet(false);
          if (saveInitialUrl) {
            setShowSaveSheet(true);
          }
        }}
        onSave={(data) => {
          const newCol = addCollection(data);
          setShowCollectionSheet(false);
          // If we had a shared URL waiting, re-open SaveLinkSheet with this new collection pre-selected!
          if (saveInitialUrl) {
            setDefaultColIdForSave(newCol.id);
            setShowSaveSheet(true);
          }
        }}
      />

      {/* Return to Previous App Prompt (e.g. Instagram/Threads) */}
      {justSavedTarget && (
        <NeoConfirmModal
          visible={!!justSavedTarget}
          title={`Tersimpan di ${justSavedTarget.collectionName}!`}
          message={`Mau lanjut buka ${justSavedTarget.sourcePlatform}?`}
          confirmText={`Balik ke ${justSavedTarget.sourcePlatform}`}
          cancelText="Tetap di sini"
          onConfirm={() => {
            const target = justSavedTarget;
            setJustSavedTarget(null);
            returnToPreviousApp();
          }}
          onCancel={() => {
            setJustSavedTarget(null);
          }}
        />
      )}



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

      {/* Neobrutalist Sort Dropdown Modal */}
      <Modal
        transparent
        visible={sortMenuVisible}
        animationType="fade"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <Pressable
          style={styles.sortModalOverlay}
          onPress={() => setSortMenuVisible(false)}
        />

        <View
          style={[
            styles.sortDropdownCard,
            {
              top: sortMenuPos.top,
              right: sortMenuPos.right,
              backgroundColor: theme.card,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={styles.sortDropdownHead}>
            <Text style={[styles.sortDropdownHeadText, { color: theme.textMuted }]}>
              URUTKAN KOLEKSI
            </Text>
          </View>

          {[
            {
              id: "newest" as SortOption,
              label: "Terbaru",
              desc: "Dibuat paling baru",
              icon: <Clock size={15} color="#000000" />,
            },
            {
              id: "oldest" as SortOption,
              label: "Terlama",
              desc: "Dibuat paling awal",
              icon: <History size={15} color="#000000" />,
            },
            {
              id: "title" as SortOption,
              label: "Nama A–Z",
              desc: "Urut abjad alfabet",
              icon: <ArrowDownAZ size={15} color="#000000" />,
            },
          ].map((opt, idx, arr) => {
            const isSelected = sortOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                style={[
                  styles.sortDropdownRow,
                  isSelected && styles.sortDropdownRowSelected,
                  idx < arr.length - 1 && styles.sortDropdownRowBorder,
                  { borderBottomColor: isDark ? "#4A4640" : "#F0ECE1" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSortOption(opt.id);
                  setSortMenuVisible(false);
                }}
              >
                <View style={styles.sortRowLeft}>
                  <View
                    style={[
                      styles.sortIconCircle,
                      isSelected && styles.sortIconCircleSelected,
                    ]}
                  >
                    {opt.icon}
                  </View>
                  <View>
                    <Text style={[styles.sortRowLabel, { color: theme.text }]}>
                      {opt.label}
                    </Text>
                    <Text
                      style={[styles.sortRowDesc, { color: theme.textMuted }]}
                    >
                      {opt.desc}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.sortCheckPill}>
                    <Check size={12} color="#000000" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 10,
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
  sortModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  sortDropdownCard: {
    position: "absolute",
    width: 220,
    borderRadius: 12,
    borderWidth: 2,
    padding: 6,
    ...NEO_SHADOW_SM,
    zIndex: 9999,
  },
  sortDropdownHead: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE6DE",
    marginBottom: 4,
  },
  sortDropdownHeadText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sortDropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortDropdownRowSelected: {
    backgroundColor: "#FFF9E6",
  },
  sortDropdownRowBorder: {
    borderBottomWidth: 1,
  },
  sortRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#F5F0E8",
    justifyContent: "center",
    alignItems: "center",
  },
  sortIconCircleSelected: {
    backgroundColor: "#F7CB54",
  },
  sortRowLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  sortRowDesc: {
    fontSize: 10,
    fontWeight: "500",
  },
  sortCheckPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
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
  detectedBanner: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
    gap: 8,
  },
  detectedBannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detectedBadgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  detectedDismissBtn: {
    padding: 4,
  },
  detectedUrlText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  detectedBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  detectedDismissTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  detectedDismissText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detectedSaveBtn: {
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  detectedSaveBtnText: {
    fontSize: 12,
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
  seeAllText: {
    fontSize: 12,
    fontWeight: "800",
  },
  speedDialBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 90,
  },
  speedDialContainer: {
    position: "absolute",
    bottom: 94,
    right: 20,
    zIndex: 95,
    gap: 14,
    alignItems: "flex-end",
  },
  speedDialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  speedDialLabelPill: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...NEO_SHADOW_SM,
  },
  speedDialLabelText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  speedDialBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    ...NEO_SHADOW_SM,
    position: "relative",
  },
  bubbleNotificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#000000",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  bubbleNotificationText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
});
