import React, { useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { NEO_SHADOW_SM, THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";

interface NeoButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "yellow" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function NeoButton({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  textStyle,
  icon,
}: NeoButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onPress?.();
  };

  const getBackgroundColor = () => {
    if (disabled) return isDark ? "#33302C" : "#E4DCCF";
    switch (variant) {
      case "yellow":
        return "#F7CB54";
      case "primary":
        return isDark ? "#FFFFFF" : "#000000";
      case "secondary":
        return isDark ? "#2E2B28" : "#F5F0E8";
      case "danger":
        return "#EF4444";
      case "ghost":
        return "transparent";
      default:
        return isDark ? "#FFFFFF" : "#000000";
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? "#666158" : "#8A8478";
    switch (variant) {
      case "yellow":
        return "#000000";
      case "primary":
        return isDark ? "#000000" : "#FFFFFF";
      case "secondary":
        return theme.text;
      case "danger":
        return "#FFFFFF";
      case "ghost":
        return theme.text;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isDark ? (variant === "ghost" ? "transparent" : "#4A4640") : (variant === "ghost" ? "transparent" : "#000000"),
        },
        variant !== "ghost" && !disabled && (isPressed ? styles.pressedOffset : NEO_SHADOW_SM),
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      {icon}
      {React.isValidElement(children) ? (
        children
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${size}`],
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
  },
  pressedOffset: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  sm: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },
  text: {
    fontWeight: "800",
  },
  text_sm: {
    fontSize: 12,
  },
  text_md: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 16,
  },
});

