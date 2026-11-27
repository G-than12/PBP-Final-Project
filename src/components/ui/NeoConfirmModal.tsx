import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
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
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        tension: 85,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      key={isDark ? "dark" : "light"}
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: popAnim }]}>
        {/* Backdrop touchable to close */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.box,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? "#4A4640" : "#000000",
              transform: [
                {
                  scale: popAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1],
                  }),
                },
              ],
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
        </Animated.View>
      </Animated.View>
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

