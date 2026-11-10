import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useSimpanInStore } from "../store/useSimpanInStore";

export interface BackupResult {
  success: boolean;
  count: number;
  error?: string;
}

export async function exportBackup(): Promise<boolean> {
  try {
    const { collections, items, settings } = useSimpanInStore.getState();
    const backupData = {
      app: "SimpanIn",
      version: "2.0.0",
      architecture: "local-first",
      exportedAt: new Date().toISOString(),
      settings: {
        darkMode: settings.darkMode,
        homeTitle: settings.homeTitle,
        cloudSyncEnabled: settings.cloudSyncEnabled,
        autoExtractMetadata: settings.autoExtractMetadata,
      },
      collections,
      items,
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `SimpanIn_Backup_${dateStr}.json`;
    const jsonString = JSON.stringify(backupData, null, 2);

    // Browser Web Environment Download
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }

    // Native Mobile (iOS / Android)
    const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    const filePath = `${targetDir}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Ekspor Cadangan SimpanIn",
        UTI: "public.json",
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Failed to export backup:", error);
    throw error;
  }
}

export async function importBackup(): Promise<BackupResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, count: 0 };
    }

    const asset = result.assets[0];
    let content = "";

    if (Platform.OS === "web" && asset.file) {
      content = await asset.file.text();
    } else if (Platform.OS === "web" && asset.uri) {
      const response = await fetch(asset.uri);
      content = await response.text();
    } else {
      content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    const data = JSON.parse(content);
    if (!data.collections || !Array.isArray(data.collections)) {
      return { success: false, count: 0, error: "Format berkas tidak valid: Koleksi tidak ditemukan" };
    }

    useSimpanInStore.getState().importDatabase({
      collections: data.collections,
      items: data.items || [],
      settings: data.settings || {},
    });

    const itemCount = Array.isArray(data.items) ? data.items.length : 0;
    return { success: true, count: itemCount };
  } catch (err: any) {
    console.error("Failed to import backup:", err);
    return { success: false, count: 0, error: err?.message || "Gagal membaca berkas cadangan" };
  }
}

