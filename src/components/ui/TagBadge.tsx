import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export const TAG_PALETTE = [
  "#D07BBF", // 1. Orchid / Pink-Magenta
  "#8FC9FF", // 2. Sky Blue
  "#A6E3D1", // 3. Mint / Seafoam
  "#F7CB54", // 4. Mascot Warm Yellow
  "#FF8C79", // 5. Coral Peach
  "#D0B7FF", // 6. Lavender Purple
  "#B8E986", // 7. Lime Green
  "#FFB8D2", // 8. Candy Pink
  "#FFB057", // 9. Tangerine Orange
  "#80CBC4", // 10. Ocean Teal
  "#90CAF9", // 11. Cornflower Blue
  "#E6B3FF", // 12. Soft Lilac
  "#FFD166", // 13. Sunflower Yellow
  "#A0E7E5", // 14. Turquoise
];

export function getTagColor(tag: string, index?: number): string {
  if (typeof index === "number" && index >= 0) {
    return TAG_PALETTE[index % TAG_PALETTE.length];
  }
  const clean = tag.toLowerCase().trim().replace(/^#+/, "");
  if (!clean) return TAG_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % TAG_PALETTE.length;
  return TAG_PALETTE[colorIndex];
}

export interface TagBadgeProps {
  name: string;
  count?: number;
  onPress?: () => void;
  onRemove?: () => void;
  color?: string;
  index?: number;
  style?: StyleProp<ViewStyle>;
  prefix?: string;
  isActive?: boolean;
}

export function TagBadge({
  name,
  count,
  onPress,
  onRemove,
  color,
  index,
  style,
  prefix = "#",
  isActive = false,
}: TagBadgeProps) {
  const cleanName = name.replace(/^#+/, "");
  const badgeColor =
    color ||
    (typeof index === "number" && index >= 0
      ? TAG_PALETTE[index % TAG_PALETTE.length]
      : getTagColor(name));

  const handleRemovePress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove?.();
  };

  const handleBadgePress = () => {
    if (onPress) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  const badgeContent = (
    <View style={[styles.outerContainer, style]}>
      {/* Neo-brutalist Hard Shadow Layer */}
      <View style={styles.shadowWrapper} pointerEvents="none">
        <Svg width={18} height={32} viewBox="0 0 18 32">
          <Path d="M 18 0 L 2 16 L 18 32 Z" fill="#000000" />
        </Svg>
        <View style={styles.shadowBody} />
      </View>

      {/* Foreground Tag Layer */}
      <View style={styles.foregroundWrapper}>
        {/* Left Cap with pointed luggage tag tip & punched circular hole */}
        <Svg width={18} height={32} viewBox="0 0 18 32" style={styles.leftCap}>
          {/* Tag left chevron with 2px black stroke */}
          <Path
            d="M 18 1 L 2 16 L 18 31"
            fill={badgeColor}
            stroke="#000000"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Punched circle hole */}
          <Circle
            cx={8}
            cy={16}
            r={3}
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth={1.5}
          />
        </Svg>

        {/* Right Body with text and accessory */}
        <View
          style={[
            styles.rightBody,
            {
              backgroundColor: badgeColor,
            },
          ]}
        >
          <Text style={styles.tagText} numberOfLines={1}>
            {prefix}{cleanName}
          </Text>

          {/* Remove (X) button for post detail */}
          {onRemove && (
            <TouchableOpacity
              style={styles.removeCircleBtn}
              onPress={handleRemovePress}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel={`Hapus tag ${cleanName}`}
            >
              <X size={10} color="#000000" strokeWidth={3} />
            </TouchableOpacity>
          )}

          {/* Count pill badge for library / search */}
          {count !== undefined && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handleBadgePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Tag ${cleanName}${count !== undefined ? `, ${count} item` : ""}`}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  return badgeContent;
}

const styles = StyleSheet.create({
  outerContainer: {
    height: 35,
    marginRight: 10,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  shadowWrapper: {
    position: "absolute",
    top: 2.5,
    left: 2.5,
    right: -2.5,
    bottom: -2.5,
    flexDirection: "row",
    height: 32,
    zIndex: 0,
  },
  shadowBody: {
    flex: 1,
    height: 32,
    backgroundColor: "#000000",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: -1,
  },
  foregroundWrapper: {
    flexDirection: "row",
    height: 32,
    zIndex: 1,
    alignItems: "stretch",
  },
  leftCap: {
    width: 18,
    height: 32,
  },
  rightBody: {
    height: 32,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#000000",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: -1,
    paddingLeft: 3,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.2,
  },
  removeCircleBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  countBadge: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
});
