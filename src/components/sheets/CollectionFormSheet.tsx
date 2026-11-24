import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { Collection } from "../../types/models";
import {
  FOLDER_COLORS,
  FOLDER_ICONS,
  THEME_LIGHT,
  THEME_DARK,
} from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { AppIcon } from "../ui/AppIcon";
import {
  getValidParentCollections,
  getDescendantCollectionIds,
  isValidParentChoice,
} from "../../utils/collectionHierarchy";

interface CollectionFormSheetProps {
  visible: boolean;
  editingCollection?: Collection | null;
  existingCollections: Collection[];
  defaultParentId?: string | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    color: string;
    icon: string;
    parentId?: string | null;
  }) => void;
}

export function CollectionFormSheet({
  visible,
  editingCollection,
  existingCollections,
  defaultParentId = null,
  onClose,
  onSave,
}: CollectionFormSheetProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(FOLDER_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(FOLDER_ICONS[0]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [gridWidth, setGridWidth] = useState(0);

  // Responsively calculate item size so 8 items fit per row cleanly with 8px gaps and 8px horizontal padding
  const itemSize =
    gridWidth > 0
      ? Math.min(48, Math.max(28, Math.floor((gridWidth - 8 - 7 * 8) / 8)))
      : 34;

  // Hanya tampilkan koleksi induk yang valid (tidak termasuk diri sendiri dan seluruh subkoleksinya)
  const validParents = useMemo(() => {
    return getValidParentCollections(editingCollection, existingCollections);
  }, [editingCollection, existingCollections]);

  // Hitung jumlah subkoleksi turunan yang dilindungi dari perulangan siklus
  const descendantCount = useMemo(() => {
    if (!editingCollection) return 0;
    return getDescendantCollectionIds(editingCollection.id, existingCollections).size;
  }, [editingCollection, existingCollections]);

  useEffect(() => {
    if (visible) {
      if (editingCollection) {
        setName(editingCollection.name);
        setSelectedColor(editingCollection.color);
        setSelectedIcon(editingCollection.icon);
        const currentParent = editingCollection.parentId || null;
        const isValid = isValidParentChoice(
          editingCollection.id,
          currentParent,
          existingCollections
        );
        setSelectedParentId(isValid ? currentParent : null);
      } else {
        setName("");
        setSelectedColor(FOLDER_COLORS[Math.floor(Math.random() * 6)]);
        setSelectedIcon("folder");
        setSelectedParentId(defaultParentId);
      }
    }
  }, [visible, editingCollection?.id, defaultParentId]);

  const handleSave = () => {
    if (!name.trim()) return;

    let safeParentId = selectedParentId;
    if (editingCollection && safeParentId) {
      if (!isValidParentChoice(editingCollection.id, safeParentId, existingCollections)) {
        safeParentId = null;
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
      parentId: safeParentId,
    });
    onClose();
  };

  return (
    <NeoBottomSheet
      visible={visible}
      title={
        editingCollection
          ? "Edit Koleksi"
          : defaultParentId
          ? "Tambah Subkoleksi"
          : "Tambah Koleksi"
      }
      onClose={onClose}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {defaultParentId ? "Nama Subkoleksi" : "Nama Koleksi"}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: isDark ? "#4A4640" : "#000000",
                color: theme.text,
              },
            ]}
            placeholder={defaultParentId ? "Nama subkoleksi..." : "Nama koleksi..."}
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus={visible && !editingCollection}
          />
        </View>

        {/* Colors Grid */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Warna</Text>
          <View
            style={styles.colorGrid}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {FOLDER_COLORS.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.8}
                  style={[
                    styles.colorSquare,
                    {
                      width: itemSize,
                      height: itemSize,
                      backgroundColor: c,
                    },
                    isSelected && styles.colorSquareSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedColor(c);
                  }}
                >
                  {isSelected && (
                    <Check
                      size={Math.max(14, Math.floor(itemSize * 0.45))}
                      color="#000000"
                      strokeWidth={3}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Icons Grid */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Ikon</Text>
          <View style={styles.iconGrid}>
            {FOLDER_ICONS.map((ic) => {
              const isSelected = selectedIcon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconSquare,
                    {
                      width: itemSize,
                      height: itemSize,
                      backgroundColor: isSelected ? selectedColor : theme.surface,
                      borderColor: isSelected ? "#000000" : isDark ? "#4A4640" : "#000000",
                    },
                    isSelected && styles.iconSquareSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedIcon(ic);
                  }}
                >
                  <AppIcon
                    name={ic}
                    size={Math.max(14, Math.floor(itemSize * 0.5))}
                    color="#000000"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Subcollection Parent Selector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Folder Induk</Text>
          {editingCollection && descendantCount > 0 && (
            <Text style={[styles.subText, { color: theme.textSecondary }]}>
              {`${descendantCount} subkoleksi turunan disembunyikan agar hierarki tidak saling bertumpuk.`}
            </Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentRow}>
            <TouchableOpacity
              style={[
                styles.parentChip,
                {
                  backgroundColor:
                    selectedParentId === null ? "#F7CB54" : theme.cardSecondary,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
                selectedParentId === null && styles.parentChipSelected,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedParentId(null);
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="folder" size={14} color="#000000" />
              <Text
                style={[
                  styles.parentChipText,
                  { color: selectedParentId === null ? "#000000" : theme.text },
                ]}
              >
                Koleksi Utama
              </Text>
            </TouchableOpacity>

            {validParents.map((p) => {
              const isSelected = selectedParentId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.parentChip,
                    {
                      backgroundColor: isSelected ? p.color : theme.cardSecondary,
                      borderColor: isSelected ? "#000000" : isDark ? "#4A4640" : "#000000",
                    },
                    isSelected && styles.parentChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedParentId(p.id);
                  }}
                  activeOpacity={0.8}
                >
                  <AppIcon name={p.icon} size={14} color="#000000" />
                  <Text
                    style={[
                      styles.parentChipText,
                      { color: isSelected ? "#000000" : theme.text },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar so user never misses Simpan Perubahan */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: isDark ? "#4A4640" : "#E5E1D8",
          },
        ]}
      >
        <NeoButton
          variant="primary"
          size="lg"
          disabled={!name.trim()}
          onPress={handleSave}
          style={styles.submitBtn}
        >
          {editingCollection
            ? "Simpan Perubahan"
            : defaultParentId
            ? "Buat Subkoleksi"
            : "Buat Koleksi"}
        </NeoButton>
      </View>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 64,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  subText: {
    fontSize: 11,
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    fontSize: 14,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  colorSquare: {
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  colorSquareSelected: {
    borderWidth: 2.5,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  iconSquare: {
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  iconSquareSelected: {
    borderWidth: 2.5,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  parentRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  parentChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    gap: 6,
  },
  parentChipSelected: {
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  parentChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stickyBottomBar: {
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  submitBtn: {
    width: "100%",
  },
});
