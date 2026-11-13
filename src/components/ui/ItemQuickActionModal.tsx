import React from "react";
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
import { ExternalLink, Pin, Share2, Trash2 } from "lucide-react-native";
import { SavedItem } from "../../types/models";
import { FigmaItemCard, ItemLayoutRect } from "./FigmaItemCard";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ItemActionTarget {
  item: SavedItem;
  rect: ItemLayoutRect;
}

interface ItemQuickActionModalProps {
  visible: boolean;
  target: ItemActionTarget | null;
  onClose: () => void;
  onOpenLink: (item: SavedItem) => void;
  onTogglePin: (item: SavedItem) => void;
  onShare: (item: SavedItem) => void;
  onDelete: (item: SavedItem) => void;
  onOpenDetail: (item: SavedItem) => void;
}

export function ItemQuickActionModal({
  visible,
  target,
  onClose,
  onOpenLink,
  onTogglePin,
  onShare,
  onDelete,
  onOpenDetail,
}: ItemQuickActionModalProps) {
  if (!visible || !target) return null;

  const rect = target.rect;
  const isFallback = !rect.width || !rect.height || rect.width <= 0;

  const cardWidth = isFallback ? 166 : rect.width;
  const cardHeight = isFallback ? 190 : rect.height;

  // Boundary-safe positioning
  const cardTop = isFallback
    ? (SCREEN_HEIGHT - cardHeight) / 2
    : Math.min(Math.max(36, rect.y), SCREEN_HEIGHT - cardHeight - 30);
  const cardLeft = isFallback
    ? (SCREEN_WIDTH - cardWidth) / 2
    : Math.min(Math.max(14, rect.x), SCREEN_WIDTH - cardWidth - 14);

  const isLeftColumn = cardLeft < 100;

  // Exact coordinates cascading around the card's shoulder
  const openLinkLeft = isLeftColumn
    ? cardLeft + 22
    : cardLeft + cardWidth - 66;
  const openLinkTop = cardTop - 26;

  const pinLeft = isLeftColumn
    ? cardLeft + 66
    : cardLeft + cardWidth - 110;
  const pinTop = cardTop - 18;

  const shareLeft = isLeftColumn
    ? cardLeft + 98
    : cardLeft - 32;
  const shareTop = cardTop + 24;

  const trashLeft = isLeftColumn
    ? cardLeft + 90
    : cardLeft - 24;
  const trashTop = cardTop + 72;

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
          accessibilityLabel="Tutup menu opsi simpanan"
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
          <FigmaItemCard
            item={target.item}
            onPress={() => {
              onClose();
              onOpenDetail(target.item);
            }}
          />
        </View>

        {/* Action Button 1: Open Link (ExternalLink) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.circleB1,
            {
              top: openLinkTop,
              left: openLinkLeft,
              backgroundColor: pressed ? "#F7CB54" : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
            onOpenLink(target.item);
          }}
          accessibilityLabel="Buka tautan asli"
        >
          <ExternalLink size={20} color="#000000" strokeWidth={2.4} />
        </Pressable>

        {/* Action Button 2: Pin / Unpin (Pin) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.circleB2,
            {
              top: pinTop,
              left: pinLeft,
              backgroundColor: pressed
                ? "#F7CB54"
                : target.item.isPinned
                ? "#F7CB54"
                : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onTogglePin(target.item);
            onClose();
          }}
          accessibilityLabel={target.item.isPinned ? "Lepas sematan" : "Sematkan simpanan"}
        >
          <Pin
            size={20}
            color="#000000"
            strokeWidth={2.4}
            fill={target.item.isPinned ? "#000000" : "none"}
          />
        </Pressable>

        {/* Action Button 3: Share (Share2) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.circleB3,
            {
              top: shareTop,
              left: shareLeft,
              backgroundColor: pressed ? "#F7CB54" : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
            onShare(target.item);
          }}
          accessibilityLabel="Bagikan tautan"
        >
          <Share2 size={20} color="#000000" strokeWidth={2.4} />
        </Pressable>

        {/* Action Button 4: Delete (Trash2) */}
        <Pressable
          style={({ pressed }) => [
            styles.actionCircle,
            styles.circleB4,
            {
              top: trashTop,
              left: trashLeft,
              backgroundColor: pressed ? "#FF4D6D" : "#FFFFFF",
            },
          ]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onClose();
            onDelete(target.item);
          }}
          accessibilityLabel="Hapus simpanan"
        >
          {({ pressed }) => (
            <Trash2
              size={20}
              color={pressed ? "#FFFFFF" : "#000000"}
              strokeWidth={2.4}
            />
          )}
        </Pressable>
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
  circleB1: {
    zIndex: 20,
  },
  circleB2: {
    zIndex: 21,
  },
  circleB3: {
    zIndex: 22,
  },
  circleB4: {
    zIndex: 23,
  },
});
