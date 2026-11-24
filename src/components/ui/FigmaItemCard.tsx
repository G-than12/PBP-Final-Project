import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Pin, Clock } from "lucide-react-native";
import { SavedItem } from "../../types/models";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { LinkThumbnail } from "./LinkThumbnail";
import { PlatformLogo } from "./PlatformLogo";
import { getDeadlineStatus } from "../../utils/deadlineNumberDetector";

export interface ItemLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FigmaItemCardProps {
  item: SavedItem;
  onPress: () => void;
  onLongPress?: (rect: ItemLayoutRect) => void;
}

export function FigmaItemCard({ item, onPress, onLongPress }: FigmaItemCardProps) {
  const cardRef = React.useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;
  const collections = useSimpanInStore((state) => state.collections);
  const collection = collections.find((c) => c.id === item.collectionId);

  const deadlineInfo = React.useMemo(() => {
    if (!item.deadline) return null;
    return getDeadlineStatus(item.deadline);
  }, [item.deadline]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 130,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 110,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) {
      if (cardRef.current && cardRef.current.measureInWindow) {
        cardRef.current.measureInWindow(
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

  return (
    <View ref={cardRef} collapsable={false}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={onLongPress ? handleLongPress : undefined}
          delayLongPress={300}
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

        {/* Collection Pill at bottom-left of thumbnail (SimpanIn.pdf Page 58) */}
        {collection && (
          <View
            style={[
              styles.collectionPill,
              {
                backgroundColor: collection.color || "#F7CB54",
              },
            ]}
          >
            <Text style={styles.collectionPillText} numberOfLines={1}>
              {collection.name}
            </Text>
          </View>
        )}

        {/* Deadline Badge at bottom-right */}
        {deadlineInfo && (
          <View
            style={[
              styles.deadlinePill,
              deadlineInfo.urgency === "urgent" && styles.deadlinePillUrgent,
              deadlineInfo.urgency === "warning" && styles.deadlinePillWarning,
              deadlineInfo.urgency === "passed" && styles.deadlinePillPassed,
            ]}
          >
            <Clock size={8} color="#000000" strokeWidth={2.8} />
            <Text style={styles.deadlinePillText} numberOfLines={1}>
              {deadlineInfo.badgeLabel}
            </Text>
          </View>
        )}
      </LinkThumbnail>

      {/* Item Title & Platform Row (SimpanIn.pdf Page 58) */}
      <View style={styles.body}>
        <Text
          style={[styles.titleText, { color: theme.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <View style={styles.platformRow}>
          <PlatformLogo platform={item.source} size={13} />
          <Text style={[styles.sourceText, { color: theme.textMuted }]} numberOfLines={1}>
            {item.source || "Web"}
          </Text>
        </View>
      </View>
    </Pressable>
  </Animated.View>
  </View>
);
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    position: "relative",
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
  collectionPill: {
    position: "absolute",
    bottom: 6,
    left: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    maxWidth: "55%",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  collectionPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000000",
  },
  deadlinePill: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  deadlinePillUrgent: {
    backgroundColor: "#FF6B6B",
  },
  deadlinePillWarning: {
    backgroundColor: "#F7CB54",
  },
  deadlinePillPassed: {
    backgroundColor: "#CBD5E1",
  },
  deadlinePillText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#000000",
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "700",
  },
  titleText: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
});

