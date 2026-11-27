import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Pin,
  Edit3,
  Share2,
  Folder,
  RotateCcw,
  Trash2,
  ExternalLink,
  Plus,
  Calendar,
  Clock,
  Bell,
} from "lucide-react-native";
import { useSimpanInStore } from "../../src/store/useSimpanInStore";
import { SavedItem } from "../../src/types/models";
import { THEME_LIGHT, THEME_DARK } from "../../src/constants/theme";
import { NeoButton } from "../../src/components/ui/NeoButton";
import { NeoConfirmModal } from "../../src/components/ui/NeoConfirmModal";
import { LinkThumbnail } from "../../src/components/ui/LinkThumbnail";
import { PlatformLogo } from "../../src/components/ui/PlatformLogo";
import { TagBadge } from "../../src/components/ui/TagBadge";
import { MoveCollectionSheet } from "../../src/components/sheets/MoveCollectionSheet";
import { TagManagerSheet } from "../../src/components/sheets/TagManagerSheet";
import { DeadlinePickerSheet } from "../../src/components/sheets/DeadlinePickerSheet";
import {
  fetchUrlMetadata,
  resolveItemPlatform,
  formatItemDateTime,
  formatDisplayUrl,
  preserveFormattingDescription,
  stripSocialPlatformWrappers,
  extractSmartTitleAndDescription,
} from "../../src/utils/metadataParser";
import {
  detectDeadlineFromText,
  formatDeadlineFullDate,
  getDeadlineStatus,
  getReminderTimingLabel,
  calculateReminderTimestamp,
} from "../../src/utils/deadlineNumberDetector";
import {
  scheduleDeadlineNotification,
  cancelDeadlineNotification,
} from "../../src/utils/notificationManager";
import { safeBack } from "../../src/utils/navigation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LinkDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const updateLink = useSimpanInStore((state) => state.updateLink);
  const deleteLink = useSimpanInStore((state) => state.deleteLink);
  const togglePin = useSimpanInStore((state) => state.togglePin);
  const moveLink = useSimpanInStore((state) => state.moveLink);
  const addTag = useSimpanInStore((state) => state.addTag);
  const removeTag = useSimpanInStore((state) => state.removeTag);

  const [showMoveSheet, setShowMoveSheet] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadStatus, setReloadStatus] = useState<string | null>(null);

  // Inline editing state for Title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Inline editing state for Description
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");

  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  const currentItem = useMemo(() => {
    return items.find((i) => i.id === id);
  }, [items, id]);

  const deadlineStatus = useMemo(() => {
    if (!currentItem?.deadline) return null;
    return getDeadlineStatus(currentItem.deadline);
  }, [currentItem?.deadline]);

  const detectedFromContent = useMemo(() => {
    if (!currentItem || currentItem.deadline) return null;
    return detectDeadlineFromText(
      `${currentItem.title} ${currentItem.description} ${currentItem.notes} ${currentItem.url}`
    );
  }, [
    currentItem?.title,
    currentItem?.description,
    currentItem?.notes,
    currentItem?.url,
    currentItem?.deadline,
  ]);

  const handleApplyDeadline = async (
    newDeadline: number,
    newTiming: "h3" | "h1" | "h0" | "custom"
  ) => {
    if (!currentItem) return;
    if (currentItem.reminderNotificationId) {
      await cancelDeadlineNotification(currentItem.reminderNotificationId);
    }
    const reminderTime = calculateReminderTimestamp(newDeadline, newTiming);
    const notifId = await scheduleDeadlineNotification({
      itemId: currentItem.id,
      title: currentItem.title,
      deadlineTimestamp: newDeadline,
      reminderTimestamp: reminderTime,
      timing: newTiming,
    });

    updateLink(currentItem.id, {
      deadline: newDeadline,
      reminderTiming: newTiming,
      reminderNotificationId: notifId,
    });
  };

  const handleRemoveDeadline = async () => {
    if (!currentItem) return;
    if (currentItem.reminderNotificationId) {
      await cancelDeadlineNotification(currentItem.reminderNotificationId);
    }
    updateLink(currentItem.id, {
      deadline: null,
      reminderTiming: null,
      reminderNotificationId: null,
    });
  };

  const formattedDescription = useMemo(() => {
    if (!currentItem?.description) return "";
    return preserveFormattingDescription(currentItem.description);
  }, [currentItem?.description]);

  // Auto-heal dirty or collapsed descriptions & titles in the store
  React.useEffect(() => {
    if (currentItem) {
      const updates: Partial<SavedItem> = {};
      if (
        currentItem.description &&
        formattedDescription &&
        currentItem.description !== formattedDescription
      ) {
        updates.description = formattedDescription;
      }
      if (currentItem.title) {
        const stripped = stripSocialPlatformWrappers(currentItem.title);
        if (stripped.cleaned && stripped.cleaned !== currentItem.title) {
          const smart = extractSmartTitleAndDescription(
            stripped.cleaned,
            currentItem.author || stripped.author
          );
          updates.title = smart.title;
          if (stripped.author && !currentItem.author) {
            updates.author = stripped.author;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        updateLink(currentItem.id, updates);
      }
    }
  }, [
    currentItem?.id,
    currentItem?.description,
    currentItem?.title,
    formattedDescription,
    updateLink,
  ]);

  const currentCollection = useMemo(() => {
    if (!currentItem) return collections[0];
    return (
      collections.find((c) => c.id === currentItem.collectionId) || collections[0]
    );
  }, [collections, currentItem]);

  if (!currentItem) {
    return (
      <SafeAreaView
        style={[styles.container, styles.center, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.notFoundText, { color: theme.textMuted }]}>
          Simpanan tidak ditemukan.
        </Text>
        <NeoButton variant="primary" size="md" onPress={() => router.replace("/home")}>
          Kembali ke Beranda
        </NeoButton>
      </SafeAreaView>
    );
  }

  const handleOpenLink = async () => {
    Haptics.selectionAsync();
    try {
      let target = currentItem.url.trim();
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "https://" + target;
      }
      const canOpen = await Linking.canOpenURL(target);
      if (canOpen) {
        await Linking.openURL(target);
      } else {
        Alert.alert("Tidak dapat membuka tautan", target);
      }
    } catch {
      Alert.alert("Gagal membuka tautan");
    }
  };

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentItem.url, {
          dialogTitle: currentItem.title,
        });
      } else {
        await Clipboard.setStringAsync(currentItem.url);
        Alert.alert("Tautan Disalin", "Tautan telah disalin ke papan klip.");
      }
    } catch {
      await Clipboard.setStringAsync(currentItem.url);
      Alert.alert("Tautan Disalin", "Tautan telah disalin ke papan klip.");
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteLink(currentItem.id);
    safeBack(router, "/home");
  };

  const handleSaveTitle = () => {
    Haptics.selectionAsync();
    if (editedTitle.trim()) {
      updateLink(currentItem.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    Haptics.selectionAsync();
    updateLink(currentItem.id, { description: editedDesc.trim() });
    setIsEditingDesc(false);
  };

  const handleReloadMetadata = async () => {
    setShowReloadConfirm(false);
    setIsReloading(true);
    setReloadStatus(null);
    try {
      const meta = await fetchUrlMetadata(currentItem.url);
      if (meta.fetchedFromRemote) {
        updateLink(currentItem.id, {
          title: meta.title || currentItem.title,
          description: meta.description || currentItem.description,
          source: meta.platform || currentItem.source,
          ...(meta.author ? { author: meta.author } : {}),
          ...(meta.image ? { image: meta.image } : {}),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReloadStatus("Thumbnail, judul & deskripsi berhasil diperbarui dari tautan.");
      } else {
        setReloadStatus(
          meta.notice ||
            "Pratinjau otomatis tidak tersedia dari situs ini. Kamu tetap bisa edit judul/deskripsi secara manual."
        );
      }
    } catch {
      setReloadStatus("Gagal mengambil metadata tautan. Periksa koneksi internet.");
    } finally {
      setIsReloading(false);
    }
  };

  const displayUrl = formatDisplayUrl(currentItem.url);
  const formattedDateTime = formatItemDateTime(currentItem.createdAt);

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: isDark ? theme.background : "#111111" }]}>
      <ScrollView
        key={isDark ? "dark" : "light"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: isDark ? theme.surface : "#FFFFFF" },
        ]}
        bounces={false}
      >
        {/* Top Hero Banner matching Image 2 */}
        <View style={[styles.heroWrapper, { backgroundColor: isDark ? "#141414" : "#181818" }]}>
          <LinkThumbnail
            image={currentItem.image}
            tags={currentItem.tags}
            symbolSize="lg"
            style={styles.heroThumbnail}
          />

          {/* Floating Back Button (Top Left) */}
          <TouchableOpacity
            style={[
              styles.heroBackBtn,
              {
                backgroundColor: isDark ? theme.surface : "#FFFFFF",
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              safeBack(router, "/home");
            }}
            accessibilityLabel="Kembali"
          >
            <ChevronLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Floating Pin Button (Top Right) */}
          <TouchableOpacity
            style={[
              styles.heroPinBtn,
              {
                backgroundColor: currentItem.isPinned
                  ? "#F7CB54"
                  : isDark
                  ? theme.surface
                  : "#FFFFFF",
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              togglePin(currentItem.id);
            }}
            accessibilityLabel="Sematkan Tautan"
          >
            <Pin
              size={18}
              color={currentItem.isPinned ? "#000000" : isDark ? "#FFFFFF" : "#000000"}
              fill={currentItem.isPinned ? "#000000" : "none"}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Detail Sheet / Card */}
        <View
          style={[
            styles.detailSheet,
            {
              backgroundColor: isDark ? theme.surface : "#FFFFFF",
              borderColor: isDark ? "#4A4640" : "#000000",
            },
          ]}
        >
          {/* Platform Row: Icon + Source */}
          <View style={styles.platformRow}>
            <PlatformLogo platform={resolveItemPlatform(currentItem.source, currentItem.url)} size={24} />
            <Text style={[styles.platformName, { color: theme.text }]}>
              {resolveItemPlatform(currentItem.source, currentItem.url)}
            </Text>
          </View>

          {/* Big Title / Highlight Text with Edit Pencil Button */}
          <View style={styles.titleSection}>
            {isEditingTitle ? (
              <View style={styles.titleEditBox}>
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      backgroundColor: isDark ? "#1C1A17" : "#F9F7F2",
                      color: theme.text,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  autoFocus
                  multiline
                  onSubmitEditing={handleSaveTitle}
                />
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.cancelEditBtn,
                      {
                        backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={() => setIsEditingTitle(false)}
                  >
                    <Text style={[styles.cancelEditBtnText, { color: theme.text }]}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveEditBtn}
                    onPress={handleSaveTitle}
                  >
                    <Text style={styles.saveEditBtnText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.titleDisplayRow}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{currentItem.title}</Text>
                <TouchableOpacity
                  style={[
                    styles.editPencilBtn,
                    {
                      backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEditedTitle(currentItem.title);
                    setIsEditingTitle(true);
                  }}
                  accessibilityLabel="Edit Judul"
                >
                  <Edit3 size={18} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Meta Row: [Color Box] Collection Pill + Date */}
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={[
                styles.collectionPill,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => router.push(`/collection/${currentCollection.id}`)}
            >
              <View
                style={[
                  styles.collectionColorBox,
                  { backgroundColor: currentCollection.color || "#F7CB54" },
                ]}
              />
              <Text style={[styles.collectionPillText, { color: theme.text }]}>
                {currentCollection.name}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.metaDateText, { color: theme.textMuted }]}>{formattedDateTime}</Text>
          </View>

          {/* Big Yellow Button ("Buka link" + URL + Circle Arrow) */}
          <TouchableOpacity
            style={[
              styles.yellowLinkCard,
              { borderColor: isDark ? "#4A4640" : "#000000" },
            ]}
            onPress={handleOpenLink}
            activeOpacity={0.85}
          >
            <View style={styles.yellowLinkTextCol}>
              <Text style={styles.yellowLinkTitle}>Buka link</Text>
              <Text style={styles.yellowLinkSub} numberOfLines={1}>
                {displayUrl}
              </Text>
            </View>

            <View
              style={[
                styles.yellowLinkCircle,
                { backgroundColor: isDark ? "#1C1A17" : "#000000" },
              ]}
            >
              <ExternalLink size={20} color="#FFFFFF" strokeWidth={2.8} />
            </View>
          </TouchableOpacity>

          {/* 4 Action Buttons Row */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={handleShare}
              accessibilityLabel="Bagikan"
            >
              <Share2 size={18} color={theme.text} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Bagikan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => setShowMoveSheet(true)}
              accessibilityLabel="Pindahkan"
            >
              <Folder size={18} color={theme.text} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Pindahkan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              onPress={() => setShowReloadConfirm(true)}
              disabled={isReloading}
              accessibilityLabel="Muat Ulang"
            >
              {isReloading ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <RotateCcw size={18} color={theme.text} strokeWidth={2} />
              )}
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                {isReloading ? "Memuat..." : "Muat Ulang"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnDanger,
                isDark && { backgroundColor: "#331618", borderColor: "#EF4444" },
              ]}
              onPress={() => setShowDeleteConfirm(true)}
              accessibilityLabel="Hapus"
            >
              <Trash2 size={18} color="#EF4444" strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                Hapus
              </Text>
            </TouchableOpacity>
          </View>

          {reloadStatus && (
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor: isDark ? "#2E2818" : "#FFF8DF",
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBannerText,
                  { color: isDark ? "#F7CB54" : "#000000" },
                ]}
              >
                {reloadStatus}
              </Text>
            </View>
          )}

          {/* Section: PENGINGAT TENGGAT */}
          <View style={styles.detailSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                PENGINGAT TENGGAT
              </Text>
            </View>

            {currentItem.deadline && deadlineStatus ? (
              <View
                style={[
                  styles.deadlineContainer,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <View style={styles.deadlineContainerTop}>
                  <View style={styles.deadlineInfoLeft}>
                    <View
                      style={[
                        styles.deadlineStatusBadge,
                        deadlineStatus.urgency === "urgent" && styles.badgeUrgent,
                        deadlineStatus.urgency === "warning" && styles.badgeWarning,
                      ]}
                    >
                      <Clock size={11} color="#000000" strokeWidth={2.6} />
                      <Text style={styles.deadlineStatusBadgeText}>
                        {deadlineStatus.label}
                      </Text>
                    </View>
                    <Text style={[styles.deadlineDateMain, { color: theme.text }]}>
                      {formatDeadlineFullDate(currentItem.deadline)}
                    </Text>
                  </View>
                </View>

                <View style={styles.deadlineTimingRow}>
                  <Bell size={13} color={theme.textSecondary} strokeWidth={2.2} />
                  <Text style={[styles.deadlineTimingText, { color: theme.textSecondary }]}>
                    Notifikasi: {getReminderTimingLabel(currentItem.reminderTiming)}
                  </Text>
                </View>

                <View style={styles.deadlineActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.deadlineEditBtn,
                      {
                        backgroundColor: "#F7CB54",
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setShowDeadlineModal(true);
                    }}
                  >
                    <Text style={styles.deadlineEditBtnText}>Ubah Pengingat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deadlineRemoveBtn,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      handleRemoveDeadline();
                    }}
                  >
                    <Text style={styles.deadlineRemoveBtnText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : detectedFromContent ? (
              <TouchableOpacity
                style={[
                  styles.detectedDeadlineCard,
                  {
                    backgroundColor: isDark ? "#2E2818" : "#FFF8DF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleApplyDeadline(detectedFromContent.dateTimestamp, "h1");
                }}
                activeOpacity={0.85}
              >
                <View style={styles.detectedCardLeft}>
                  <Clock size={16} color={isDark ? "#F7CB54" : "#B45309"} strokeWidth={2.4} />
                  <View style={styles.detectedCardTextCol}>
                    <Text style={[styles.detectedCardTitle, { color: theme.text }]}>
                      Tenggat Terdeteksi: {detectedFromContent.formattedDate}
                    </Text>
                    <Text style={[styles.detectedCardSub, { color: theme.textSecondary }]}>
                      Ditemukan pada teks simpanan. Ketuk untuk pasang pengingat.
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.detectedCardBtn,
                    {
                      backgroundColor: "#F7CB54",
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                >
                  <Text style={styles.detectedCardBtnText}>Pasang</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addDeadlineCardEmpty,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowDeadlineModal(true);
                }}
                activeOpacity={0.8}
              >
                <Calendar size={18} color={theme.text} strokeWidth={2.2} />
                <View style={styles.addDeadlineEmptyTextCol}>
                  <Text style={[styles.addDeadlineEmptyTitle, { color: theme.text }]}>
                    Pasang Pengingat Tenggat
                  </Text>
                  <Text style={[styles.addDeadlineEmptySub, { color: theme.textSecondary }]}>
                    Cocok untuk lomba, beasiswa, tugas, atau promo.
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Section: DESKRIPSI (Formatted with line breaks & paragraphs) */}
          <View style={styles.detailSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DESKRIPSI</Text>
              {!isEditingDesc && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEditedDesc(formattedDescription || currentItem.description || "");
                    setIsEditingDesc(true);
                  }}
                  style={styles.sectionEditIconBtn}
                >
                  <Edit3 size={15} color={theme.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {isEditingDesc ? (
              <View style={styles.descEditCol}>
                <TextInput
                  style={[
                    styles.descTextInput,
                    {
                      backgroundColor: isDark ? "#1C1A17" : "#FFFFFF",
                      color: theme.text,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                  multiline
                  value={editedDesc}
                  onChangeText={setEditedDesc}
                  placeholder="Tulis deskripsi postingan..."
                  placeholderTextColor={theme.textMuted}
                />
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.cancelEditBtn,
                      {
                        backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                        borderColor: isDark ? "#4A4640" : "#000000",
                      },
                    ]}
                    onPress={() => setIsEditingDesc(false)}
                  >
                    <Text style={[styles.cancelEditBtnText, { color: theme.text }]}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveEditBtn}
                    onPress={handleSaveDesc}
                  >
                    <Text style={styles.saveEditBtnText}>Simpan Deskripsi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.descBox,
                  {
                    backgroundColor: isDark ? "#1C1A17" : "#F9F7F2",
                    borderColor: isDark ? "#3F3C38" : "#000000",
                  },
                ]}
              >
                <Text style={[styles.descText, { color: theme.text }]}>
                  {formattedDescription ||
                    "Belum ada deskripsi. Ketuk ikon pensil untuk menambahkan deskripsi postingan."}
                </Text>
              </View>
            )}
          </View>

          {/* Section: TAG */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>TAG</Text>
            <View style={styles.tagsContainer}>
              {currentItem.tags.map((tag, idx) => (
                <TagBadge
                  key={tag}
                  name={tag}
                  index={idx}
                  onRemove={() => {
                    Haptics.selectionAsync();
                    removeTag(currentItem.id, tag);
                  }}
                />
              ))}

              <TouchableOpacity
                style={[
                  styles.addTagBtn,
                  {
                    backgroundColor: isDark ? theme.cardSecondary : "#FFFFFF",
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowTagSheet(true);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Tambah tag"
              >
                <Plus size={14} color={theme.text} strokeWidth={2.8} />
                <Text style={[styles.addTagBtnText, { color: theme.text }]}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: CATATAN */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>CATATAN PRIBADI</Text>
            <TextInput
              style={[
                styles.notesTextarea,
                {
                  backgroundColor: isDark ? "#1C1A17" : "#FFFFFF",
                  color: theme.text,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="Ketuk untuk menambahkan catatan pribadi..."
              placeholderTextColor={theme.textMuted}
              value={currentItem.notes}
              onChangeText={(txt) => updateLink(currentItem.id, { notes: txt })}
            />
          </View>
        </View>
      </ScrollView>

      {/* Move Collection Sheet */}
      <MoveCollectionSheet
        visible={showMoveSheet}
        collections={collections}
        currentCollectionId={currentItem.collectionId}
        onClose={() => setShowMoveSheet(false)}
        onMove={(newColId) => {
          moveLink(currentItem.id, newColId);
          setShowMoveSheet(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />

      {/* Tag Manager Sheet */}
      <TagManagerSheet
        visible={showTagSheet}
        tags={currentItem.tags}
        onClose={() => setShowTagSheet(false)}
        onAddTag={(tag) => addTag(currentItem.id, tag)}
        onRemoveTag={(tag) => removeTag(currentItem.id, tag)}
      />

      {/* Deadline & Reminder Picker Sheet */}
      <DeadlinePickerSheet
        visible={showDeadlineModal}
        initialDeadline={currentItem.deadline}
        initialTiming={currentItem.reminderTiming}
        onClose={() => setShowDeadlineModal(false)}
        onApply={(d, t) => handleApplyDeadline(d, t)}
        onRemove={handleRemoveDeadline}
      />

      {/* Reload Metadata Modal */}
      <NeoConfirmModal
        visible={showReloadConfirm}
        title="Perbarui info link?"
        message="SimpanIn akan mengambil judul, thumbnail, dan deskripsi terbaru dari web. Catatan pribadimu tetap aman."
        confirmText="Perbarui"
        cancelText="Batal"
        onConfirm={handleReloadMetadata}
        onCancel={() => setShowReloadConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <NeoConfirmModal
        visible={showDeleteConfirm}
        title="Hapus link ini?"
        message="Link yang dihapus tidak bisa dikembalikan lagi."
        confirmText="Hapus"
        cancelText="Batal"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
    backgroundColor: "#FFFFFF",
  },
  heroWrapper: {
    width: "100%",
    height: 320,
    backgroundColor: "#181818",
    position: "relative",
  },
  heroThumbnail: {
    width: "100%",
    height: "100%",
  },
  heroBackBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 10,
  },
  heroPinBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 10,
  },
  heroPinBtnActive: {
    backgroundColor: "#F7CB54",
  },
  detailSheet: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
  titleSection: {
    marginBottom: 12,
  },
  titleDisplayRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    color: "#000000",
    letterSpacing: -0.5,
  },
  editPencilBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  titleEditBox: {
    gap: 10,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    color: "#000000",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F9F7F2",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  collectionPill: {
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  collectionColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  collectionPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  metaDateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666158",
  },
  yellowLinkCard: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  yellowLinkTextCol: {
    flex: 1,
    marginRight: 12,
  },
  yellowLinkTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 2,
  },
  yellowLinkSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2C2A24",
  },
  yellowLinkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    gap: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  actionBtnDanger: {
    backgroundColor: "#FFF5F5",
    borderColor: "#EF4444",
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000000",
  },
  statusBanner: {
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFF8DF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    color: "#000000",
  },
  detailSection: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#666158",
  },
  sectionEditIconBtn: {
    padding: 4,
  },
  descBox: {
    backgroundColor: "#F9F7F2",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 12,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#000000",
  },
  descEditCol: {
    gap: 8,
  },
  descTextInput: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    minHeight: 120,
    textAlignVertical: "top",
  },
  editActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  cancelEditBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  saveEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#F7CB54",
  },
  saveEditBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tagPill: {
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  addTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    gap: 4,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    marginBottom: 8,
  },
  addTagBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  notesTextarea: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontWeight: "500",
    minHeight: 90,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    marginTop: 4,
  },
  deadlineContainer: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  deadlineContainerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  deadlineInfoLeft: {
    flex: 1,
  },
  deadlineStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: "#E2E8F0",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeUrgent: {
    backgroundColor: "#FF6B6B",
  },
  badgeWarning: {
    backgroundColor: "#F7CB54",
  },
  deadlineStatusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
  deadlineDateMain: {
    fontSize: 15,
    fontWeight: "800",
  },
  deadlineTimingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  deadlineTimingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  deadlineEditBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  deadlineEditBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  deadlineRemoveBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deadlineRemoveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  detectedDeadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  detectedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  detectedCardTextCol: {
    flex: 1,
  },
  detectedCardTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  detectedCardSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  detectedCardBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  detectedCardBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  addDeadlineCardEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  addDeadlineEmptyTextCol: {
    flex: 1,
  },
  addDeadlineEmptyTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  addDeadlineEmptySub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
