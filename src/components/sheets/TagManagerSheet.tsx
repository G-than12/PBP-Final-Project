import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Plus, X } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";

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

  const [tagInput, setTagInput] = useState("");

  const handleAdd = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (clean) {
      Haptics.selectionAsync();
      onAddTag(clean);
      setTagInput("");
    }
  };

  return (
    <NeoBottomSheet visible={visible} title="Kelola Tagar" onClose={onClose}>
      <View style={styles.container}>
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
            style={[styles.input, { color: theme.text }]}
            placeholder="Tambah tagar baru..."
            placeholderTextColor={theme.textSecondary}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoFocus
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Tagar Saat Ini ({tags.length})
        </Text>

        <View style={styles.tagsList}>
          {tags.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Belum ada tagar pada simpanan ini.
            </Text>
          ) : (
            tags.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onRemoveTag(t);
                }}
              >
                <Text style={[styles.tagText, { color: theme.text }]}>#{t}</Text>
                <X size={13} color={theme.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <NeoButton variant="primary" size="lg" onPress={onClose} style={styles.doneBtn}>
          Selesai
        </NeoButton>
      </View>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: "#000000",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 50,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "700",
  },
  doneBtn: {
    marginTop: 8,
  },
});

