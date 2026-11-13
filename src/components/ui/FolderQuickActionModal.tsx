import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Edit3, Share2, Trash2 } from "lucide-react-native";
import { Collection } from "../../types/models";
import { ManilaFolderCard, FolderLayoutRect } from "./ManilaFolderCard";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface FolderActionTarget {
  collection: Collection;
  itemCount: number;
  subcollectionCount?: number;
  freshCount?: number;
  isMain?: boolean;
  rect: FolderLayoutRect;
}

interface FolderQuickActionModalProps {
  visible: boolean;
  target: FolderActionTarget | null;
  onClose: () => void;
  onEdit: (collection: Collection) => void;
  onShare: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onOpen: (collection: Collection) => void;
}

export function FolderQuickActionModal({
  visible,
  target,
  onClose,
  onEdit,
  onShare,
  onDelete,
  onOpen,
}: FolderQuickActionModalProps) {
  if (!visible || !target) return null;

  const rect = target.rect;
  const isFallback = !rect.width || !rect.height || rect.width <= 0;

  const cardWidth = isFallback ? 166 : rect.width;
  const cardHeight = isFallback ? 164 : rect.height;

  // Boundary-safe positioning
  const cardTop = isFallback
    ? (SCREEN_HEIGHT - cardHeight) / 2
    : Math.min(Math.max(36, rect.y), SCREEN_HEIGHT - cardHeight - 30);
  const cardLeft = isFallback
    ? (SCREEN_WIDTH - cardWidth) / 2
    : Math.min(Math.max(14, rect.x), SCREEN_WIDTH - cardWidth - 14);

  const isLeftColumn = cardLeft < 60;

  // Exact arc cluster coordinates relative to card
  const editLeft = isLeftColumn ? Math.max(8, cardLeft - 8) : cardLeft - 26;
  const editTop = cardTop + 20;

  const shareLeft = isLeftColumn ? cardLeft + 28 : cardLeft + 12;
  const shareTop = cardTop - 18;

  const trashLeft = isLeftColumn ? cardLeft + 70 : cardLeft + 54;
  const trashTop = cardTop - 24;

  const isSystem = target.collection.isSystem || target.collection.id === "inbox";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Dark Dimmed Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Tutup menu opsi koleksi"
        >
          <View style={styles.dimLayer} />
        </Pressable>

        {/* Elevated Target Card in its exact position */}
        <View
          style={[
            styles.elevatedCardWrap,
            {
              top: cardTop,
              left: cardLeft,
              width: cardWidth,
            },
          ]}
        >
          <ManilaFolderCard
            collection={target.collection}
            itemCount={target.itemCount}
            subcollectionCount={target.subcollectionCount}
            freshCount={target.freshCount}
            isMain={target.isMain}
            onPress={() => {
              onClose();
              onOpen(target.collection);
            }}
          />
        </View>

        {/* Action Button 1: Edit (Pencil) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.editCircle,
            {
              top: editTop,
              left: editLeft,
              backgroundColor: pressed ? "#F7CB54" : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
            onEdit(target.collection);
          }}
          accessibilityLabel={`Edit ${target.collection.name}`}
        >
          {({ pressed }) => (
            <Edit3 size={20} color="#000000" strokeWidth={2.4} />
          )}
        </Pressable>

        {/* Action Button 2: Share (Share2) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.shareCircle,
            {
              top: shareTop,
              left: shareLeft,
              backgroundColor: pressed ? "#F7CB54" : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
            onShare(target.collection);
          }}
          accessibilityLabel={`Bagikan ${target.collection.name}`}
        >
          {({ pressed }) => (
            <Share2 size={20} color="#000000" strokeWidth={2.4} />
          )}
        </Pressable>

        {/* Action Button 3: Delete (Trash2) */}
        {!isSystem && (
          <Pressable
            style={({ pressed }) => [
              styles.actionCircle,
              styles.trashCircle,
              {
                top: trashTop,
                left: trashLeft,
                backgroundColor: pressed ? "#FF4D6D" : "#FFFFFF",
              },
            ]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onClose();
              onDelete(target.collection);
            }}
            accessibilityLabel={`Hapus ${target.collection.name}`}
          >
            {({ pressed }) => (
              <Trash2
                size={20}
                color={pressed ? "#FFFFFF" : "#000000"}
                strokeWidth={2.4}
              />
            )}
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  dimLayer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  elevatedCardWrap: {
    position: "absolute",
    zIndex: 10,
  },
  actionCircle: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  editCircle: {
    zIndex: 20,
  },
  shareCircle: {
    zIndex: 21,
  },
  trashCircle: {
    zIndex: 22,
  },
});
