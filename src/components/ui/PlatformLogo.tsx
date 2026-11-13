import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

interface PlatformLogoProps {
  platform?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function PlatformLogo({ platform = "Web", size = 24, style }: PlatformLogoProps) {
  const norm = (platform || "").toLowerCase();

  if (norm.includes("tiktok")) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect width="24" height="24" rx="6" fill="#000000" />
          {/* Cyan shadow layer */}
          <Path
            d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
            fill="#25F4EE"
            transform="translate(-0.6, -0.6)"
          />
          {/* Red shadow layer */}
          <Path
            d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
            fill="#FE2C55"
            transform="translate(0.6, 0.6)"
          />
          {/* Front white symbol */}
          <Path
            d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>
    );
  }

  if (norm.includes("instagram")) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect width="24" height="24" rx="6" fill="#E1306C" />
          <Rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <Circle cx="12" cy="12" r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <Circle cx="16.5" cy="7.5" r="1.1" fill="#FFFFFF" />
        </Svg>
      </View>
    );
  }

  if (norm.includes("youtube")) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect width="24" height="24" rx="6" fill="#FF0000" />
          <Path d="M10 8.5v7l6-3.5z" fill="#FFFFFF" />
        </Svg>
      </View>
    );
  }

  if (norm.includes("pinterest")) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect width="24" height="24" rx="6" fill="#BD081C" />
          <Path
            d="M12 4a7.5 7.5 0 0 0-2.8 14.5c.1-.6.3-1.6.1-2.3l-.8-3.4s.2-.4.2-1.1c0-1-.6-1.8-1.4-1.8-.6 0-1 .5-1 1.1 0 .7.4 1.7.6 2.6.2.7-.4 1.3-1.1 1.3-1.3 0-2.3-1.4-2.3-3.4 0-1.8 1.3-3.1 3.2-3.1 2.3 0 3.7 1.7 3.7 3.5 0 1.2-.5 2.1-1.1 2.1-.4 0-.6-.3-.6-.7l.2-.9c.1-.4.2-.8.2-1.1 0-.9-.7-1.4-1.5-1.4-1.2 0-2.1 1.3-2.1 3 0 .9.3 1.5.3 1.5l-1.3 5.4c-.4 1.6 0 3.5.1 3.7A8 8 0 1 0 12 4z"
            fill="#FFFFFF"
            transform="scale(0.85) translate(2, 2)"
          />
        </Svg>
      </View>
    );
  }

  if (norm === "x" || norm.includes("twitter")) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect width="24" height="24" rx="6" fill="#000000" />
          <Path
            d="M17.5 5h-2.1l-3.8 4.8L7.8 5H4.5l5.2 6.8L4.5 19h2.1l4.1-5.1 4.1 5.1h3.3l-5.5-7.1L17.5 5zm-3 12.4l-7.7-10.8h1.2l7.7 10.8h-1.2z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>
    );
  }

  // Web default
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect width="24" height="24" rx="6" fill="#2563EB" />
        <Circle cx="12" cy="12" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        <Path d="M5 12h14M12 5a10.5 10.5 0 0 1 0 14M12 5a10.5 10.5 0 0 0 0 14" stroke="#FFFFFF" strokeWidth="1.5" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
