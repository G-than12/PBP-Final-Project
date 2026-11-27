import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, Trash2, Clock } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import {
  formatDeadlineDate,
  formatDeadlineFullDate,
  calculateReminderTimestamp,
  getDeadlineStatus,
} from "../../utils/deadlineNumberDetector";

interface DeadlinePickerSheetProps {
  visible: boolean;
  initialDeadline?: number | null;
  initialTiming?: "h3" | "h1" | "h0" | "custom" | null;
  onClose: () => void;
  onApply: (deadline: number, timing: "h3" | "h1" | "h0" | "custom") => void;
  onRemove?: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function DeadlinePickerSheet({
  visible,
  initialDeadline,
  initialTiming = "h1",
  onClose,
  onApply,
  onRemove,
}: DeadlinePickerSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const now = useMemo(() => new Date(), []);
  
  // Selected date components
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDeadline) return new Date(initialDeadline);
    // Default to 7 days from today
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
  });

  // Calendar view month & year
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  // Selected reminder timing preset
  const [selectedTiming, setSelectedTiming] = useState<"h3" | "h1" | "h0" | "custom">(
    initialTiming || "h1"
  );

  React.useEffect(() => {
    if (visible) {
      const base = initialDeadline ? new Date(initialDeadline) : new Date(Date.now() + 7 * 86400000);
      setSelectedDate(base);
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setSelectedTiming(initialTiming || "h1");
    }
  }, [visible, initialDeadline, initialTiming]);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    Haptics.selectionAsync();
    const d = new Date(viewYear, viewMonth, day, 23, 59, 59, 999);
    setSelectedDate(d);
  };

  const handleQuickPresetDays = (daysFromNow: number) => {
    Haptics.selectionAsync();
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 59, 999);
    setSelectedDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const selectedTimestamp = selectedDate.getTime();
  const deadlineStatus = useMemo(() => {
    return getDeadlineStatus(selectedTimestamp);
  }, [selectedTimestamp]);

  const reminderScheduledTime = useMemo(() => {
    return calculateReminderTimestamp(selectedTimestamp, selectedTiming);
  }, [selectedTimestamp, selectedTiming]);

  const formattedReminderDate = useMemo(() => {
    return formatDeadlineFullDate(reminderScheduledTime);
  }, [reminderScheduledTime]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApply(selectedTimestamp, selectedTiming);
    onClose();
  };

  return (
    <NeoBottomSheet
      visible={visible}
      title="Atur Pengingat Tenggat"
      onClose={onClose}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Selected Date Banner */}
        <View
          style={[
            styles.selectedBanner,
            {
              backgroundColor: isDark ? "#2A2723" : "#F7CB54",
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={styles.bannerIcon}>
            <CalendarIcon size={20} color={isDark ? theme.accentYellow : "#000000"} strokeWidth={2.5} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerDateText, { color: isDark ? theme.text : "#000000" }]}>
              {formatDeadlineFullDate(selectedTimestamp)}
            </Text>
            <Text style={[styles.bannerStatusText, { color: isDark ? theme.textMuted : "#222222" }]}>
              {deadlineStatus.label}
            </Text>
          </View>
        </View>

        {/* Quick Date Shortcuts */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pilihan Cepat</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
            <TouchableOpacity
              style={[
                styles.quickChip,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => handleQuickPresetDays(1)}
            >
              <Text style={[styles.quickChipText, { color: theme.text }]}>Besok</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickChip,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => handleQuickPresetDays(3)}
            >
              <Text style={[styles.quickChipText, { color: theme.text }]}>+3 Hari</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickChip,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => handleQuickPresetDays(7)}
            >
              <Text style={[styles.quickChipText, { color: theme.text }]}>+1 Minggu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickChip,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => handleQuickPresetDays(14)}
            >
              <Text style={[styles.quickChipText, { color: theme.text }]}>+2 Minggu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickChip,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => handleQuickPresetDays(30)}
            >
              <Text style={[styles.quickChipText, { color: theme.text }]}>+1 Bulan</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Mini Calendar Navigator */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          {/* Month Header */}
          <View style={styles.monthHeaderRow}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={handlePrevMonth}
            >
              <ChevronLeft size={18} color={theme.text} strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={[styles.monthHeaderText, { color: theme.text }]}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <TouchableOpacity
              style={[
                styles.navBtn,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={handleNextMonth}
            >
              <ChevronRight size={18} color={theme.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Day Names Header */}
          <View style={styles.dayNamesRow}>
            {DAY_LABELS.map((label, idx) => (
              <Text
                key={label}
                style={[
                  styles.dayLabelText,
                  { color: idx === 0 ? "#FF6B6B" : theme.textSecondary },
                ]}
              >
                {label}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Blank offset placeholders */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.dayCellPlaceholder} />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;

              const isToday =
                now.getDate() === day &&
                now.getMonth() === viewMonth &&
                now.getFullYear() === viewYear;

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    {
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                    isSelected
                      ? styles.dayCellSelected
                      : isToday
                      ? [
                          styles.dayCellToday,
                          {
                            backgroundColor: theme.cardSecondary,
                            borderColor: isDark ? theme.accentYellow : "#000000",
                          },
                        ]
                      : { backgroundColor: theme.cardSecondary },
                  ]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      isSelected
                        ? styles.dayCellTextSelected
                        : { color: theme.text },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reminder Notification Timing Presets */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeadRow}>
            <Bell size={16} color={theme.text} strokeWidth={2.2} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Waktu Notifikasi</Text>
          </View>

          <View style={styles.timingChipsRow}>
            <TouchableOpacity
              style={[
                styles.timingChip,
                {
                  backgroundColor:
                    selectedTiming === "h3" ? "#F7CB54" : theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                selectedTiming === "h3" && styles.timingChipActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedTiming("h3");
              }}
            >
              <Text
                style={[
                  styles.timingChipText,
                  { color: selectedTiming === "h3" ? "#000000" : theme.text },
                ]}
              >
                H-3
              </Text>
              <Text
                style={[
                  styles.timingChipSub,
                  { color: selectedTiming === "h3" ? "#222222" : theme.textSecondary },
                ]}
              >
                3 hari sebelum
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timingChip,
                {
                  backgroundColor:
                    selectedTiming === "h1" ? "#F7CB54" : theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                selectedTiming === "h1" && styles.timingChipActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedTiming("h1");
              }}
            >
              <Text
                style={[
                  styles.timingChipText,
                  { color: selectedTiming === "h1" ? "#000000" : theme.text },
                ]}
              >
                H-1
              </Text>
              <Text
                style={[
                  styles.timingChipSub,
                  { color: selectedTiming === "h1" ? "#222222" : theme.textSecondary },
                ]}
              >
                1 hari sebelum
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timingChip,
                {
                  backgroundColor:
                    selectedTiming === "h0" ? "#F7CB54" : theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                selectedTiming === "h0" && styles.timingChipActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedTiming("h0");
              }}
            >
              <Text
                style={[
                  styles.timingChipText,
                  { color: selectedTiming === "h0" ? "#000000" : theme.text },
                ]}
              >
                Hari H
              </Text>
              <Text
                style={[
                  styles.timingChipSub,
                  { color: selectedTiming === "h0" ? "#222222" : theme.textSecondary },
                ]}
              >
                Pukul 08:00
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info note */}
          <View
            style={[
              styles.reminderInfoBox,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <Clock size={14} color={theme.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.reminderInfoText, { color: theme.textSecondary }]}>
              {selectedTiming === "h3" && `Notifikasi: 3 hari sebelum tenggat (09:00 WIB)`}
              {selectedTiming === "h1" && `Notifikasi: 1 hari sebelum tenggat (09:00 WIB)`}
              {selectedTiming === "h0" && `Notifikasi: Tepat di hari H tenggat (08:00 WIB)`}
              {selectedTiming === "custom" && `Notifikasi kustom terjadwal`}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsCol}>
          <NeoButton
            variant="primary"
            size="md"
            onPress={handleSave}
            style={styles.saveBtn}
          >
            Pasang Pengingat
          </NeoButton>

          {initialDeadline && onRemove && (
            <TouchableOpacity
              style={[
                styles.removeBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onRemove();
                onClose();
              }}
            >
              <Trash2 size={15} color="#FF6B6B" strokeWidth={2.2} />
              <Text style={styles.removeBtnText}>Hapus Pengingat Tenggat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  selectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerDateText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 2,
  },
  bannerStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222222",
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: "row",
  },
  quickChip: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  calendarCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthHeaderText: {
    fontSize: 15,
    fontWeight: "800",
  },
  navBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dayLabelText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellPlaceholder: {
    width: `${100 / 7}%`,
    height: 36,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: "#000000",
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dayCellTextSelected: {
    color: "#000000",
    fontWeight: "900",
  },
  timingChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  timingChip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  timingChipActive: {
    borderColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
  },
  timingChipText: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2,
  },
  timingChipSub: {
    fontSize: 10,
    fontWeight: "600",
  },
  reminderInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  reminderInfoText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  actionButtonsCol: {
    marginTop: 8,
    gap: 8,
  },
  saveBtn: {
    width: "100%",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B6B",
  },
});
