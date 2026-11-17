import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  Plus,
  X,
  Clipboard as ClipboardIcon,
  RefreshCw,
  Pin,
  Calendar,
  Clock,
} from "lucide-react-native";
import { Collection } from "../../types/models";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import {
  extractFirstUrl,
  fetchUrlMetadata,
  isFetchableUrl,
  normalizeUrl,
  parseUrlMetadata,
  preserveFormattingDescription,
} from "../../utils/metadataParser";
import {
  detectDeadlineFromText,
  formatDeadlineDate,
  calculateReminderTimestamp,
} from "../../utils/deadlineNumberDetector";
import { scheduleDeadlineNotification } from "../../utils/notificationManager";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { AppIcon } from "../ui/AppIcon";
import { LinkThumbnail } from "../ui/LinkThumbnail";
import { TagBadge } from "../ui/TagBadge";
import { DeadlinePickerSheet } from "./DeadlinePickerSheet";

interface SaveLinkSheetProps {
  visible: boolean;
  collections: Collection[];
  initialUrl?: string;
  defaultCollectionId?: string;
  onClose: () => void;
  onSave: (data: {
    url: string;
    title: string;
    description?: string;
    source?: string;
    collectionId: string;
    isPinned: boolean;
    notes?: string;
    tags?: string[];
    image?: string;
    author?: string;
    deadline?: number | null;
    reminderTiming?: "h3" | "h1" | "h0" | "custom" | null;
    reminderNotificationId?: string | null;
  }) => void;
  onRequestCreateCollection: () => void;
}

export function SaveLinkSheet({
  visible,
  collections,
  initialUrl = "",
  defaultCollectionId,
  onClose,
  onSave,
  onRequestCreateCollection,
}: SaveLinkSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const autoExtractMetadata = useSimpanInStore(
    (state) => state.settings.autoExtractMetadata
  );
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedColId, setSelectedColId] = useState(
    defaultCollectionId || collections[0]?.id || "inbox"
  );
  const [isPinned, setIsPinned] = useState(false);
  const [notes, setNotes] = useState("");
  const [author, setAuthor] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [detectedPlatform, setDetectedPlatform] = useState("Web");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaNotice, setMetaNotice] = useState<string | null>(null);

  // Deadline & Smart Reminder State
  const [deadline, setDeadline] = useState<number | null>(null);
  const [reminderTiming, setReminderTiming] = useState<"h3" | "h1" | "h0" | "custom">("h1");
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [detectedDeadline, setDetectedDeadline] = useState<ReturnType<typeof detectDeadlineFromText>>(null);

  const isTitleManualRef = useRef(false);
  const isDescManualRef = useRef(false);
  const isImageManualRef = useRef(false);
  const isTagsManualRef = useRef(false);
  const fetchRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingFetch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const runMetadataFetch = async (targetUrl: string) => {
    const cleanTarget = extractFirstUrl(targetUrl);
    if (!isFetchableUrl(cleanTarget)) return;

    const reqId = ++fetchRequestIdRef.current;
    setIsFetchingMeta(true);
    setMetaNotice(null);

    try {
      const meta = await fetchUrlMetadata(cleanTarget);
      if (reqId !== fetchRequestIdRef.current) return;

      setDetectedPlatform(meta.platform);
      if (meta.author) {
        setAuthor(meta.author);
      }
      if (!isTitleManualRef.current) {
        setTitle(meta.title);
      }
      if (!isDescManualRef.current) {
        setDescription(meta.description);
      }
      if (!isImageManualRef.current) {
        setImageUrl(meta.image || "");
      }
      if (!isTagsManualRef.current && meta.suggestedTags.length > 0) {
        setTags(meta.suggestedTags);
      }
      setMetaNotice(meta.notice || null);

      // Auto-detect deadline from meta title/description
      const detected = detectDeadlineFromText(`${meta.title} ${meta.description}`);
      if (detected) {
        setDetectedDeadline(detected);
      }
    } catch {
      if (reqId !== fetchRequestIdRef.current) return;
      setMetaNotice("Gagal mengambil pratinjau tautan otomatis.");
    } finally {
      if (reqId === fetchRequestIdRef.current) {
        setIsFetchingMeta(false);
      }
    }
  };

  const handleUrlChange = (newUrl: string, immediate = false) => {
    setUrl(newUrl);
    clearPendingFetch();

    const trimmed = newUrl.trim();
    if (trimmed.length <= 4) return;

    const parsed = parseUrlMetadata(trimmed);
    setDetectedPlatform(parsed.platform);

    if (!isTitleManualRef.current) {
      setTitle(parsed.inferredTitle);
    }
    if (!isDescManualRef.current) {
      setDescription(parsed.inferredDescription);
    }
    if (!isImageManualRef.current) {
      setImageUrl("");
    }
    if (!isTagsManualRef.current && parsed.suggestedTags.length > 0) {
      setTags(parsed.suggestedTags);
    }

    // Auto-detect deadline from inferred info or raw URL
    const detected = detectDeadlineFromText(
      `${parsed.inferredTitle} ${parsed.inferredDescription} ${trimmed}`
    );
    if (detected) {
      setDetectedDeadline(detected);
    }

    if (autoExtractMetadata && isFetchableUrl(trimmed)) {
      if (immediate) {
        runMetadataFetch(trimmed);
      } else {
        debounceTimerRef.current = setTimeout(() => {
          runMetadataFetch(trimmed);
        }, 450);
      }
    }
  };

  const resetAllFields = () => {
    clearPendingFetch();
    fetchRequestIdRef.current += 1;
    setUrl("");
    setTitle("");
    setDescription("");
    setAuthor("");
    setImageUrl("");
    setNotes("");
    setTags([]);
    setTagInput("");
    setIsPinned(false);
    setDeadline(null);
    setReminderTiming("h1");
    setShowDeadlineModal(false);
    setDetectedDeadline(null);
    setDetectedPlatform("Web");
    setIsFetchingMeta(false);
    setMetaNotice(null);
    isTitleManualRef.current = false;
    isDescManualRef.current = false;
    isImageManualRef.current = false;
    isTagsManualRef.current = false;
  };

  useEffect(() => {
    if (visible) {
      // Always reset all fields to completely fresh and empty upon opening
      resetAllFields();

      if (defaultCollectionId) {
        setSelectedColId(defaultCollectionId);
      } else if (collections[0]?.id) {
        setSelectedColId(collections[0].id);
      }

      // Only populate URL if explicitly provided from parent (e.g. Quick Save Bar)
      if (initialUrl && initialUrl.trim()) {
        handleUrlChange(initialUrl.trim(), true);
      }
    } else {
      resetAllFields();
    }

    return () => {
      clearPendingFetch();
    };
  }, [visible, initialUrl, defaultCollectionId]);

  const handleCloseSheet = () => {
    resetAllFields();
    onClose();
  };

  const handlePaste = async () => {
    Haptics.selectionAsync();
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        const extracted = extractFirstUrl(text);
        isTitleManualRef.current = false;
        isDescManualRef.current = false;
        isImageManualRef.current = false;
        isTagsManualRef.current = false;
        handleUrlChange(extracted || text, true);
      }
    } catch {
      // ignore clipboard error
    }
  };

  const handleManualRefreshMeta = () => {
    if (!isFetchableUrl(url)) return;
    Haptics.selectionAsync();
    isTitleManualRef.current = false;
    isDescManualRef.current = false;
    isImageManualRef.current = false;
    runMetadataFetch(url);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      isTagsManualRef.current = true;
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    isTagsManualRef.current = true;
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setMetaNotice("Silakan masukkan atau tempel URL tautan terlebih dahulu.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const cleanUrl = normalizeUrl(url);
    const parsed = parseUrlMetadata(cleanUrl);
    const finalTitle = title.trim() || parsed.inferredTitle;

    let notificationId: string | null = null;
    if (deadline) {
      const reminderTime = calculateReminderTimestamp(deadline, reminderTiming);
      notificationId = await scheduleDeadlineNotification({
        itemId: "temp_" + Date.now(),
        title: finalTitle,
        deadlineTimestamp: deadline,
        reminderTimestamp: reminderTime,
        timing: reminderTiming,
      });
    }

    onSave({
      url: cleanUrl,
      title: finalTitle,
      description: preserveFormattingDescription(description.trim()) || parsed.inferredDescription,
      source: detectedPlatform,
      author: author.trim() || undefined,
      collectionId: selectedColId,
      isPinned,
      notes: notes.trim(),
      tags,
      image: imageUrl.trim() || undefined,
      deadline,
      reminderTiming: deadline ? reminderTiming : null,
      reminderNotificationId: notificationId,
    });
    resetAllFields();
    onClose();
  };

  const selectedCol = collections.find((c) => c.id === selectedColId) || collections[0];

  return (
    <NeoBottomSheet visible={visible} title="Simpan Link" onClose={handleCloseSheet}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* URL Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>URL Link</Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="https://..."
              placeholderTextColor={theme.textSecondary}
              value={url}
              onChangeText={(val) => handleUrlChange(val, false)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={[
                styles.pasteBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={handlePaste}
            >
              <ClipboardIcon size={14} color={theme.text} />
              <Text style={[styles.pasteText, { color: theme.text }]}>Tempel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Metadata & Thumbnail Preview */}
        {url.trim().length > 4 && (
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <LinkThumbnail
              image={imageUrl}
              tags={tags}
              symbolSize="sm"
              style={styles.previewThumb}
            />
            <View style={styles.previewBody}>
              <View style={styles.previewTopRow}>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{detectedPlatform}</Text>
                </View>
                {isFetchableUrl(url) && (
                  <TouchableOpacity
                    style={[
                      styles.refreshMetaBtn,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={handleManualRefreshMeta}
                    disabled={isFetchingMeta}
                  >
                    {isFetchingMeta ? (
                      <ActivityIndicator size="small" color={theme.text} />
                    ) : (
                      <RefreshCw size={12} color={theme.text} />
                    )}
                    <Text style={[styles.refreshMetaText, { color: theme.text }]}>
                      {isFetchingMeta ? "Memuat..." : "Ambil Info"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text
                style={[styles.previewTitle, { color: theme.text }]}
                numberOfLines={2}
              >
                {isFetchingMeta
                  ? "Mengambil thumbnail, judul & deskripsi..."
                  : title || "Judul otomatis"}
              </Text>
              <Text
                style={[styles.previewDesc, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {description || "Deskripsi akan terisi otomatis dari tautan."}
              </Text>
            </View>
          </View>
        )}

        {metaNotice && (
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: isDark ? "#2E2B28" : "#FFF8DF",
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: theme.text }]}>
              {metaNotice}
            </Text>
          </View>
        )}

        {/* Smart Deadline Suggestion Pill */}
        {detectedDeadline && !deadline && (
          <TouchableOpacity
            style={[
              styles.detectedBox,
              {
                backgroundColor: isDark ? "#2E2B28" : "#FFF8DF",
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setDeadline(detectedDeadline.dateTimestamp);
              setReminderTiming("h1");
            }}
            activeOpacity={0.8}
          >
            <View style={styles.detectedLeft}>
              <Clock size={16} color={isDark ? "#F7CB54" : "#B45309"} strokeWidth={2.4} />
              <View style={styles.detectedTextWrap}>
                <Text style={[styles.detectedTitleText, { color: theme.text }]}>
                  Tenggat Terdeteksi:{" "}
                  <Text style={styles.detectedDateBold}>
                    {detectedDeadline.formattedDate}
                  </Text>
                </Text>
                <Text style={[styles.detectedSubText, { color: theme.textSecondary }]}>
                  Ketuk untuk memasang pengingat
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.detectedActionBadge,
                {
                  backgroundColor: "#F7CB54",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
            >
              <Text style={styles.detectedActionText}>Pasang</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Title Input + Pin Toggle Button */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Judul</Text>
          <View style={styles.inputWithPinRow}>
            <TextInput
              style={[
                styles.titleInputFlex,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                  color: theme.text,
                },
              ]}
              placeholder="Judul tautan..."
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={(txt) => {
                isTitleManualRef.current = txt.trim().length > 0;
                setTitle(txt);
              }}
            />
            <TouchableOpacity
              style={[
                styles.pinToggleBtn,
                {
                  backgroundColor: isPinned ? "#F7CB54" : theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setIsPinned(!isPinned);
              }}
              activeOpacity={0.8}
              accessibilityLabel={isPinned ? "Lepas sematan" : "Sematkan tautan"}
            >
              <Pin
                size={18}
                color={isPinned ? "#000000" : theme.textSecondary}
                fill={isPinned ? "#000000" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Deskripsi</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder="Tulis deskripsi..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={(txt) => {
              isDescManualRef.current = txt.trim().length > 0;
              setDescription(txt);
            }}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Collection Selector */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: theme.text }]}>Pilih Folder</Text>
            <TouchableOpacity onPress={onRequestCreateCollection}>
              <Text style={styles.newColText}>+ Folder Baru</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {collections.map((col) => {
              const isSelected = col.id === selectedColId;
              return (
                <TouchableOpacity
                  key={col.id}
                  style={[
                    styles.colChip,
                    {
                      backgroundColor: isSelected ? col.color : theme.cardSecondary,
                      borderColor: isSelected ? "#000000" : isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => setSelectedColId(col.id)}
                >
                  <AppIcon name={col.icon} size={15} color="#191919" />
                  <Text
                    style={[
                      styles.colChipText,
                      { color: isSelected ? "#000000" : theme.text },
                    ]}
                  >
                    {col.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tags input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tag</Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="Tambah tag..."
              placeholderTextColor={theme.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            {tagInput.trim().length > 0 && (
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Plus size={16} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            )}
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsWrapper}>
              {tags.map((t, idx) => (
                <TagBadge
                  key={t}
                  name={t}
                  index={idx}
                  onRemove={() => handleRemoveTag(t)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Notes input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Catatan</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder="Tulis catatan..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Deadline & Reminder Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Pengingat Tenggat</Text>
          {deadline ? (
            <View
              style={[
                styles.activeDeadlineContainer,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
            >
              <View style={styles.activeDeadlineHeader}>
                <View style={styles.activeDeadlineRow}>
                  <Calendar size={16} color={theme.text} strokeWidth={2.4} />
                  <Text style={[styles.activeDeadlineDate, { color: theme.text }]}>
                    {formatDeadlineDate(deadline, { withDay: true })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.removeDeadlineBtn,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDeadline(null);
                  }}
                  accessibilityLabel="Hapus tenggat waktu"
                >
                  <X size={14} color={theme.textSecondary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              <View style={styles.activeDeadlineFooter}>
                <TouchableOpacity
                  style={[
                    styles.timingPresetBadge,
                    {
                      backgroundColor: "#F7CB54",
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowDeadlineModal(true);
                  }}
                >
                  <Clock size={12} color="#000000" strokeWidth={2.5} />
                  <Text style={styles.timingPresetBadgeText}>
                    {reminderTiming === "h3"
                      ? "Notifikasi H-3 (09:00)"
                      : reminderTiming === "h1"
                      ? "Notifikasi H-1 (09:00)"
                      : "Notifikasi Hari H (08:00)"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.changeDateBtn,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowDeadlineModal(true);
                  }}
                >
                  <Text style={[styles.changeDateBtnText, { color: theme.text }]}>Ubah</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.setDeadlineTrigger,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setShowDeadlineModal(true);
              }}
              activeOpacity={0.8}
            >
              <Calendar size={16} color={theme.text} strokeWidth={2.2} />
              <Text style={[styles.setDeadlineTriggerText, { color: theme.text }]}>
                + Pasang Pengingat Tenggat
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save button */}
        <NeoButton
          variant="yellow"
          size="lg"
          onPress={handleSave}
          style={styles.submitBtn}
        >
          {url.trim()
            ? `Simpan ke "${selectedCol?.name || "Koleksi"}"`
            : "Simpan Tautan"}
        </NeoButton>
      </ScrollView>

      {/* Deadline Picker Modal */}
      <DeadlinePickerSheet
        visible={showDeadlineModal}
        initialDeadline={deadline}
        initialTiming={reminderTiming}
        onClose={() => setShowDeadlineModal(false)}
        onApply={(d, t) => {
          setDeadline(d);
          setReminderTiming(t);
        }}
        onRemove={() => setDeadline(null)}
      />
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  newColText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E1306C",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    height: 44,
    fontSize: 14,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
  },
  pasteText: {
    fontSize: 12,
    fontWeight: "700",
  },
  previewCard: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  previewThumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
  },
  previewBody: {
    flex: 1,
    gap: 4,
  },
  previewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  previewBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  refreshMetaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  refreshMetaText: {
    fontSize: 10,
    fontWeight: "800",
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
  },
  previewDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  noticeBox: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  singleInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    fontSize: 14,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  notesInput: {
    minHeight: 76,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    textAlignVertical: "top",
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  inputWithPinRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingRight: 2,
  },
  titleInputFlex: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    fontSize: 14,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  pinToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    marginRight: 4,
  },
  chipScroll: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  colChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    gap: 6,
  },
  colChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  addTagBtn: {
    backgroundColor: "#000000",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  detectedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  detectedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  detectedTextWrap: {
    flex: 1,
  },
  detectedTitleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detectedDateBold: {
    fontWeight: "900",
  },
  detectedSubText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  detectedActionBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  detectedActionText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  setDeadlineTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  setDeadlineTriggerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  activeDeadlineContainer: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  activeDeadlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  activeDeadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeDeadlineDate: {
    fontSize: 14,
    fontWeight: "800",
  },
  removeDeadlineBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDeadlineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timingPresetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  timingPresetBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  changeDateBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  changeDateBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
