import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { isImageUrl } from "../../utils/metadataParser";

interface LinkThumbnailProps {
  image?: string;
  tags?: string[];
  symbolSize?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

function getVisualFallback(image?: string, tags: string[] = []) {
  const imgType =
    !isImageUrl(image) && image
      ? image
      : tags.includes("resep")
      ? "food"
      : tags.includes("interior")
      ? "home"
      : tags.includes("jepang")
      ? "travel"
      : "web";

  switch (imgType) {
    case "food":
      return { bg: "#ED7847", symbol: "15" };
    case "home":
      return { bg: "#9CD7BE", symbol: "⌂" };
    case "travel":
      return { bg: "#E7A997", symbol: "京都" };
    default:
      return { bg: "#9DC3E9", symbol: "↗" };
  }
}

/**
 * Renders the link's fetched thumbnail image when `image` is a valid URL,
 * falling back to the Neobrutalist thematic placeholder if unavailable or failed.
 */
export function LinkThumbnail({
  image,
  tags = [],
  symbolSize = "md",
  style,
  children,
}: LinkThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  const showImage = isImageUrl(image) && !hasError;
  const fallback = getVisualFallback(image, tags);

  const symbolStyle =
    symbolSize === "lg"
      ? styles.symbolLg
      : symbolSize === "sm"
      ? styles.symbolSm
      : styles.symbolMd;

  return (
    <View style={[styles.container, { backgroundColor: fallback.bg }, style]}>
      {showImage ? (
        <Image
          source={{ uri: image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Text style={[styles.symbolBase, symbolStyle]}>{fallback.symbol}</Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  symbolBase: {
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowRadius: 0,
  },
  symbolSm: {
    fontSize: 32,
    textShadowOffset: { width: 2, height: 2 },
  },
  symbolMd: {
    fontSize: 42,
    textShadowOffset: { width: 2, height: 2 },
  },
  symbolLg: {
    fontSize: 92,
    textShadowOffset: { width: 4, height: 4 },
  },
});
