import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Plus, X, Check } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { TagBadge, getTagColor } from "../ui/TagBadge";

interface TagManagerSheetProps {
  visible: boolean;
  tags: string[];
  onClose: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagManagerSheet({
  visible,
  tags,
  onClose,
  onAddTag,
  onRemoveTag,
}: TagManagerSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const items = useSimpanInStore((state) => state.items);

  // Two stages matching SimpanIn.pdf Page 35 ("list") and Page 37 ("create")
  const [stage, setStage] = useState<"list" | "create">("list");
  const [newTagInput, setNewTagInput] = useState("");

  // Reusable tags across all items in the store
  const reusableTags = useMemo(() => {
    const all = new Set<string>();
    items.forEach((it) => {
      (it.tags || []).forEach((t) => {
        const clean = t.trim().toLowerCase().replace(/^#+/, "");
        if (clean) all.add(clean);
      });
    });
    return Array.from(all);
  }, [items]);

  const handleCreateSubmit = () => {
    const clean = newTagInput.trim().toLowerCase().replace(/^#+/, "");
    if (clean) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAddTag(clean);
      setNewTagInput("");
      setStage("list");
      onClose();
    }
  };

  const handleToggleReusableTag = (tag: string) => {
    Haptics.selectionAsync();
    const isAttached = tags.some(
      (t) => t.toLowerCase().replace(/^#+/, "") === tag.toLowerCase()
    );
    if (isAttached) {
      onRemoveTag(tag);
    } else {
      onAddTag(tag);
    }
  };

  const handleClose = () => {
    setStage("list");
    setNewTagInput("");
    onClose();
  };

  const isInputFilled = newTagInput.trim().length > 0;

  return (
    <NeoBottomSheet
      visible={visible}
      title={stage === "create" ? "Buat tag baru" : "Tambah tag"}
      onClose={handleClose}
    >
      {stage === "list" ? (
        // Stage 1: "Tambah tag" (SimpanIn.pdf Page 35)
        <View style={styles.container}>
          {/* Option: + Buat tag baru */}
          <TouchableOpacity
            style={styles.createOptionRow}
            onPress={() => {
              Haptics.selectionAsync();
              setStage("create");
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.plusIconBox,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#F2EFE9",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
            >
              <Plus size={16} color={theme.text} strokeWidth={2.8} />
            </View>
            <Text style={[styles.createOptionText, { color: theme.text }]}>
              Buat tag baru
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#3A3630" : "#E5E0D8" },
            ]}
          />

          {/* Reusable tags section */}
          <View style={styles.reusableSection}>
            {reusableTags.length === 0 ? (
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Belum ada tag yang bisa dipakai ulang.
              </Text>
            ) : (
              <ScrollView
                style={styles.reusableScroll}
                contentContainerStyle={styles.reusableGrid}
                showsVerticalScrollIndicator={false}
              >
                {reusableTags.map((tag, idx) => {
                  const tagColor = getTagColor(tag, idx);
                  const isAttached = tags.some(
                    (t) => t.toLowerCase().replace(/^#+/, "") === tag.toLowerCase()
                  );
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.reusableTagItem,
                        {
                          backgroundColor: isAttached
                            ? tagColor
                            : isDark
                            ? theme.cardSecondary
                            : "#FFFFFF",
                          borderColor: isAttached
                            ? "#000000"
                            : isDark
                            ? "#4A4640"
                            : "#000000",
                        },
                      ]}
                      onPress={() => handleToggleReusableTag(tag)}
                      activeOpacity={0.8}
                    >
                      {!isAttached && (
                        <View
                          style={[
                            styles.tagColorDot,
                            { backgroundColor: tagColor },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.reusableTagText,
                          {
                            color: isAttached ? "#000000" : theme.text,
                            fontWeight: isAttached ? "800" : "600",
                          },
                        ]}
                      >
                        #{tag}
                      </Text>
                      {isAttached && (
                        <View style={styles.checkCircle}>
                          <Check size={11} color="#000000" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      ) : (
        // Stage 2: "Buat tag baru" (SimpanIn.pdf Page 37)
        <View style={styles.container}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            NAMA TAG
          </Text>

          <TextInput
            style={[
              styles.createInput,
              {
                backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                color: theme.text,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            placeholder="mis. inspirasi desain"
            placeholderTextColor={theme.textMuted}
            value={newTagInput}
            onChangeText={setNewTagInput}
            onSubmitEditing={handleCreateSubmit}
            returnKeyType="done"
            autoFocus
          />

          {/* Action Buttons: [ Batal ] and [ Buat tag ] */}
          <View style={styles.createActionRow}>
            <TouchableOpacity
              style={[
                styles.batalBtn,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setNewTagInput("");
                setStage("list");
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.batalBtnText, { color: theme.text }]}>
                Batal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buatBtn,
                isInputFilled
                  ? styles.buatBtnActive
                  : [
                      styles.buatBtnDisabled,
                      { backgroundColor: isDark ? "#33312E" : "#E2E0D8" },
                    ],
              ]}
              onPress={handleCreateSubmit}
              disabled={!isInputFilled}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.buatBtnText,
                  {
                    color: isInputFilled
                      ? "#000000"
                      : isDark
                      ? "#66635E"
                      : "#99958F",
                  },
                ]}
              >
                Buat tag
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  createOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  plusIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createOptionText: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  reusableSection: {
    minHeight: 80,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  reusableScroll: {
    maxHeight: 220,
  },
  reusableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  reusableTagItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginRight: 6,
  },
  reusableTagText: {
    fontSize: 13,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F7CB54",
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  createInput: {
    height: 48,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
  },
  createActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  batalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  batalBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  buatBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  buatBtnActive: {
    backgroundColor: "#F7CB54",
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  buatBtnDisabled: {
    borderColor: "transparent",
  },
  buatBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
