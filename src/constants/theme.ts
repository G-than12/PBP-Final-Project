export const NEO_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};

export const NEO_SHADOW_SM = {
  shadowColor: "#000000",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
};

export const NEO_SHADOW_LG = {
  shadowColor: "#000000",
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
};

export const THEME_LIGHT = {
  isDark: false,
  background: "#FBF8F3",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardSecondary: "#F5F0E8",
  border: "#000000",
  borderLight: "#E9E3D8",
  text: "#000000",
  textMuted: "#666158",
  textSecondary: "#8A8478",
  primary: "#000000",
  accentYellow: "#F7CB54", // SimpanIn Signature Mascot Yellow
  accentBlue: "#69B7F4",   // Mascot Ribbon Blue
  accentCoral: "#FF8C79",
  accentGreen: "#A6E3D1",
  danger: "#EF4444",
  success: "#10B981",
  radius: 18,
  radiusSm: 12,
  radiusXs: 8,
};

export const THEME_DARK = {
  isDark: true,
  background: "#181716",
  surface: "#242220",
  card: "#242220",
  cardSecondary: "#2E2B28",
  border: "#3F3C38",
  borderLight: "#33302C",
  text: "#FFFFFF",
  textMuted: "#ABA59B",
  textSecondary: "#8A8478",
  primary: "#FFFFFF",
  accentYellow: "#F7CB54",
  accentBlue: "#69B7F4",
  accentCoral: "#FF8C79",
  accentGreen: "#A6E3D1",
  danger: "#F87171",
  success: "#34D399",
  radius: 18,
  radiusSm: 12,
  radiusXs: 8,
};

export const FOLDER_COLORS = [
  "#F7CB54", // 1. Yellow (Default SimpanIn)
  "#FF8C79", // 2. Coral
  "#A6E3D1", // 3. Mint
  "#8FC9FF", // 4. Sky Blue
  "#D0B7FF", // 5. Lavender
  "#FFB8D2", // 6. Pink
  "#B8E986", // 7. Lime
  "#FF9F43", // 8. Orange
  "#FFE39A", // 9. Butter
  "#80CBC4", // 10. Teal
  "#90CAF9", // 11. Pastel Blue
  "#CE93D8", // 12. Lilac
  "#EF9A9A", // 13. Soft Red
  "#C5E1A5", // 14. Soft Green
  "#B0BEC5", // 15. Slate Silver
  "#E4DCCF", // 16. Warm Sand
] as const;

export const FOLDER_ICONS = [
  "folder",   // 1
  "book",     // 2
  "food",     // 3
  "home",     // 4
  "plane",    // 5
  "star",     // 6
  "heart",    // 7
  "idea",     // 8
  "camera",   // 9
  "music",    // 10
  "work",     // 11
  "gift",     // 12
  "film",     // 13
  "game",     // 14
  "shop",     // 15
  "coffee",   // 16
  "leaf",     // 17
  "code",     // 18
  "study",    // 19
  "fitness",  // 20
  "art",      // 21
  "map",      // 22
  "link",     // 23
  "archive",  // 24
] as const;

export type FolderColor = typeof FOLDER_COLORS[number];
export type FolderIcon = typeof FOLDER_ICONS[number];

