import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  Bookmark,
  Folder,
  Inbox,
  Clock,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import {
  THEME_LIGHT,
  THEME_DARK,
  NEO_SHADOW_SM,
} from "../src/constants/theme";
import { NeoCard } from "../src/components/ui/NeoCard";
import { safeBack } from "../src/utils/navigation";
import {
  formatDeadlineFullDate,
  formatDeadlineDate,
  getDeadlineStatus,
} from "../src/utils/deadlineNumberDetector";
import { PlatformLogo } from "../src/components/ui/PlatformLogo";
import { LinkThumbnail } from "../src/components/ui/LinkThumbnail";
import { SavedItem } from "../src/types/models";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 32 - 16) / 3; // 3 columns with 8px gap

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type ArchiveMainView = "calendar" | "grid";

interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateKey: string; // YYYY-MM-DD
}

function formatClockTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const items = useSimpanInStore((state) => state.items);
  const collections = useSimpanInStore((state) => state.collections);

  // Main View: Instagram-style toggle between "calendar" and "grid"
  const [mainView, setMainView] = useState<ArchiveMainView>("calendar");

  // Current calendar view month/year
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Selected date key (YYYY-MM-DD)
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Map of dateKey -> items SAVED on that date (createdAt)
  const savedItemsByDate = useMemo(() => {
    const map = new Map<string, SavedItem[]>();
    for (const item of items) {
      if (item.createdAt) {
        const d = new Date(item.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const list = map.get(key) || [];
        list.push(item);
        map.set(key, list);
      }
    }
    return map;
  }, [items]);

  // Map of dateKey -> items with DEADLINE on that date
  const deadlineItemsByDate = useMemo(() => {
    const map = new Map<string, SavedItem[]>();
    for (const item of items) {
      if (item.deadline) {
        const d = new Date(item.deadline);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const list = map.get(key) || [];
        list.push(item);
        map.set(key, list);
      }
    }
    return map;
  }, [items]);

  // All items sorted newest to oldest for the Instagram-style Grid view
  const allSavedItemsChronological = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt - a.createdAt);
  }, [items]);

  // All items with deadlines
  const allDeadlineItems = useMemo(() => {
    return items
      .filter((i) => Boolean(i.deadline))
      .sort((a, b) => (a.deadline || 0) - (b.deadline || 0));
  }, [items]);

  // Metrics for the currently viewed month
  const monthActivityCount = useMemo(() => {
    let deadlines = 0;
    let saved = 0;
    for (const item of allDeadlineItems) {
      if (item.deadline) {
        const d = new Date(item.deadline);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          deadlines++;
        }
      }
    }
    for (const item of items) {
      const d = new Date(item.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        saved++;
      }
    }
    return { deadlines, saved };
  }, [allDeadlineItems, items, currentYear, currentMonth]);

  // Month navigation
  const prevMonth = () => {
    Haptics.selectionAsync();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    Haptics.selectionAsync();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    Haptics.selectionAsync();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateKey(todayKey);
  };

  // Generate calendar grid (Monday-first)
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: CalendarCell[] = [];

    // Leading days from previous month
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateKey = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        month: prevMonthIdx,
        year: prevYear,
        isCurrentMonth: false,
        dateKey,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateKey,
      });
    }

    // Trailing days from next month
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const dateKey = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        month: nextMonthIdx,
        year: nextYear,
        isCurrentMonth: false,
        dateKey,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Selected date items
  const selectedDateDeadlineItems = useMemo(() => {
    return deadlineItemsByDate.get(selectedDateKey) || [];
  }, [deadlineItemsByDate, selectedDateKey]);

  const selectedDateSavedItems = useMemo(() => {
    return savedItemsByDate.get(selectedDateKey) || [];
  }, [savedItemsByDate, selectedDateKey]);

  // Combined unique items for selected date
  const selectedDateItems = useMemo(() => {
    const seen = new Set<string>();
    const list: SavedItem[] = [];

    for (const it of selectedDateSavedItems) {
      if (!seen.has(it.id)) {
        seen.add(it.id);
        list.push(it);
      }
    }
    for (const it of selectedDateDeadlineItems) {
      if (!seen.has(it.id)) {
        seen.add(it.id);
        list.push(it);
      }
    }
    return list;
  }, [selectedDateDeadlineItems, selectedDateSavedItems]);

  const selectedDateFormatted = useMemo(() => {
    const parts = selectedDateKey.split("-").map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return formatDeadlineFullDate(d.getTime());
    }
    return selectedDateKey;
  }, [selectedDateKey]);

  const isViewingToday =
    selectedDateKey === todayKey &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const selectedDateHeading =
    selectedDateKey === todayKey ? "Hari Ini" : selectedDateFormatted;

  const selectedDateSubheading =
    selectedDateKey === todayKey
      ? `${selectedDateFormatted} · ${selectedDateSavedItems.length} postingan disimpan`
      : `${selectedDateSavedItems.length} postingan disimpan · ${selectedDateDeadlineItems.length} tenggat`;

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header - Exact 68px height & 2px border */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
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

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Arsip Simpanan
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Linimasa postingan & tanggal simpan
          </Text>
        </View>

        {!isViewingToday ? (
          <TouchableOpacity
            style={[styles.todayQuickBtn, { borderColor: isDark ? "#4A4640" : "#000000" }]}
            onPress={jumpToToday}
            accessibilityLabel="Kembali ke Hari Ini"
          >
            <Text style={styles.todayQuickBtnText}>Hari Ini</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clean Instagram Archive Switcher Tabs: Kalender vs Grid */}
        <View style={styles.igViewSwitcher}>
          <TouchableOpacity
            style={[
              styles.igSwitchTab,
              mainView === "calendar" && styles.igSwitchTabActive,
              { backgroundColor: mainView === "calendar" ? "#F7CB54" : theme.card },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setMainView("calendar");
            }}
          >
            <CalendarIcon size={15} color="#000000" />
            <Text style={styles.igSwitchTabText}>Kalender Arsip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.igSwitchTab,
              mainView === "grid" && styles.igSwitchTabActive,
              { backgroundColor: mainView === "grid" ? "#F7CB54" : theme.card },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setMainView("grid");
            }}
          >
            <LayoutGrid size={15} color="#000000" />
            <Text style={styles.igSwitchTabText}>
              Grid Semua Arsip ({items.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* VIEW 1: KALENDER ARSIP (INSTAGRAM ARCHIVE CALENDAR STYLE) */}
        {/* ========================================================= */}
        {mainView === "calendar" && (
          <>
            {/* Hero: Month Navigation & Visual Archive Calendar Grid */}
            <NeoCard color={theme.card} style={styles.calendarContainerCard}>
              {/* Month Navigation Header */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  style={styles.monthArrowBtn}
                  onPress={prevMonth}
                  accessibilityLabel="Bulan Sebelumnya"
                >
                  <ChevronLeft size={20} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.monthTitleWrapper}>
                  <Text style={[styles.monthTitleText, { color: theme.text }]}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </Text>
                  <Text style={[styles.monthSubtitleText, { color: theme.textMuted }]}>
                    {monthActivityCount.saved} postingan disimpan · {monthActivityCount.deadlines} tenggat
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.monthArrowBtn}
                  onPress={nextMonth}
                  accessibilityLabel="Bulan Berikutnya"
                >
                  <ChevronRight size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Days of Week Header */}
              <View style={styles.dayLabelsRow}>
                {DAY_LABELS.map((label, idx) => (
                  <View key={label} style={styles.dayLabelCell}>
                    <Text
                      style={[
                        styles.dayLabelText,
                        idx >= 5 && styles.dayLabelWeekend,
                        { color: theme.textMuted },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Instagram Archive Visual Calendar Grid - Spacious with clean gaps */}
              <View style={styles.gridContainer}>
                {calendarGrid.map((cell) => {
                  const isSelected = cell.dateKey === selectedDateKey;
                  const isToday = cell.dateKey === todayKey;

                  const cellSaved = savedItemsByDate.get(cell.dateKey) || [];
                  const cellDeadlines = deadlineItemsByDate.get(cell.dateKey) || [];

                  const hasSaved = cellSaved.length > 0;
                  const hasDeadlines = cellDeadlines.length > 0;

                  const firstSavedItem = cellSaved[0];
                  const hasThumbImage = Boolean(firstSavedItem?.image);

                  return (
                    <TouchableOpacity
                      key={cell.dateKey}
                      activeOpacity={0.8}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedDateKey(cell.dateKey);
                      }}
                      style={[
                        styles.archiveGridCell,
                        isToday && !isSelected && styles.archiveGridCellToday,
                        isSelected && styles.archiveGridCellSelected,
                        hasSaved && !isSelected && styles.archiveGridCellHasSaved,
                      ]}
                    >
                      {/* Media Preview on Days with Saved Posts */}
                      {hasSaved && firstSavedItem && (
                        <View style={styles.cellVisualContainer}>
                          {hasThumbImage ? (
                            <Image
                              source={{ uri: firstSavedItem.image }}
                              style={StyleSheet.absoluteFill}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.cellPlatformFallback}>
                              <PlatformLogo platform={firstSavedItem.source} size={14} />
                            </View>
                          )}
                          <View style={styles.cellDarkOverlay} />
                        </View>
                      )}

                      {/* Day Number - Clear, bold, readable */}
                      <Text
                        style={[
                          styles.cellDayText,
                          !cell.isCurrentMonth && styles.cellDayTextMuted,
                          hasSaved && styles.cellDayTextWhite,
                          isSelected && styles.cellDayTextSelected,
                          {
                            color: isSelected
                              ? "#000000"
                              : hasSaved
                              ? "#FFFFFF"
                              : cell.isCurrentMonth
                              ? theme.text
                              : "#B0AAA0",
                          },
                        ]}
                      >
                        {cell.day}
                      </Text>

                      {/* If multiple items saved on this day: +N counter */}
                      {hasSaved && cellSaved.length > 1 && (
                        <View style={styles.cellMultipleBadge}>
                          <Text style={styles.cellMultipleBadgeText}>
                            +{cellSaved.length - 1}
                          </Text>
                        </View>
                      )}

                      {/* Deadline Indicator Dot */}
                      {hasDeadlines && (
                        <View
                          style={[
                            styles.cellDeadlineDot,
                            cellDeadlines.some((d) => d.deadline && d.deadline < Date.now())
                              ? styles.cellDeadlineDotPassed
                              : styles.cellDeadlineDotActive,
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Instagram Archive Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendMiniThumb}>
                    <Bookmark size={9} color="#000000" />
                  </View>
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>
                    Thumbnail = Postingan Disimpan
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>
                    Tenggat Waktu
                  </Text>
                </View>
              </View>
            </NeoCard>

            {/* Selected Date Detail Section ("Arsip Tanggal Ini") */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    {selectedDateHeading}
                  </Text>
                  <Text style={[styles.sectionSubheading, { color: theme.textMuted }]}>
                    {selectedDateSubheading}
                  </Text>
                </View>
              </View>

              {selectedDateItems.length > 0 ? (
                <View style={styles.itemsList}>
                  {selectedDateItems.map((item) => {
                    const collection = collections.find(
                      (c) => c.id === item.collectionId
                    );
                    const isSavedOnDate = selectedDateSavedItems.some(
                      (s) => s.id === item.id
                    );
                    const isDeadlineOnDate = selectedDateDeadlineItems.some(
                      (d) => d.id === item.id
                    );
                    const status = item.deadline
                      ? getDeadlineStatus(item.deadline)
                      : null;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() => {
                          Haptics.selectionAsync();
                          router.push(`/link/${item.id}`);
                        }}
                        style={[
                          styles.archiveItemCard,
                          { backgroundColor: theme.card },
                        ]}
                      >
                        {/* Media Thumbnail */}
                        <View style={styles.archiveThumbWrapper}>
                          <LinkThumbnail
                            image={item.image}
                            tags={item.tags}
                            symbolSize="sm"
                            style={styles.archiveThumbnail}
                          />
                          <View style={styles.platformBadgeFloating}>
                            <PlatformLogo platform={item.source} size={14} />
                          </View>
                        </View>

                        {/* Card Content */}
                        <View style={styles.archiveCardBody}>
                          <View style={styles.archiveBadgesRow}>
                            {isSavedOnDate && (
                              <View style={styles.savedTimestampBadge}>
                                <Bookmark size={10} color="#000000" />
                                <Text style={styles.savedTimestampText}>
                                  Disimpan {formatClockTime(item.createdAt)}
                                </Text>
                              </View>
                            )}

                            {isDeadlineOnDate && status && (
                              <View
                                style={[
                                  styles.urgencyBadge,
                                  status.urgency === "passed" && styles.urgencyPassed,
                                  status.urgency === "urgent" && styles.urgencyUrgent,
                                  status.urgency === "warning" && styles.urgencyWarning,
                                ]}
                              >
                                <Text style={styles.urgencyText}>
                                  ⏰ {status.badgeLabel}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text
                            style={[styles.itemTitle, { color: theme.text }]}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>

                          {item.notes ? (
                            <Text
                              style={[styles.itemNotes, { color: theme.textSecondary }]}
                              numberOfLines={1}
                            >
                              {item.notes}
                            </Text>
                          ) : null}

                          <View style={styles.itemFooter}>
                            {collection ? (
                              <View
                                style={[
                                  styles.collectionTag,
                                  { backgroundColor: collection.color || "#F5F0E8" },
                                ]}
                              >
                                <Folder size={11} color="#000000" />
                                <Text style={styles.collectionTagText}>
                                  {collection.name}
                                </Text>
                              </View>
                            ) : (
                              <View />
                            )}

                            <View style={styles.viewDetailPill}>
                              <Text style={styles.viewDetailPillText}>Detail →</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                  <View style={styles.emptyIconCircle}>
                    <Inbox size={26} color="#666158" strokeWidth={2} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    Tidak Ada Postingan di Tanggal Ini
                  </Text>
                  <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                    Kamu belum menyimpan tautan apa pun pada tanggal ini. Pilih tanggal yang memiliki thumbnail di kalender untuk melihat arsip simpananmu.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: GRID SEMUA ARSIP (INSTAGRAM PROFILE/ARCHIVE GRID)  */}
        {/* ========================================================= */}
        {mainView === "grid" && (
          <View style={styles.gridSectionContainer}>
            <View style={styles.gridSectionHeader}>
              <Text style={[styles.gridSectionTitle, { color: theme.text }]}>
                Semua Koleksi Simpanan
              </Text>
              <Text style={[styles.gridSectionSubtitle, { color: theme.textMuted }]}>
                Jelajahi semua postingan berurutan dengan tanggal simpan
              </Text>
            </View>

            {allSavedItemsChronological.length > 0 ? (
              <View style={styles.mediaGridRow}>
                {allSavedItemsChronological.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.selectionAsync();
                      router.push(`/link/${item.id}`);
                    }}
                    style={styles.mediaGridItem}
                  >
                    <LinkThumbnail
                      image={item.image}
                      tags={item.tags}
                      symbolSize="sm"
                      style={styles.mediaGridThumbnail}
                    >
                      {/* Floating Platform Icon */}
                      <View style={styles.mediaGridPlatformBadge}>
                        <PlatformLogo platform={item.source} size={13} />
                      </View>

                      {/* Date Stamp Tag at Bottom */}
                      <View style={styles.mediaGridDateTag}>
                        <Text style={styles.mediaGridDateText}>
                          {formatDeadlineDate(item.createdAt, { withDay: false })}
                        </Text>
                      </View>
                    </LinkThumbnail>

                    <Text
                      style={[styles.mediaGridTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <View style={styles.emptyIconCircle}>
                  <Inbox size={26} color="#666158" strokeWidth={2} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Belum Ada Postingan Disimpan
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Mulai simpan tautan dari Instagram, TikTok, YouTube, atau web untuk melihat arsip linimasa visualmu di sini.
                </Text>
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
  header: {
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
    ...NEO_SHADOW_SM,
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  todayQuickBtn: {
    height: 42,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    ...NEO_SHADOW_SM,
  },
  todayQuickBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
  },
  headerRightPlaceholder: {
    width: 42,
    height: 42,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  // Instagram Archive Tabs: Single Clean Row with Good Breathing Room
  igViewSwitcher: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  igSwitchTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 9,
    paddingVertical: 10,
    ...NEO_SHADOW_SM,
  },
  igSwitchTabActive: {
    borderWidth: 2,
  },
  igSwitchTabText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
  },
  // Calendar Hero Container Card
  calendarContainerCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...NEO_SHADOW_SM,
  },
  monthTitleWrapper: {
    alignItems: "center",
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: "900",
  },
  monthSubtitleText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
  dayLabelsRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#EAE6DE",
    paddingBottom: 8,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: "center",
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dayLabelWeekend: {
    color: "#EF4444",
  },
  // Grid Container - 7 columns with explicit horizontal & vertical spacing
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Spacious Archive Grid Cell: each cell has width ~13.5% with margins so they NEVER touch
  archiveGridCell: {
    width: "13.6%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 8,
    marginVertical: 4,
    overflow: "hidden",
  },
  archiveGridCellSelected: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    ...NEO_SHADOW_SM,
  },
  archiveGridCellToday: {
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#FFF9E6",
  },
  archiveGridCellHasSaved: {
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  cellVisualContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    overflow: "hidden",
  },
  cellPlatformFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F0EAE1",
    justifyContent: "center",
    alignItems: "center",
  },
  cellDarkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  cellDayText: {
    fontSize: 13,
    fontWeight: "800",
  },
  cellDayTextMuted: {
    opacity: 0.35,
  },
  cellDayTextWhite: {
    color: "#FFFFFF",
    fontWeight: "900",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cellDayTextSelected: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
  cellMultipleBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#F7CB54",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
  },
  cellMultipleBadgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#000000",
  },
  cellDeadlineDot: {
    position: "absolute",
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#000000",
  },
  cellDeadlineDotActive: {
    backgroundColor: "#EF4444",
  },
  cellDeadlineDotPassed: {
    backgroundColor: "#EF4444",
  },
  // Legend
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EAE6DE",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendMiniThumb: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#F7CB54",
    justifyContent: "center",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#000000",
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Selected Date Section
  sectionContainer: {
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  sectionSubheading: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  itemsList: {
    gap: 12,
  },
  archiveItemCard: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    ...NEO_SHADOW_SM,
  },
  archiveThumbWrapper: {
    width: 84,
    height: 84,
    position: "relative",
  },
  archiveThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  platformBadgeFloating: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#000000",
    padding: 2,
  },
  archiveCardBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  archiveBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  savedTimestampBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#69B7F4",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savedTimestampText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
  urgencyBadge: {
    backgroundColor: "#F7CB54",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgencyPassed: {
    backgroundColor: "#FCA5A5",
  },
  urgencyUrgent: {
    backgroundColor: "#F87171",
  },
  urgencyWarning: {
    backgroundColor: "#FDE68A",
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 6,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  collectionTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  collectionTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
  },
  viewDetailPill: {
    backgroundColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  viewDetailPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  // Empty State
  emptyCard: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    ...NEO_SHADOW_SM,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F0E8",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  // Grid Media View (Instagram 3-Column Profile/Archive Feed)
  gridSectionContainer: {
    marginTop: 4,
  },
  gridSectionHeader: {
    marginBottom: 14,
  },
  gridSectionTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  gridSectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  mediaGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mediaGridItem: {
    width: GRID_ITEM_SIZE,
    marginBottom: 12,
  },
  mediaGridThumbnail: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    overflow: "hidden",
    position: "relative",
    ...NEO_SHADOW_SM,
  },
  mediaGridPlatformBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 2,
  },
  mediaGridDateTag: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  mediaGridDateText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  mediaGridTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
});
