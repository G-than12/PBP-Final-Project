import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { formatDeadlineDate } from "./deadlineNumberDetector";

// Configure how notifications should behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let unreviewedNotificationId: string | null = null;

/**
 * Request real notification permissions from the OS
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof Notification !== "undefined") {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("simpanin_reminders", {
        name: "Pengingat SimpanIn",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F7CB54",
      });
    }

    return true;
  } catch (err) {
    console.warn("Error requesting notification permission:", err);
    return false;
  }
}

/**
 * Send an immediate test notification to verify notifications work on device
 */
export async function sendImmediateTestNotification(unreviewedCount = 0): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  try {
    const bodyText =
      unreviewedCount > 0
        ? `Ada ${unreviewedCount} simpanan yang belum kamu lihat. Yuk, geser di Mode Fokus!`
        : "Pengingat SimpanIn aktif! Kami akan mengingatkanmu saat simpananmu menumpuk.";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "SimpanIn · Jangan Lupakan Simpananmu",
        body: bodyText,
        data: { url: "/focus" },
        sound: true,
      },
      trigger: null, // trigger null = fire immediately
    });

    return true;
  } catch (err) {
    console.warn("Failed to send test notification:", err);
    return false;
  }
}

/**
 * Schedule recurring unreviewed links reminder
 */
export async function scheduleUnreviewedReminder(unreviewedCount: number) {
  if (unreviewedCount <= 0) return;

  try {
    if (unreviewedNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(unreviewedNotificationId);
      unreviewedNotificationId = null;
    }

    unreviewedNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "SimpanIn · Pengingat Santai",
        body: `Ada ${unreviewedCount} link favorit yang belum sempat kamu buka. Tinjau sebentar di Mode Fokus yuk!`,
        data: { url: "/focus" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 6, // Every 6 hours or scheduled interval
        repeats: true,
      },
    });
  } catch (err) {
    console.warn("Failed to schedule reminder:", err);
  }
}

/**
 * Schedule a native local notification for an item's deadline
 */
export async function scheduleDeadlineNotification({
  itemId,
  title,
  deadlineTimestamp,
  reminderTimestamp,
  timing,
}: {
  itemId: string;
  title: string;
  deadlineTimestamp: number;
  reminderTimestamp: number;
  timing: "h3" | "h1" | "h0" | "custom";
}): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  try {
    const formattedDeadline = formatDeadlineDate(deadlineTimestamp);
    let timingNote = "";
    if (timing === "h3") timingNote = "3 hari lagi";
    else if (timing === "h1") timingNote = "besok";
    else if (timing === "h0") timingNote = "hari ini";
    else timingNote = "segera";

    const bodyText = `Tenggat simpanan "${title}" ${timingNote} (${formattedDeadline}). Buka simpanan untuk cek info lengkap.`;

    const now = Date.now();
    let triggerDate = new Date(reminderTimestamp);
    if (reminderTimestamp <= now) {
      // If trigger time has already passed, schedule 5 seconds from now so it fires for test/review
      triggerDate = new Date(now + 5000);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Pengingat Tenggat SimpanIn",
        body: bodyText,
        data: { url: `/link/${itemId}`, itemId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: "simpanin_reminders",
      },
    });

    return notificationId;
  } catch (err) {
    console.warn("Failed to schedule deadline notification:", err);
    return null;
  }
}

/**
 * Cancel an item's scheduled deadline notification
 */
export async function cancelDeadlineNotification(notificationId?: string | null) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn("Failed to cancel scheduled deadline notification:", err);
  }
}

/**
 * Cancel all scheduled notifications when turned off
 */
export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    unreviewedNotificationId = null;
  } catch (err) {
    console.warn("Failed to cancel reminders:", err);
  }
}
