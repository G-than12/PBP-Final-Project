import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet, Platform } from "react-native";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { useSimpanInStore } from "../src/store/useSimpanInStore";

export default function RootLayout() {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return (
    <GestureHandlerRootView
      style={[
        styles.outerContainer,
        {
          backgroundColor:
            Platform.OS === "web"
              ? isDark
                ? "#121110"
                : "#EFEAE2"
              : theme.background,
        },
      ]}
    >
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={[styles.appWrapper, { backgroundColor: theme.background }]}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="home" />
            <Stack.Screen name="search" />
            <Stack.Screen name="focus" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="collection/[id]" />
            <Stack.Screen name="link/[id]" />
            <Stack.Screen name="settings/index" />
            <Stack.Screen name="settings/cloud-sync" />
            <Stack.Screen name="settings/backup" />
            <Stack.Screen name="settings/guide" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  appWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 540 : undefined,
    alignSelf: "center",
    ...(Platform.OS === "web"
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        }
      : {}),
  },
});
