import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { NEO_SHADOW, THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";

interface NeoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  noShadow?: boolean;
}

export function NeoCard({ children, style, color, noShadow = false }: NeoCardProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: color || theme.card,
          borderColor: isDark ? "#4A4640" : "#000000",
        },
        !noShadow && (isDark ? styles.darkShadow : NEO_SHADOW),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
  darkShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
});

