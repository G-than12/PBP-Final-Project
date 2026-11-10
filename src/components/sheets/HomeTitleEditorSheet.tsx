import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { NeoCard } from "../ui/NeoCard";

interface HomeTitleEditorSheetProps {
  visible: boolean;
  currentTitle: [string, string];
  onClose: () => void;
  onSave: (newTitle: [string, string]) => void;
}

export function HomeTitleEditorSheet({
  visible,
  currentTitle,
  onClose,
  onSave,
}: HomeTitleEditorSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [line1, setLine1] = useState(currentTitle[0]);
  const [line2, setLine2] = useState(currentTitle[1]);

  const handleSave = () => {
    Haptics.selectionAsync();
    onSave([line1.trim() || "Simpan sekarang.", line2.trim() || "Temukan kapan saja."]);
    onClose();
  };

  return (
    <NeoBottomSheet visible={visible} title="Ubah Judul Beranda" onClose={onClose}>
      <View style={styles.container}>
        {/* Live Preview Box */}
        <Text style={[styles.label, { color: theme.text }]}>Pratinjau Langsung</Text>
        <NeoCard color="#F7CB54" style={styles.previewCard}>
          <Text style={styles.previewLine1}>{line1 || "Simpan sekarang."}</Text>
          <Text style={styles.previewLine2}>{line2 || "Temukan kapan saja."}</Text>
        </NeoCard>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Baris Pertama</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            value={line1}
            onChangeText={setLine1}
            placeholder="Baris 1..."
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Baris Kedua</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            value={line2}
            onChangeText={setLine2}
            placeholder="Baris 2..."
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.btnRow}>
          <NeoButton variant="secondary" size="md" onPress={onClose} style={styles.btn}>
            Batal
          </NeoButton>
          <NeoButton variant="primary" size="md" onPress={handleSave} style={styles.btn}>
            Simpan Judul
          </NeoButton>
        </View>
      </View>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  previewCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  previewLine1: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
  },
  previewLine2: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A4640",
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  btn: {
    flex: 1,
  },
});

