import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
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
} from "../../utils/metadataParser";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { AppIcon } from "../ui/AppIcon";
import { LinkThumbnail } from "../ui/LinkThumbnail";

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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [detectedPlatform, setDetectedPlatform] = useState("Web");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaNotice, setMetaNotice] = useState<string | null>(null);

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

  const checkClipboard = async () => {
    try {
      const hasStr = await Clipboard.hasStringAsync();
      if (hasStr) {
        const text = await Clipboard.getStringAsync();
        const extracted = extractFirstUrl(text || "");
        if (extracted && /^https?:\/\//i.test(extracted) && isFetchableUrl(extracted)) {
          handleUrlChange(extracted, true);
        }
      }
    } catch {
      // ignore clipboard read failure
    }
  };

  useEffect(() => {
    if (visible) {
      isTitleManualRef.current = false;
      isDescManualRef.current = false;
      isImageManualRef.current = false;
      isTagsManualRef.current = false;
      setMetaNotice(null);

      if (initialUrl) {
        handleUrlChange(initialUrl, true);
      } else {
        checkClipboard();
      }
      if (defaultCollectionId) {
        setSelectedColId(defaultCollectionId);
      }
    } else {
      clearPendingFetch();
      fetchRequestIdRef.current += 1;
      setUrl("");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setNotes("");
      setTags([]);
      setTagInput("");
      setIsPinned(false);
      setDetectedPlatform("Web");
      setIsFetchingMeta(false);
      setMetaNotice(null);
      isTitleManualRef.current = false;
      isDescManualRef.current = false;
      isImageManualRef.current = false;
      isTagsManualRef.current = false;
    }

    return () => {
      clearPendingFetch();
    };
  }, [visible, initialUrl, defaultCollectionId]);

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

  const handleSave = () => {
    if (!url.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const cleanUrl = normalizeUrl(url);
    const parsed = parseUrlMetadata(cleanUrl);

    onSave({
      url: cleanUrl,
      title: title.trim() || parsed.inferredTitle,
      description: description.trim() || parsed.inferredDescription,
      source: detectedPlatform,
      collectionId: selectedColId,
      isPinned,
      notes: notes.trim(),
      tags,
      image: imageUrl.trim() || undefined,
    });
    onClose();
  };

  const selectedCol = collections.find((c) => c.id === selectedColId) || collections[0];

  return (
    <NeoBottomSheet visible={visible} title="Simpan ke SimpanIn" onClose={onClose}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* URL Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tautan / URL Web</Text>
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

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Judul</Text>
          <TextInput
            style={[
              styles.singleInput,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder="Judul simpanan..."
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={(txt) => {
              isTitleManualRef.current = txt.trim().length > 0;
              setTitle(txt);
            }}
          />
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
            placeholder="Deskripsi postingan (terisi otomatis jika tersedia)..."
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

        {/* Optional Thumbnail URL Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            URL Gambar Thumbnail (Opsional)
          </Text>
          <TextInput
            style={[
              styles.singleInput,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder="Terisi otomatis dari tautan (https://...)"
            placeholderTextColor={theme.textSecondary}
            value={imageUrl}
            onChangeText={(txt) => {
              isImageManualRef.current = txt.trim().length > 0;
              setImageUrl(txt);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Pin Link Toggle */}
        <View
          style={[
            styles.toggleCard,
            {
              backgroundColor: theme.cardSecondary,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          <View style={styles.toggleText}>
            <Text style={[styles.toggleTitle, { color: theme.text }]}>
              Sematkan link ini
            </Text>
            <Text style={[styles.toggleSub, { color: theme.textSecondary }]}>
              Tampilkan langsung di bagian atas beranda
            </Text>
          </View>
          <Switch
            value={isPinned}
            onValueChange={setIsPinned}
            trackColor={{ false: "#E0D9CE", true: "#F7CB54" }}
            thumbColor={isPinned ? "#000000" : "#FFFFFF"}
          />
        </View>

        {/* Collection Selector */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: theme.text }]}>Pilih Koleksi</Text>
            <TouchableOpacity onPress={onRequestCreateCollection}>
              <Text style={styles.newColText}>+ Buat Koleksi</Text>
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
          <Text style={[styles.label, { color: theme.text }]}>Tagar</Text>
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
              placeholder="Ketik tagar lalu tekan tambah..."
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
              {tags.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.cardSecondary,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => handleRemoveTag(t)}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.text }]}>#{t}</Text>
                  <X size={12} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Catatan Pribadi</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder="Tuliskan ide atau pengingat untuk tautan ini..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save button */}
        <NeoButton
          variant="yellow"
          size="lg"
          disabled={!url.trim()}
          onPress={handleSave}
          style={styles.submitBtn}
        >
          {`Simpan ke "${selectedCol?.name || "Koleksi"}"`}
        </NeoButton>
      </ScrollView>
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
  toggleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    gap: 8,
  },
  toggleText: {
    flex: 1,
    paddingRight: 6,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
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
});
