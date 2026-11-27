import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";

interface NeoBottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function NeoBottomSheet({
  visible,
  title,
  onClose,
  children,
}: NeoBottomSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 75,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const safeBottomPadding = Math.max(insets.bottom, 16) + 8;

  return (
    <Modal
      key={isDark ? "dark" : "light"}
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        {/* Backdrop overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: theme.surface,
                borderColor: isDark ? "#4A4640" : "#000000",
                paddingBottom: safeBottomPadding,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [120, 0],
                    }),
                  },
                  {
                    scale: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
          <View
            style={[
              styles.grabBar,
              { backgroundColor: isDark ? "#4A4640" : "#D6CFC4" },
            ]}
          />

          <View style={styles.header}>
            <Text
              style={[styles.title, { color: theme.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={theme.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  keyboardWrap: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 540 : undefined,
    alignItems: "center",
  },
  sheetContainer: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 540 : undefined,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: Platform.OS === "web" ? "88vh" : "92%",
    minHeight: 180,
  },
  grabBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    paddingRight: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
});

