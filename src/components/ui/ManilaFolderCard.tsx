import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Collection } from "../../types/models";
import { AppIcon } from "./AppIcon";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";

export interface FolderLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ManilaFolderCardProps {
  collection: Collection;
  itemCount: number;
  subcollectionCount?: number;
  freshCount?: number;
  isMain?: boolean;
  onPress: () => void;
  onLongPress?: (rect: FolderLayoutRect) => void;
}

export function ManilaFolderCard({
  collection,
  itemCount,
  subcollectionCount = 0,
  freshCount = 0,
  isMain = false,
  onPress,
  onLongPress,
}: ManilaFolderCardProps) {
  const cardRef = React.useRef<any>(null);
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) {
      if (cardRef.current && (cardRef.current as any).measureInWindow) {
        (cardRef.current as any).measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            if (width > 0 && height > 0) {
              onLongPress({ x, y, width, height });
            } else {
              onLongPress({ x: 0, y: 0, width: 0, height: 0 });
            }
          }
        );
      } else {
        onLongPress({ x: 0, y: 0, width: 0, height: 0 });
      }
    }
  };

  const folderColor = collection.color || "#F7CB54";

  return (
    <View ref={cardRef} collapsable={false}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        delayLongPress={300}
        style={({ pressed }) => [
          styles.folderCard,
          {
            backgroundColor: isDark ? "#242220" : "#FFFFFF",
            borderColor: isDark ? "#4A4640" : "#000000",
          },
          pressed ? styles.pressedOffset : styles.hardShadow,
        ]}
      >
      {/* Folder Tab on top left */}
      <View
        style={[
          styles.folderTab,
          {
            backgroundColor: folderColor,
            borderColor: isDark ? "#4A4640" : "#000000",
          },
        ]}
      />

      {/* Horizontal Colored Stripe */}
      <View
        style={[
          styles.colorStripe,
          {
            backgroundColor: folderColor,
            borderColor: isDark ? "#4A4640" : "#000000",
          },
        ]}
      />

      {/* Folder Icon in white square */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDark ? "#2E2B28" : "#FFFFFF",
            borderColor: isDark ? "#4A4640" : "#000000",
          },
        ]}
      >
        <AppIcon name={collection.icon} size={20} color={isDark ? "#FFFFFF" : "#000000"} />
      </View>

      {/* Unreviewed "BARU" badge */}
      {freshCount > 0 && (
        <View style={styles.freshBadge}>
          <Text style={styles.freshBadgeText}>
            {freshCount > 1 ? `${freshCount} BARU` : "BARU"}
          </Text>
        </View>
      )}

      {/* Main Collection "UTAMA" badge */}
      {isMain && (
        <View style={styles.mainBadge}>
          <Text style={styles.mainBadgeText}>UTAMA</Text>
        </View>
      )}

      {/* Folder Information */}
      <View style={styles.textContainer}>
        <Text
          style={[styles.folderName, { color: theme.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {collection.name}
        </Text>
        <Text style={[styles.folderStats, { color: theme.textMuted }]}>
          {itemCount} simpanan
        </Text>
        <Text style={[styles.folderSubstats, { color: theme.textSecondary }]}>
          {subcollectionCount} subkoleksi
        </Text>
      </View>
    </Pressable>
  </View>
);
}

const styles = StyleSheet.create({
  folderCard: {
    minHeight: 164,
    borderWidth: 2,
    marginTop: 12,
    paddingTop: 54,
    paddingHorizontal: 12,
    paddingBottom: 14,
    position: "relative",
    borderRadius: 6,
    overflow: "visible",
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
  folderTab: {
    position: "absolute",
    top: -12,
    left: 8,
    width: "55%",
    height: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  colorStripe: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 34,
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 2,
  },
  freshBadge: {
    position: "absolute",
    top: 32,
    right: 8,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 3,
  },
  freshBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  mainBadge: {
    position: "absolute",
    bottom: 10,
    right: 8,
    backgroundColor: "#111111",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mainBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  textContainer: {
    zIndex: 2,
    marginTop: 4,
  },
  folderName: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  folderStats: {
    fontSize: 10,
    fontWeight: "600",
  },
  folderSubstats: {
    fontSize: 9,
    fontWeight: "500",
    marginTop: 1,
  },
});

