import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Share2, Smartphone, FolderCheck, Eye } from "lucide-react-native";
import { THEME_LIGHT, THEME_DARK } from "../../constants/theme";
import { useSimpanInStore } from "../../store/useSimpanInStore";
import { NeoBottomSheet } from "../ui/NeoBottomSheet";
import { NeoButton } from "../ui/NeoButton";
import { NeoCard } from "../ui/NeoCard";
import { SimpanInMascot } from "../ui/SimpanInMascot";

interface ShareGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ShareGuideModal({ visible, onClose }: ShareGuideModalProps) {
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const steps = [
    {
      num: "01",
      icon: <Share2 size={20} color="#000000" />,
      title: "Ketuk Tombol Bagikan (Share)",
      desc: "Saat menemukan artikel, reel, atau video di Instagram, TikTok, X, atau browser, ketuk tombol Bagikan.",
    },
    {
      num: "02",
      icon: <SimpanInMascot small />,
      title: "Pilih Aplikasi SimpanIn",
      desc: "Cari dan pilih ikon SimpanIn pada lembar bagikan sistem ponsel Anda.",
    },
    {
      num: "03",
      icon: <FolderCheck size={20} color="#000000" />,
      title: "Pilih Koleksi & Beri Tagar",
      desc: "Pilih koleksi tujuan (misal: Resep, Desain), sematkan jika penting, atau buat koleksi baru secara instan.",
    },
    {
      num: "04",
      icon: <Eye size={20} color="#000000" />,
      title: "Buka & Tinjau di Mode Fokus",
      desc: "Buka SimpanIn kapan saja untuk membaca kembali simpanan Anda tanpa gangguan iklan dan distraksi.",
    },
  ];

  return (
    <NeoBottomSheet visible={visible} title="Panduan Menyimpan Tautan" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={[styles.introText, { color: theme.textMuted }]}>
          Simpan konten favorit Anda dari aplikasi mana pun hanya dalam 4 langkah mudah:
        </Text>

        {steps.map((st) => (
          <NeoCard key={st.num} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconBox}>{st.icon}</View>
              <Text style={styles.stepNumber}>LANGKAH {st.num}</Text>
            </View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{st.title}</Text>
            <Text style={[styles.stepDesc, { color: theme.textMuted }]}>{st.desc}</Text>
          </NeoCard>
        ))}

        <NeoButton variant="primary" size="lg" onPress={onClose} style={styles.closeBtn}>
          Saya Mengerti
        </NeoButton>
      </ScrollView>
    </NeoBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 460,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepCard: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: "#E1306C",
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    marginVertical: 14,
  },
});

