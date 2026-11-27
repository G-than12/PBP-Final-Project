import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Rect, Circle, Text as SvgText } from "react-native-svg";

interface PlatformLogoProps {
  platform?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function LogoFrame({
  size,
  bg,
  style,
  children,
}: {
  size: number;
  bg: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect width="24" height="24" rx="6" fill={bg} />
        {children}
      </Svg>
    </View>
  );
}

export function PlatformLogo({ platform = "Web", size = 24, style }: PlatformLogoProps) {
  const norm = (platform || "").toLowerCase().trim();

  if (norm.includes("tiktok")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <Path
          d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
          fill="#25F4EE"
          transform="translate(-0.6, -0.6)"
        />
        <Path
          d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
          fill="#FE2C55"
          transform="translate(0.6, 0.6)"
        />
        <Path
          d="M16.2 7.2c-.8-.7-1.3-1.6-1.4-2.7h-2.1v10.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.4 0 .7.1 1.1.2V9.8c-.4-.1-.7-.1-1.1-.1C7.1 9.7 5 11.8 5 14.5s2.1 4.8 4.8 4.8c2.6 0 4.7-2 4.8-4.6v-5.2c1.2.9 2.6 1.4 4.1 1.5v-2.2c-.9 0-1.8-.6-2.5-1.6z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("instagram")) {
    return (
      <LogoFrame size={size} bg="#E1306C" style={style}>
        <Rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        <Circle cx="12" cy="12" r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        <Circle cx="16.5" cy="7.5" r="1.1" fill="#FFFFFF" />
      </LogoFrame>
    );
  }

  if (norm.includes("threads")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <Path
          d="M16.8 11.4c-.2-2.6-1.8-4.1-4.5-4.1-2.4 0-4 1.2-4.5 2.7l1.7.6c.4-.9 1.3-1.6 2.7-1.6 1.6 0 2.5.8 2.7 2.2-.8-.3-1.7-.4-2.7-.4-2.5 0-4.1 1.2-4.1 3.1 0 1.8 1.4 3 3.5 3 1.8 0 3.1-.8 3.6-2.1.6.4 1.1 1 1.1 1.9 0 1.8-1.6 3.1-4.3 3.1-3.1 0-5.2-2.1-5.2-5.6 0-3.6 2.1-5.8 5.4-5.8 2.9 0 4.8 1.5 5.4 4.2l1.8-.4C18.6 7.5 16 5.4 12.2 5.4 7.7 5.4 4.8 8.4 4.8 13.1c0 4.6 2.9 7.5 7.4 7.5 3.8 0 6.2-2 6.2-5 0-1.9-1-3.1-2.6-3.7l1-.5zm-5 3.8c-1.1 0-1.8-.6-1.8-1.4 0-.9.8-1.5 2.2-1.5.9 0 1.7.1 2.4.4-.2 1.5-1.2 2.5-2.8 2.5z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("youtube")) {
    return (
      <LogoFrame size={size} bg="#FF0000" style={style}>
        <Path d="M10 8.5v7l6-3.5z" fill="#FFFFFF" />
      </LogoFrame>
    );
  }

  if (norm.includes("pinterest")) {
    return (
      <LogoFrame size={size} bg="#BD081C" style={style}>
        <Path
          d="M12 4a7.5 7.5 0 0 0-2.8 14.5c.1-.6.3-1.6.1-2.3l-.8-3.4s.2-.4.2-1.1c0-1-.6-1.8-1.4-1.8-.6 0-1 .5-1 1.1 0 .7.4 1.7.6 2.6.2.7-.4 1.3-1.1 1.3-1.3 0-2.3-1.4-2.3-3.4 0-1.8 1.3-3.1 3.2-3.1 2.3 0 3.7 1.7 3.7 3.5 0 1.2-.5 2.1-1.1 2.1-.4 0-.6-.3-.6-.7l.2-.9c.1-.4.2-.8.2-1.1 0-.9-.7-1.4-1.5-1.4-1.2 0-2.1 1.3-2.1 3 0 .9.3 1.5.3 1.5l-1.3 5.4c-.4 1.6 0 3.5.1 3.7A8 8 0 1 0 12 4z"
          fill="#FFFFFF"
          transform="scale(0.85) translate(2, 2)"
        />
      </LogoFrame>
    );
  }

  if (norm === "x" || norm.includes("twitter")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <Path
          d="M17.5 5h-2.1l-3.8 4.8L7.8 5H4.5l5.2 6.8L4.5 19h2.1l4.1-5.1 4.1 5.1h3.3l-5.5-7.1L17.5 5zm-3 12.4l-7.7-10.8h1.2l7.7 10.8h-1.2z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("github")) {
    return (
      <LogoFrame size={size} bg="#181717" style={style}>
        <Path
          d="M12 4.5a7.5 7.5 0 0 0-2.37 14.62c.38.07.52-.16.52-.36v-1.27c-2.1.46-2.54-1.01-2.54-1.01-.34-.87-.84-1.1-.84-1.1-.69-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.68 1.16 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.68-.19-3.44-.84-3.44-3.73 0-.82.29-1.5.78-2.02-.08-.19-.34-.96.07-2 0 0 .64-.2 2.09.77a7.2 7.2 0 0 1 3.8 0c1.45-.97 2.09-.77 2.09-.77.41 1.04.15 1.81.07 2 .49.52.78 1.2.78 2.02 0 2.9-1.77 3.54-3.45 3.72.27.23.51.69.51 1.4v2.07c0 .2.14.43.52.36A7.5 7.5 0 0 0 12 4.5z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("facebook")) {
    return (
      <LogoFrame size={size} bg="#1877F2" style={style}>
        <Path
          d="M13.5 19.5v-6.8h2.3l.34-2.65H13.5V8.35c0-.77.21-1.3 1.32-1.3h1.41V4.68c-.24-.03-1.08-.1-2.06-.1-2.04 0-3.43 1.24-3.43 3.53v1.94H8.43v2.65h2.31v6.8h2.76z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("linkedin")) {
    return (
      <LogoFrame size={size} bg="#0A66C2" style={style}>
        <Circle cx="7.5" cy="7.5" r="1.35" fill="#FFFFFF" />
        <Rect x="6.3" y="10" width="2.4" height="7.5" rx="0.4" fill="#FFFFFF" />
        <Path
          d="M10.8 10h2.3v1.05h.03c.32-.6 1.1-1.25 2.27-1.25 2.43 0 2.88 1.6 2.88 3.68v4.02h-2.4v-3.56c0-.85-.02-1.94-1.18-1.94-1.18 0-1.36.92-1.36 1.88v3.62h-2.54V10z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("reddit")) {
    return (
      <LogoFrame size={size} bg="#FF4500" style={style}>
        <Circle cx="12" cy="13.5" r="5" fill="#FFFFFF" />
        <Circle cx="9.8" cy="13.2" r="0.9" fill="#FF4500" />
        <Circle cx="14.2" cy="13.2" r="0.9" fill="#FF4500" />
        <Path d="M10 15.5c.6.6 1.3.8 2 .8s1.4-.2 2-.8" stroke="#FF4500" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M12 8.5l1.2-3 2.3.5" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <Circle cx="16.2" cy="6.2" r="1.1" fill="#FFFFFF" />
      </LogoFrame>
    );
  }

  if (norm.includes("medium")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <Circle cx="8" cy="12" r="3.6" fill="#FFFFFF" />
        <Path d="M14.3 12c0 2-.9 3.6-2 3.6s-2-1.6-2-3.6.9-3.6 2-3.6 2 1.6 2 3.6z" fill="#FFFFFF" />
        <Path d="M18 12c0 1.8-.4 3.2-.9 3.2s-.9-1.4-.9-3.2.4-3.2.9-3.2.9 1.4.9 3.2z" fill="#FFFFFF" />
      </LogoFrame>
    );
  }

  if (norm.includes("figma")) {
    return (
      <LogoFrame size={size} bg="#1E1E1E" style={style}>
        <Path d="M9.5 5h2.5v4.6H9.5a2.3 2.3 0 0 1 0-4.6z" fill="#F24E1E" />
        <Path d="M12 5h2.5a2.3 2.3 0 0 1 0 4.6H12V5z" fill="#FF7262" />
        <Path d="M9.5 9.6H12v4.6H9.5a2.3 2.3 0 0 1 0-4.6z" fill="#A259FF" />
        <Circle cx="14.3" cy="11.9" r="2.3" fill="#1ABCFE" />
        <Path d="M9.5 14.2H12v2.3a2.3 2.3 0 1 1-2.5-2.3z" fill="#0ACF83" />
      </LogoFrame>
    );
  }

  if (norm.includes("notion")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <Rect x="5.5" y="5" width="13" height="14" rx="2" fill="#FFFFFF" />
        <SvgText
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fill="#000000"
        >
          N
        </SvgText>
      </LogoFrame>
    );
  }

  if (norm.includes("spotify")) {
    return (
      <LogoFrame size={size} bg="#1DB954" style={style}>
        <Path d="M6.5 9.5c3.5-1 7.6-.8 10.8.8" stroke="#FFFFFF" strokeWidth="1.9" fill="none" strokeLinecap="round" />
        <Path d="M7.5 12.6c2.9-.8 6.2-.6 8.8.7" stroke="#FFFFFF" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <Path d="M8.5 15.6c2.2-.6 4.7-.4 6.7.6" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </LogoFrame>
    );
  }

  if (norm.includes("dribbble")) {
    return (
      <LogoFrame size={size} bg="#EA4C89" style={style}>
        <Circle cx="12" cy="12" r="6.8" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <Path d="M6.2 10.2c4 .2 7.8-.4 10.6-2.4M7.2 16.5c2.2-2.6 5.4-4 10.8-3.2M9.8 5.6c2 3.1 3.4 6.6 4 12.6" stroke="#FFFFFF" strokeWidth="1.3" fill="none" />
      </LogoFrame>
    );
  }

  if (norm.includes("behance")) {
    return (
      <LogoFrame size={size} bg="#1769FF" style={style}>
        <SvgText
          x="12"
          y="15.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="900"
          fill="#FFFFFF"
        >
          Bē
        </SvgText>
      </LogoFrame>
    );
  }

  if (norm.includes("shopee")) {
    return (
      <LogoFrame size={size} bg="#EE4D2D" style={style}>
        <Path d="M9 8.5a3 3 0 0 1 6 0" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <Rect x="6" y="8.5" width="12" height="10.5" rx="2" fill="#FFFFFF" />
        <SvgText x="12" y="16.8" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#EE4D2D">
          S
        </SvgText>
      </LogoFrame>
    );
  }

  if (norm.includes("tokopedia")) {
    return (
      <LogoFrame size={size} bg="#42B549" style={style}>
        <Path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <Rect x="5.5" y="8" width="13" height="11" rx="2.5" fill="#FFFFFF" />
        <Circle cx="9.8" cy="12.5" r="1.4" fill="#42B549" />
        <Circle cx="14.2" cy="12.5" r="1.4" fill="#42B549" />
      </LogoFrame>
    );
  }

  if (norm.includes("google drive") || norm.includes("drive")) {
    return (
      <LogoFrame size={size} bg="#FFFFFF" style={style}>
        <Rect x="0.8" y="0.8" width="22.4" height="22.4" rx="5.2" fill="none" stroke="#000000" strokeWidth="1.4" />
        <Path d="M12 5.5l4.8 8.3h-3.6L8.4 5.5z" fill="#FBBC05" />
        <Path d="M8.4 5.5L5.2 11l3.6 6.2 3.2-5.5z" fill="#0F9D58" />
        <Path d="M8.8 17.2h8.4l1.6-3.4H10.4z" fill="#4285F4" />
      </LogoFrame>
    );
  }

  if (norm.includes("canva")) {
    return (
      <LogoFrame size={size} bg="#00C4CC" style={style}>
        <SvgText x="12" y="16" textAnchor="middle" fontSize="13" fontWeight="900" fill="#FFFFFF">
          C
        </SvgText>
      </LogoFrame>
    );
  }

  if (norm.includes("telegram")) {
    return (
      <LogoFrame size={size} bg="#26A5E4" style={style}>
        <Path
          d="M17.8 6.4L5.6 11.1c-.8.3-.8.8-.1 1l3.1 1 7.2-4.5c.3-.2.6-.1.4.2l-5.8 5.3-.2 3.3c.3 0 .5-.1.7-.3l1.7-1.6 3.5 2.6c.6.4 1.1.2 1.3-.6l2.3-10.7c.2-.9-.3-1.3-1-.9z"
          fill="#FFFFFF"
          transform="scale(0.9) translate(1, 1)"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("discord")) {
    return (
      <LogoFrame size={size} bg="#5865F2" style={style}>
        <Path
          d="M17.2 7.5a12 12 0 0 0-3-.9l-.4.8a11 11 0 0 0-3.6 0l-.4-.8a12 12 0 0 0-3 .9C5 10.3 4.5 13 4.7 15.7a12 12 0 0 0 3.7 1.8l.8-1.1a8 8 0 0 1-1.2-.6l.3-.2a8.5 8.5 0 0 0 7.4 0l.3.2c-.4.2-.8.4-1.2.6l.8 1.1a12 12 0 0 0 3.7-1.8c.3-3.1-.5-5.8-2.1-8.2zM9.6 14.1c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm4.8 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z"
          fill="#FFFFFF"
        />
      </LogoFrame>
    );
  }

  if (norm.includes("substack")) {
    return (
      <LogoFrame size={size} bg="#FF6719" style={style}>
        <Rect x="6.5" y="5.5" width="11" height="2" fill="#FFFFFF" />
        <Rect x="6.5" y="9" width="11" height="2" fill="#FFFFFF" />
        <Path d="M6.5 12.5h11v6.5L12 16l-5.5 3z" fill="#FFFFFF" />
      </LogoFrame>
    );
  }

  if (norm.includes("wikipedia")) {
    return (
      <LogoFrame size={size} bg="#000000" style={style}>
        <SvgText x="12" y="15.8" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#FFFFFF">
          W
        </SvgText>
      </LogoFrame>
    );
  }

  // Web default
  return (
    <LogoFrame size={size} bg="#2563EB" style={style}>
      <Circle cx="12" cy="12" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <Path d="M5 12h14M12 5a10.5 10.5 0 0 1 0 14M12 5a10.5 10.5 0 0 0 0 14" stroke="#FFFFFF" strokeWidth="1.5" />
    </LogoFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
