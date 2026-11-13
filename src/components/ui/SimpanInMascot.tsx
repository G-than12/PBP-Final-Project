import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

interface SimpanInMascotProps {
  size?: number;
  small?: boolean;
}

export function SimpanInMascot({ size, small = false }: SimpanInMascotProps) {
  const width = size || (small ? 36 : 96);
  const height = width * 1.15;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg viewBox="-4 -14 154 184" width="100%" height="100%">
        {/* Blue back ribbon layer */}
        <Path
          d="M46 21h75v123l-37-23-38 23z"
          fill="#69B7F4"
          stroke="#000000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Yellow front bookmark layer */}
        <Path
          d="M31 12h75v123l-37-23-38 23z"
          fill="#F7CB54"
          stroke="#000000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Smiling Eyes */}
        <Circle cx="55" cy="65" r="4.5" fill="#000000" />
        <Circle cx="83" cy="65" r="4.5" fill="#000000" />
        {/* Smile curve */}
        <Path
          d="M55 81 Q69 95 83 81"
          fill="none"
          stroke="#000000"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Cute tilted red & white capsule chain badge */}
        <G transform="translate(18, 14) rotate(-20)">
          <Rect
            x="0"
            y="0"
            width="38"
            height="18"
            rx="9"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4"
          />
          <Path d="M19 1v16" stroke="#F43F5E" strokeWidth="8" />
        </G>
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

