import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Plus, X, Clipboard as ClipboardIcon } from "lucide-react-native";
import { Collection } from "../../types/models";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { parseUrlMetadata } from "../../utils/metadataParser";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { AppIcon } from "../ui/AppIcon";

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
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState("");
  const [selectedColId, setSelectedColId] = useState(
    defaultCollectionId || collections[0]?.id || "inbox"
  );
  const [isPinned, setIsPinned] = useState(false);
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [detectedPlatform, setDetectedPlatform] = useState("Web");

  useEffect(() => {
    if (visible) {
      if (initialUrl) {
        handleUrlChange(initialUrl);
      } else {
        checkClipboard();
      }
      if (defaultCollectionId) {
        setSelectedColId(defaultCollectionId);
      }
    } else {
      setUrl("");
      setTitle("");
      setNotes("");
      setTags([]);
      setTagInput("");
      setIsPinned(false);
      setDetectedPlatform("Web");
    }
  }, [visible, initialUrl, defaultCollectionId]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl.trim().length > 4) {
      const parsed = parseUrlMetadata(newUrl);
      setDetectedPlatform(parsed.platform);
      if (!title) {
        setTitle(parsed.inferredTitle);
      }
      if (tags.length === 0 && parsed.suggestedTags.length > 0) {
        setTags(parsed.suggestedTags);
      }
    }
  };

  const checkClipboard = async () => {
    try {
      const hasStr = await Clipboard.hasStringAsync();
      if (hasStr) {
        const text = await Clipboard.getStringAsync();
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          handleUrlChange(text);
        }
      }
    } catch {}
  };

  const handlePaste = async () => {
    Haptics.selectionAsync();
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        handleUrlChange(text);
      }
    } catch {}
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    if (!url.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const parsed = parseUrlMetadata(url);

    onSave({
      url: url.trim(),
      title: title.trim() || parsed.inferredTitle,
      description: parsed.inferredDescription,
      source: detectedPlatform,
      collectionId: selectedColId,
      isPinned,
      notes: notes.trim(),
      tags,
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
              onChangeText={handleUrlChange}
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
            onChangeText={setTitle}
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
