import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";

export default function SplashScreen() {
  const router = useRouter();
  const isOnboarded = useSimpanInStore((state) => state.isOnboarded);
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [isOnboarded]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SimpanInMascot size={110} />
      <Text style={[styles.title, { color: theme.text }]}>SimpanIn</Text>
      <Text style={[styles.tagline, { color: theme.textMuted }]}>
        Simpan sekali. Temukan kapan saja.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 18,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
});
