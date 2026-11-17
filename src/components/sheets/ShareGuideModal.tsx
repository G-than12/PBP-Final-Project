import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { Share2, Clipboard, Plus } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";

interface ShareGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ShareGuideModal({ visible, onClose }: ShareGuideModalProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const methods = [
    {
      id: "share",
      color: "#F7CB54",
      icon: <Share2 size={20} color="#000000" strokeWidth={2.4} />,
      title: "Bagikan dari Aplikasi Lain",
      desc: "Gunakan menu Bagikan (Share) di browser atau media sosial, lalu pilih SimpanIn. Tautan akan tersimpan otomatis.",
    },
    {
      id: "clipboard",
      color: "#A6E3D1",
      icon: <Clipboard size={20} color="#000000" strokeWidth={2.4} />,
      title: "Salin & Buka Aplikasi",
      desc: "Salin tautan dari mana saja. Saat SimpanIn dibuka, konfirmasi simpan akan langsung muncul di beranda.",
    },
    {
      id: "manual",
      color: "#8FC9FF",
      icon: <Plus size={20} color="#000000" strokeWidth={2.6} />,
      title: "Tambah Manual",
      desc: "Tekan tombol + di pojok kanan bawah kapan saja untuk menempel tautan dan memilih folder simpanan.",
    },
  ];

  return (
    <NeoBottomSheet visible={visible} title="Cara Simpan" onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Ada tiga cara untuk menyimpan tautan ke SimpanIn:
        </Text>

        <View style={styles.list}>
          {methods.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: isDark ? "#4A4640" : "#000000",
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: item.color,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                {item.icon}
              </View>
              <View style={styles.textCol}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <NeoButton
          variant="primary"
          size="lg"
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
          }}
          style={styles.closeBtn}
        >
          Tutup
        </NeoButton>
      </ScrollView>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  list: {
    gap: 10,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: 4,
  },
});
