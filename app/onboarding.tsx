import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Share2,
  Check,
  X,
  Sparkles,
  Bookmark,
  Bell,
  Utensils,
  Home,
  Plane,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import { NeoButton } from "../src/components/ui/NeoButton";
import { NeoCard } from "../src/components/ui/NeoCard";

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboarded = useSimpanInStore((state) => state.setOnboarded);
  const resetToCleanDatabase = useSimpanInStore((state) => state.resetToCleanDatabase);
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [step, setStep] = useState(0);
  const [demoStage, setDemoStage] = useState(0);
  const [focusCard, setFocusCard] = useState(0);

  const finishOnboarding = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Academic Rule: Clean state post-onboarding with ONLY "Belum Diurutkan"
    resetToCleanDatabase();
    setOnboarded(true);
    router.replace("/home");
  };

  const nextStep = () => {
    Haptics.selectionAsync();
    if (step >= 7) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    Haptics.selectionAsync();
    setStep((s) => Math.max(0, s - 1));
  };

  // STEP 3: INTERACTIVE DEMO (Instagram Reel saving simulation)
  if (step === 3) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={prevStep} style={styles.navBtn}>
            <ChevronLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.stepIndicator, { color: theme.textMuted }]}>
            Langkah 4 / 8
          </Text>
          <TouchableOpacity onPress={finishOnboarding} style={styles.navBtn}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Lewati</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Coba sekarang · simpan reel ini ke SimpanIn
          </Text>
        </View>

        {demoStage === 0 && (
          <View style={styles.mockReelCard}>
            <View style={styles.reelBadge}>
              <Text style={styles.reelBadgeNum}>15</Text>
              <Text style={styles.reelBadgeSub}>MENIT</Text>
            </View>

            <View style={styles.reelMeta}>
              <Text style={styles.reelAuthor}>@simpanin.demo</Text>
              <Text style={styles.reelTitle}>Resep makan malam kilat</Text>
              <Text style={styles.reelDesc}>
                5 sayuran, 1 wajan, 15 menit. Enak tanpa cucian menumpuk.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shareDemoBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setDemoStage(1);
              }}
            >
              <Share2 size={20} color="#000000" />
              <Text style={styles.shareDemoText}>Bagikan</Text>
              <Text style={styles.hintPulse}>👈 Ketuk Bagikan</Text>
            </TouchableOpacity>
          </View>
        )}

        {demoStage === 1 && (
          <View style={styles.fakeSheet}>
            <Text style={styles.fakeSheetTitle}>Membagikan link</Text>
            <View style={styles.shareRow}>
              <View style={styles.shareItem}>
                <View style={styles.shareIconMuted} />
                <Text style={styles.shareMutedText}>Pesan</Text>
              </View>

              <TouchableOpacity
                style={styles.highlightApp}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDemoStage(2);
                }}
              >
                <SimpanInMascot small />
                <Text style={styles.highlightAppName}>SimpanIn</Text>
                <Text style={styles.hintPulse}>↓ Ketuk SimpanIn</Text>
              </TouchableOpacity>

              <View style={styles.shareItem}>
                <View style={styles.shareIconMuted} />
                <Text style={styles.shareMutedText}>Salin link</Text>
              </View>
            </View>
          </View>
        )}

        {demoStage >= 2 && demoStage < 4 && (
          <View style={styles.fakeSheet}>
            <Text style={styles.fakeSheetTitle}>Simpan ke SimpanIn</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText}>
                https://social.example/reel/quick-dinner-recipe
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Pilih Koleksi:</Text>
            <View style={styles.demoFolderList}>
              {["Belum Diurutkan", "Resep", "Ide rumah", "Liburan"].map((col) => {
                const isTarget = col === "Resep";
                const isSelected = isTarget && demoStage >= 3;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.demoFolderRow,
                      isSelected && styles.demoFolderRowSelected,
                    ]}
                    onPress={() => {
                      if (isTarget) {
                        Haptics.selectionAsync();
                        setDemoStage(3);
                      }
                    }}
                  >
                    <View style={styles.demoFolderLeft}>
                      <Bookmark
                        size={16}
                        color={isSelected ? "#000000" : "#666158"}
                      />
                      <Text
                        style={[
                          styles.demoFolderText,
                          isSelected && styles.demoFolderTextSelected,
                        ]}
                      >
                        {col}
                      </Text>
                    </View>
                    {isTarget && demoStage === 2 && (
                      <Text style={styles.hintPulse}>👈 Pilih ini</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <NeoButton
              variant={demoStage === 3 ? "yellow" : "secondary"}
              size="lg"
              disabled={demoStage !== 3}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setDemoStage(4);
              }}
            >
              {`Simpan ke "Resep" ${demoStage === 3 ? "✓" : ""}`}
            </NeoButton>
          </View>
        )}

        {demoStage >= 4 && (
          <View style={styles.demoSuccessContainer}>
            <View style={styles.successCircle}>
              <Check size={36} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Tersimpan!</Text>
            <Text style={[styles.successSub, { color: theme.textMuted }]}>
              Link berhasil disimpan ke koleksi "Resep".
            </Text>
            <NeoButton variant="primary" size="lg" onPress={nextStep}>
              Lanjutkan →
            </NeoButton>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // STEP 5: INTERACTIVE FOCUS MODE WALKTHROUGH
  if (step === 5) {
    const focusItems = [
      {
        source: "social.example",
        collection: "Resep",
        title: "Resep makan malam kilat",
        desc: "5 sayuran, 1 wajan, 15 menit. Enak tanpa cucian menumpuk.",
        tag: "#resep",
        icon: <Utensils size={32} color="#000000" />,
      },
      {
        source: "Pinterest",
        collection: "Ide rumah",
        title: "Ide sudut baca yang nyaman",
        desc: "Lampu, kursi, dan rak. Mudah dibuat untuk ruang kecil.",
        tag: "#interior",
        icon: <Home size={32} color="#000000" />,
      },
      {
        source: "travel.example",
        collection: "Liburan",
        title: "Tips liburan ke Kyoto: datang pagi-pagi",
        desc: "Kunjungi Higashiyama jam 7 pagi sebelum ramai turis.",
        tag: "#jepang",
        icon: <Plane size={32} color="#000000" />,
      },
    ];

    if (focusCard >= 3) {
      return (
        <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
          <View style={styles.successCircle}>
            <Check size={44} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={[styles.successTitle, { color: theme.text }]}>
            Semua sudah kamu tinjau!
          </Text>
          <Text style={[styles.successSub, { color: theme.textMuted }]}>
            Mode Fokus membantumu mereview timbunan link satu per satu.
          </Text>
          <NeoButton variant="primary" size="lg" onPress={nextStep}>
            Lanjutkan →
          </NeoButton>
        </SafeAreaView>
      );
    }

    const cur = focusItems[focusCard];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.topNav}>
          <View>
            <Text style={styles.focusSubHead}>MODE FOKUS</Text>
            <Text style={[styles.focusCount, { color: theme.text }]}>
              0{focusCard + 1} / 03
            </Text>
          </View>
          <TouchableOpacity onPress={nextStep} style={styles.navBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* 3 Progress Bars */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressBar,
                i <= focusCard && styles.progressBarActive,
              ]}
            />
          ))}
        </View>

        {/* Focus Card */}
        <TouchableOpacity
          style={styles.focusCard}
          activeOpacity={0.85}
          onPress={() => {
            Haptics.selectionAsync();
            setFocusCard((c) => c + 1);
          }}
        >
          <View style={styles.focusVisual}>{cur.icon}</View>

          <View style={styles.focusMetaRow}>
            <Text style={styles.focusSource}>{cur.source}</Text>
            <Text style={styles.focusColBadge}>{cur.collection}</Text>
          </View>

          <Text style={styles.focusTitle}>{cur.title}</Text>
          <Text style={styles.focusDesc}>{cur.desc}</Text>
          <Text style={styles.focusTag}>{cur.tag}</Text>
        </TouchableOpacity>

        <View style={styles.focusFooter}>
          <Text style={styles.focusHelpText}>
            Ketuk kartu untuk beralih ke simpanan berikutnya.
          </Text>
          <NeoButton
            variant="yellow"
            size="lg"
            onPress={() => {
              Haptics.selectionAsync();
              setFocusCard((c) => c + 1);
            }}
          >
            {focusCard === 2 ? "Selesai Meninjau" : "Tinjau Berikutnya →"}
          </NeoButton>
        </View>
      </SafeAreaView>
    );
  }

  // STEP 7: READY SCREEN (100% UNLOCKED - NO PAYWALL)
  if (step === 7) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <View style={styles.readyBadge}>
          <Sparkles size={16} color="#000000" />
          <Text style={styles.readyBadgeText}>SIMPANIN SUDAH SIAP</Text>
        </View>

        <SimpanInMascot size={110} />

        <Text style={[styles.readyTitle, { color: theme.text }]}>
          Satu Tempat untuk Semua Simpananmu
        </Text>
        <Text style={[styles.readySub, { color: theme.textMuted }]}>
          Nikmati kebebasan menyimpan link, merapikan ke dalam koleksi & subkoleksi, serta membaca kembali kapan saja tanpa batas.
        </Text>

        <View style={styles.readyFeatures}>
          <View style={styles.featureItem}>
            <Check size={18} color="#10B981" strokeWidth={3} />
            <Text style={[styles.featureText, { color: theme.text }]}>Koleksi & Subkoleksi Tanpa Batas</Text>
          </View>
          <View style={styles.featureItem}>
            <Check size={18} color="#10B981" strokeWidth={3} />
            <Text style={[styles.featureText, { color: theme.text }]}>Mode Fokus Bebas Gangguan</Text>
          </View>
          <View style={styles.featureItem}>
            <Check size={18} color="#10B981" strokeWidth={3} />
            <Text style={[styles.featureText, { color: theme.text }]}>Cadangan & Ekspor Data Pribadi (JSON)</Text>
          </View>
        </View>

        <NeoButton
          variant="yellow"
          size="lg"
          onPress={finishOnboarding}
          style={styles.startBtn}
        >
          Mulai Gunakan SimpanIn Sekarang
        </NeoButton>
      </SafeAreaView>
    );
  }

  // REGULAR SLIDES (0, 1, 2, 4, 6)
  const slides = [
    {
      title: "Disimpan belum tentu dipakai.",
      sub: 'Bookmark di 7 aplikasi. Screenshot di galeri. Tab yang ditimbun untuk "nanti".',
      cta: "Ada cara yang lebih baik →",
      art: "unopened",
    },
    {
      title: "Kamu menyimpannya. Lalu hilang.",
      sub: "Konten bagus tercecer di mana-mana dan susah dicari saat dibutuhkan.",
      cta: "Itu aku banget →",
      art: "scattered",
    },
    {
      title: "Kenalkan, SimpanIn.",
      sub: "Satu tempat untuk semua yang kamu bookmark. Simpan sekali. Temukan kapan saja.",
      cta: "Tunjukkan caranya →",
      art: "meet",
    },
    {}, // Step 3: Interactive Demo
    {
      title: "Begitu saja. Sudah rapi.",
      sub: "Judul, pratinjau, dan sumber langsung tersimpan rapi ke koleksimu.",
      cta: "Lanjut ke Mode Fokus →",
      art: "preview",
    },
    {}, // Step 5: Focus Mode
    {
      title: "Jangan lupakan simpananmu!",
      sub: "Mode Fokus menampilkan simpananmu satu per satu agar tidak sekadar jadi timbunan.",
      cta: "Lanjutkan →",
      art: "notification",
    },
    {}, // Step 7: Ready
  ];

  const currentSlide = slides[step];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topNav}>
        {step > 0 ? (
          <TouchableOpacity onPress={prevStep} style={styles.navBtn}>
            <ChevronLeft size={22} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
        <Text style={[styles.stepIndicator, { color: theme.textMuted }]}>
          {step + 1} / 8
        </Text>
        <TouchableOpacity onPress={finishOnboarding} style={styles.navBtn}>
          <Text style={[styles.skipText, { color: theme.textMuted }]}>Lewati</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.copyContainer}>
          <Text style={[styles.slideTitle, { color: theme.text }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.slideSub, { color: theme.textMuted }]}>
            {currentSlide.sub}
          </Text>
        </View>

        {/* Visual Arts */}
        <View style={styles.artContainer}>
          {currentSlide.art === "meet" && (
            <View style={styles.meetArt}>
              <SimpanInMascot size={120} />
              <NeoCard color="#FFFFFF" style={styles.meetCard}>
                <Text style={styles.meetCardSub}>Sudah ketemu!</Text>
                <Text style={styles.meetCardTitle}>Resep makan malam kilat</Text>
                <View style={styles.meetCheckRow}>
                  <Check size={14} color="#10B981" strokeWidth={3} />
                  <Text style={styles.meetCheckText}>Rapi di SimpanIn</Text>
                </View>
              </NeoCard>
            </View>
          )}

          {currentSlide.art === "scattered" && (
            <View style={styles.scatteredArt}>
              <View style={[styles.appBadge, { top: 10, left: 16 }]}>
                <Text style={styles.appBadgeText}>Instagram</Text>
              </View>
              <View style={[styles.appBadge, { top: 20, right: 16 }]}>
                <Text style={styles.appBadgeText}>TikTok</Text>
              </View>
              <View style={[styles.appBadge, { top: 90, left: 24 }]}>
                <Text style={styles.appBadgeText}>Chrome Tabs</Text>
              </View>
              <View style={[styles.appBadge, { top: 100, right: 24 }]}>
                <Text style={styles.appBadgeText}>X / Twitter</Text>
              </View>
              <NeoCard color="#FFFFFF" style={styles.lostCard}>
                <Text style={styles.lostCardLabel}>KONTEN TERCECER</Text>
                <Text style={styles.lostCardText}>Di mana ya tadi saya simpan?</Text>
              </NeoCard>
            </View>
          )}

          {currentSlide.art === "unopened" && (
            <View style={styles.unopenedArt}>
              <NeoCard color="#FFFFFF" style={styles.unopenedCard}>
                <View style={styles.unopenedLabel}>
                  <Text style={styles.unopenedLabelText}>BELUM DIBUKA</Text>
                </View>
                <Text style={styles.unopenedTime}>Disimpan 42 hari lalu</Text>
                <Text style={styles.unopenedTitle}>Resep makan malam kilat</Text>
              </NeoCard>
              <SimpanInMascot size={70} />
            </View>
          )}

          {currentSlide.art === "preview" && (
            <View style={styles.previewArt}>
              <NeoCard color="#FFFFFF" style={styles.previewBox}>
                <View style={styles.previewIconBox}>
                  <Utensils size={22} color="#000000" />
                </View>
                <Text style={styles.previewSource}>social.example</Text>
                <Text style={styles.previewTitle}>Resep makan malam kilat</Text>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>Koleksi: Resep</Text>
                </View>
              </NeoCard>
              <SimpanInMascot size={64} />
            </View>
          )}

          {currentSlide.art === "notification" && (
            <View style={styles.notifArt}>
              <Text style={styles.lockTime}>09:41</Text>
              <NeoCard color="#FFFFFF" style={styles.notifBox}>
                <SimpanInMascot small />
                <View style={styles.notifTextContainer}>
                  <Text style={styles.notifHeader}>SimpanIn · Pengingat</Text>
                  <Text style={styles.notifBody}>
                    Ada simpanan yang belum kamu lihat. Buka SimpanIn untuk meninjau!
                  </Text>
                </View>
              </NeoCard>
            </View>
          )}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomArea}>
          <NeoButton variant="primary" size="lg" onPress={nextStep}>
            {currentSlide.cta}
          </NeoButton>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navBtn: {
    minWidth: 44,
    height: 44,
    justifyContent: "center",
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: "800",
  },
  skipText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
  slideScroll: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  copyContainer: {
    marginTop: 12,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  slideSub: {
    fontSize: 15,
    lineHeight: 22,
  },
  artContainer: {
    flex: 1,
    minHeight: 260,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  bottomArea: {
    marginTop: "auto",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D6CFC4",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#000000",
  },
  // ART STYLES
  meetArt: {
    alignItems: "center",
    gap: 16,
  },
  meetCard: {
    padding: 14,
    alignItems: "center",
    borderRadius: 14,
  },
  meetCardSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666158",
  },
  meetCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    marginTop: 2,
  },
  meetCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  meetCheckText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#10B981",
  },
  scatteredArt: {
    width: "100%",
    height: 220,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  appBadge: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
  },
  appBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  lostCard: {
    padding: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  lostCardLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: 1,
  },
  lostCardText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
    marginTop: 4,
  },
  unopenedArt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  unopenedCard: {
    padding: 14,
    borderRadius: 14,
  },
  unopenedLabel: {
    backgroundColor: "#FEE2E2",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  unopenedLabelText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#EF4444",
  },
  unopenedTime: {
    fontSize: 11,
    color: "#8A8478",
    marginTop: 4,
  },
  unopenedTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    marginTop: 2,
  },
  previewArt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  previewBox: {
    padding: 14,
    borderRadius: 14,
  },
  previewIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  previewSource: {
    fontSize: 11,
    color: "#666158",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    marginTop: 2,
  },
  previewBadge: {
    backgroundColor: "#F5F0E8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#000000",
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
  },
  notifArt: {
    alignItems: "center",
    width: "100%",
  },
  lockTime: {
    fontSize: 36,
    fontWeight: "900",
    color: "#8A8478",
    marginBottom: 12,
  },
  notifBox: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    width: "92%",
    alignItems: "center",
  },
  notifTextContainer: {
    flex: 1,
  },
  notifHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  notifBody: {
    fontSize: 12,
    color: "#666158",
    lineHeight: 16,
    marginTop: 2,
  },
  // DEMO STYLES
  demoBanner: {
    backgroundColor: "#F7CB54",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#000000",
  },
  demoBannerText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  mockReelCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 2.5,
    borderColor: "#000000",
  },
  reelBadge: {
    backgroundColor: "#F7CB54",
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  reelBadgeNum: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
  },
  reelBadgeSub: {
    fontSize: 9,
    fontWeight: "800",
    color: "#000000",
  },
  reelMeta: {
    marginBottom: 20,
  },
  reelAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666158",
  },
  reelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
    marginVertical: 4,
  },
  reelDesc: {
    fontSize: 13,
    color: "#666158",
    lineHeight: 18,
  },
  shareDemoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F0E8",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    gap: 8,
  },
  shareDemoText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  hintPulse: {
    fontSize: 12,
    fontWeight: "800",
    color: "#E1306C",
    marginLeft: "auto",
  },
  fakeSheet: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2.5,
    borderColor: "#000000",
  },
  fakeSheetTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 16,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  shareItem: {
    alignItems: "center",
    gap: 6,
  },
  shareIconMuted: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E4DCCF",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  shareMutedText: {
    fontSize: 11,
    color: "#666158",
  },
  highlightApp: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFE39A",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#000000",
    gap: 4,
  },
  highlightAppName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  urlBox: {
    backgroundColor: "#F5F0E8",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginBottom: 12,
  },
  urlText: {
    fontSize: 12,
    color: "#666158",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
  },
  demoFolderList: {
    gap: 6,
    marginBottom: 16,
  },
  demoFolderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F5F0E8",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  demoFolderRowSelected: {
    backgroundColor: "#F7CB54",
  },
  demoFolderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demoFolderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  demoFolderTextSelected: {
    fontWeight: "900",
  },
  demoSuccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    borderWidth: 2.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  // FOCUS STYLES
  focusSubHead: {
    fontSize: 10,
    fontWeight: "900",
    color: "#8A8478",
    letterSpacing: 1,
  },
  focusCount: {
    fontSize: 16,
    fontWeight: "900",
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D6CFC4",
    borderWidth: 1,
    borderColor: "#000000",
  },
  progressBarActive: {
    backgroundColor: "#000000",
  },
  focusCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 2.5,
    borderColor: "#000000",
  },
  focusVisual: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  focusMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  focusSource: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666158",
  },
  focusColBadge: {
    backgroundColor: "#F5F0E8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  focusTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    lineHeight: 26,
    marginBottom: 8,
  },
  focusDesc: {
    fontSize: 14,
    color: "#666158",
    lineHeight: 20,
    marginBottom: 14,
  },
  focusTag: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E1306C",
  },
  focusFooter: {
    marginTop: "auto",
    padding: 20,
    gap: 12,
  },
  focusHelpText: {
    fontSize: 12,
    color: "#666158",
    textAlign: "center",
  },
  // READY SCREEN STYLES
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7CB54",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
    gap: 6,
    marginBottom: 20,
  },
  readyBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  readySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  readyFeatures: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#000000",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "800",
  },
  startBtn: {
    width: "100%",
  },
});
