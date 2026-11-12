import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Pin } from "lucide-react-native";
import { SavedItem } from "../../types/models";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { LinkThumbnail } from "./LinkThumbnail";

interface FigmaItemCardProps {
  item: SavedItem;
  onPress: () => void;
}

export function FigmaItemCard({ item, onPress }: FigmaItemCardProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? "#242220" : "#FFFFFF",
          borderColor: isDark ? "#4A4640" : "#000000",
        },
        pressed ? styles.pressedOffset : styles.hardShadow,
      ]}
    >
      {/* Top Visual Box */}
      <LinkThumbnail
        image={item.image}
        tags={item.tags}
        symbolSize="md"
        style={styles.visualBox}
      >
        {/* BARU Badge */}
        {!item.isReviewed && (
          <View style={styles.freshBadge}>
            <Text style={styles.freshBadgeText}>BARU</Text>
          </View>
        )}

        {/* Pin Badge */}
        {item.isPinned && (
          <View style={styles.pinBadge}>
            <Pin size={12} color="#000000" fill="#000000" />
          </View>
        )}
      </LinkThumbnail>

      {/* Item Meta & Title */}
      <View style={styles.body}>
        <Text style={[styles.sourceText, { color: theme.textMuted }]} numberOfLines={1}>
          {item.source || "Web"}
        </Text>
        <Text
          style={[styles.titleText, { color: theme.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    position: "relative",
    marginBottom: 12,
  },
  hardShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pressedOffset: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  visualBox: {
    height: 128,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 4,
  },
  freshBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  freshBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  pinBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    width: 22,
    height: 22,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  titleText: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
});

