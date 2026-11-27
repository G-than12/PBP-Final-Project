import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
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
  showSubcollectionCount?: boolean;
  freshCount?: number;
  isMain?: boolean;
  onPress: () => void;
  onLongPress?: (rect: FolderLayoutRect) => void;
}

export function ManilaFolderCard({
  collection,
  itemCount,
  subcollectionCount = 0,
  showSubcollectionCount = true,
  freshCount = 0,
  isMain = false,
  onPress,
  onLongPress,
}: ManilaFolderCardProps) {
  const cardRef = React.useRef<any>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  };

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
  const borderColor = isDark ? "#4A4640" : "#000000";

  return (
    <Animated.View
      ref={cardRef}
      collapsable={false}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Pressable
        key={isDark ? "dark" : "light"}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress ? handleLongPress : undefined}
        delayLongPress={300}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.folderCard,
              {
                backgroundColor: theme.card,
                borderColor,
              },
              pressed ? styles.pressedOffset : styles.hardShadow,
            ]}
          >
            {/* Compact Folder Tab on top left */}
            <View
              style={[
                styles.folderTab,
                {
                  backgroundColor: folderColor,
                  borderColor,
                },
              ]}
            />

            {/* Unreviewed "BARU" sticker badge */}
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

            {/* Compact Horizontal Content: Colored Icon Box + Folder Info */}
            <View style={styles.rowContent}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: folderColor,
                    borderColor,
                  },
                ]}
              >
                <AppIcon name={collection.icon} size={19} color="#000000" />
              </View>

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
                {showSubcollectionCount && (
                  <Text style={[styles.folderSubstats, { color: theme.textSecondary }]}>
                    {subcollectionCount} subkoleksi
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  folderCard: {
    minHeight: 78,
    borderWidth: 2,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    position: "relative",
    borderRadius: 12,
    overflow: "visible",
    justifyContent: "center",
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
    top: -9,
    left: 10,
    width: 46,
    height: 9,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  freshBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    zIndex: 3,
  },
  freshBadgeText: {
    fontSize: 7.5,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.4,
  },
  mainBadge: {
    position: "absolute",
    bottom: 6,
    right: 8,
    backgroundColor: "#111111",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  mainBadgeText: {
    fontSize: 6.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  folderName: {
    fontSize: 13.5,
    fontWeight: "800",
    marginBottom: 2,
  },
  folderStats: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  folderSubstats: {
    fontSize: 9.5,
    fontWeight: "500",
    marginTop: 1,
  },
});
