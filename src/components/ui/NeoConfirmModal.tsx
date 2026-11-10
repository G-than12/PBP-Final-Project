import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { NEO_SHADOW_LG, THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoButton } from "./NeoButton";

interface NeoConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NeoConfirmModal({
  visible,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
  onConfirm,
  onCancel,
}: NeoConfirmModalProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.box,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
            },
            NEO_SHADOW_LG,
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textMuted }]}>
            {message}
          </Text>

          <View style={styles.btnRow}>
            <NeoButton
              variant="secondary"
              onPress={onCancel}
              style={styles.btn}
            >
              {cancelText}
            </NeoButton>

            <NeoButton
              variant={isDestructive ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.btn}
            >
              {confirmText}
            </NeoButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  box: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});

