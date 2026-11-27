import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Pin, Clock } from "lucide-react-native";
import { SavedItem } from "../../types/models";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { LinkThumbnail } from "./LinkThumbnail";
import { PlatformLogo } from "./PlatformLogo";
import { getDeadlineStatus } from "../../utils/deadlineNumberDetector";
import { resolveItemPlatform } from "../../utils/metadataParser";

export interface ItemLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaItemCardProps {
  item: SavedItem;
  onPress: () => void;
  onLongPress?: (rect: ItemLayoutRect) => void;
  showCollection?: boolean;
  layout?: "grid" | "horizontal";
}

export function FigmaItemCard({
  item,
  onPress,
  onLongPress,
  showCollection = true,
  layout = "grid",
}: FigmaItemCardProps) {
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
  const collections = useSimpanInStore((state) => state.collections);
  const collection = collections.find((c) => c.id === item.collectionId);

  const deadlineInfo = React.useMemo(() => {
    if (!item.deadline) return null;
    return getDeadlineStatus(item.deadline);
  }, [item.deadline]);

  const displayPlatform = React.useMemo(
    () => resolveItemPlatform(item.source, item.url),
    [item.source, item.url]
  );

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

  if (layout === "horizontal") {
    return (
      <Animated.View
        ref={cardRef}
        collapsable={false}
        style={[styles.horizontalWrap, { transform: [{ scale: scaleAnim }] }]}
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
                styles.cardHorizontal,
                {
                  backgroundColor: theme.card,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                pressed ? styles.pressedOffset : styles.hardShadow,
              ]}
            >
          {/* Left Visual Box */}
          <LinkThumbnail
            image={item.image}
            tags={item.tags}
            symbolSize="sm"
            style={styles.visualBoxHorizontal}
          >
            {!item.isReviewed && (
              <View style={styles.freshBadge}>
                <Text style={styles.freshBadgeText}>BARU</Text>
              </View>
            )}
            {item.isPinned && (
              <View style={styles.pinBadgeHorizontal}>
                <Pin size={11} color="#000000" fill="#000000" />
              </View>
            )}
          </LinkThumbnail>

          {/* Right Info Box */}
          <View style={styles.horizontalBody}>
            <View style={styles.horizontalTopRow}>
              <View style={styles.platformLeft}>
                <PlatformLogo platform={displayPlatform} size={13} />
                <Text
                  style={[styles.sourceText, { color: theme.textMuted }]}
                  numberOfLines={1}
                >
                  {displayPlatform}
                </Text>
              </View>
              {showCollection && collection && (
                <View
                  style={[
                    styles.collectionTag,
                    { backgroundColor: collection.color || "#F7CB54" },
                  ]}
                >
                  <Text style={styles.collectionTagText} numberOfLines={1}>
                    {collection.name}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.horizontalTitleText, { color: theme.text }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>

            <View style={styles.horizontalBottomRow}>
              {deadlineInfo ? (
                <View
                  style={[
                    styles.deadlinePillInline,
                    deadlineInfo.urgency === "urgent" && styles.deadlinePillUrgent,
                    deadlineInfo.urgency === "warning" && styles.deadlinePillWarning,
                    deadlineInfo.urgency === "passed" && styles.deadlinePillPassed,
                  ]}
                >
                  <Clock size={9} color="#000000" strokeWidth={2.8} />
                  <Text style={styles.deadlinePillText} numberOfLines={1}>
                    {deadlineInfo.badgeLabel}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.dateText, { color: theme.textMuted }]}>
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
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
              styles.card,
              {
                backgroundColor: theme.card,
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

        {/* Item Title & Platform Row */}
        <View style={styles.body}>
          <Text
            style={[styles.titleText, { color: theme.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <View style={styles.platformRow}>
            <View style={styles.platformLeft}>
              <PlatformLogo platform={displayPlatform} size={13} />
              <Text
                style={[styles.sourceText, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {displayPlatform}
              </Text>
            </View>
            {showCollection && collection && (
              <View
                style={[
                  styles.collectionTag,
                  {
                    backgroundColor: collection.color || "#F7CB54",
                  },
                ]}
              >
                <Text style={styles.collectionTagText} numberOfLines={1}>
                  {collection.name}
                </Text>
              </View>
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
  horizontalWrap: {
    width: "100%",
  },
  cardHorizontal: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  visualBoxHorizontal: {
    width: 88,
    height: 88,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
  },
  horizontalBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
    height: 88,
    paddingVertical: 1,
  },
  horizontalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  horizontalTitleText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  horizontalBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deadlinePillInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
  },
  collectionTag: {
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    maxWidth: "50%",
  },
  collectionTagText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#000000",
  },
  pinBadgeHorizontal: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    width: 20,
    height: 20,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderWidth: 2,
    borderRadius: 12,
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
    borderRadius: 8,
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
    justifyContent: "space-between",
    gap: 4,
    marginTop: 5,
    minHeight: 18,
  },
  platformLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "700",
  },
  titleText: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    minHeight: 32,
  },
});

