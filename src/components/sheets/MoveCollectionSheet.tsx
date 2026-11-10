import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ArrowRight } from "lucide-react-native";
import { Collection } from "../../types/models";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { AppIcon } from "../ui/AppIcon";

interface MoveCollectionSheetProps {
  visible: boolean;
  collections: Collection[];
  currentCollectionId: string;
  onClose: () => void;
  onMove: (targetCollectionId: string) => void;
}

export function MoveCollectionSheet({
  visible,
  collections,
  currentCollectionId,
  onClose,
  onMove,
}: MoveCollectionSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    onMove(id);
    onClose();
  };

  return (
    <NeoBottomSheet visible={visible} title="Pindahkan ke Koleksi" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {collections.map((col) => {
          const isCurrent = col.id === currentCollectionId;
          return (
            <TouchableOpacity
              key={col.id}
              style={[
                styles.itemRow,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                isCurrent && { opacity: 0.5 },
              ]}
              disabled={isCurrent}
              onPress={() => handleSelect(col.id)}
            >
              <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: col.color }]}>
                  <AppIcon name={col.icon} size={16} color="#000000" />
                </View>
                <View>
                  <Text style={[styles.colName, { color: theme.text }]}>{col.name}</Text>
                  {col.parentId && (
                    <Text style={[styles.colSub, { color: theme.textSecondary }]}>
                      Subkoleksi
                    </Text>
                  )}
                </View>
              </View>

              {isCurrent ? (
                <View
                  style={[
                    styles.currentBadge,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <Text style={[styles.currentText, { color: theme.textSecondary }]}>
                    Koleksi Ini
                  </Text>
                </View>
              ) : (
                <ArrowRight size={16} color={theme.text} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 380,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  colName: {
    fontSize: 15,
    fontWeight: "800",
  },
  colSub: {
    fontSize: 11,
    marginTop: 1,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
  },
  currentText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
