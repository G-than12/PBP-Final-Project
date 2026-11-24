import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
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
  MessageSquare,
  Copy,
  MoreHorizontal,
  Folder,
  ShieldCheck,
  Lightbulb,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK, NEO_SHADOW, NEO_SHADOW_SM, NEO_SHADOW_LG } from "../src/constants/theme";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import { NeoButton } from "../src/components/ui/NeoButton";
import {
  requestNotificationPermission,
  sendImmediateTestNotification,
} from "../src/utils/notificationManager";

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboarded = useSimpanInStore((state) => state.setOnboarded);
  const resetToCleanDatabase = useSimpanInStore((state) => state.resetToCleanDatabase);
  const setNotificationsEnabled = useSimpanInStore((state) => state.setNotificationsEnabled);
  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const [step, setStep] = useState(0);
  const [demoStage, setDemoStage] = useState(0);
  const [pinToggle, setPinToggle] = useState(false);
  const [focusCard, setFocusCard] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const finishOnboarding = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetToCleanDatabase();
    setOnboarded(true);
    router.replace("/home");
  };

  const nextStep = () => {
    Haptics.selectionAsync();
    setStep((s) => Math.min(7, s + 1));
  };

  const prevStep = () => {
    Haptics.selectionAsync();
    setStep((s) => Math.max(0, s - 1));
  };

  const skipToFinal = () => {
    Haptics.selectionAsync();
    setStep(7);
  };

  // ==========================================
  // STEP 3: INTERACTIVE DEMO (Instagram Reel)
  // ==========================================
  if (step === 3) {
    const demoData = [
      ["Resep makan malam kilat", "5 sayuran, 1 wajan, 15 menit. Enak tanpa cucian menumpuk."],
      ["Ide sudut baca yang nyaman", "Lampu, kursi, dan rak. Mudah dibuat."],
      ["Tips liburan ke Kyoto: datang pagi-pagi", "Kunjungi Higashiyama jam 7 pagi."],
    ];

    if (demoStage >= 4) {
      return (
        <SafeAreaView style={[styles.container, styles.demoBg]}>
          <View style={styles.demoSuccessContainer}>
            <View style={styles.successCircle}>
              <Check size={42} color="#FFFFFF" strokeWidth={3.5} />
            </View>
            <Text style={styles.demoSuccessTitle}>Tersimpan!</Text>
            <Text style={styles.demoSuccessSub}>Link tersimpan</Text>
            <NeoButton
              variant="yellow"
              size="lg"
              style={styles.demoSuccessBtn}
              onPress={nextStep}
            >
              Lanjutkan →
            </NeoButton>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, styles.demoBg]}>
        {/* Top Header Dark */}
        <View style={styles.onboardTop}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.plainBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step + 1} / 8</Text>
          </View>
          <TouchableOpacity onPress={skipToFinal}>
            <Text style={[styles.textBtn, { color: "#FFFFFF" }]}>Lewati</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Try Banner */}
        <View style={styles.tryBanner}>
          <Text style={styles.tryBannerText}>
            Coba sekarang · simpan reel ini ke SimpanIn
          </Text>
        </View>

        {/* Simulated Reel Card */}
        {demoStage === 0 && (
          <View style={styles.reel}>
            <View style={styles.reelArt}>
              <Text style={styles.reelArtNum}>15</Text>
              <Text style={styles.reelArtSub}>MENIT</Text>
            </View>

            <View style={styles.reelCopy}>
              <Text style={styles.reelAuthor}>@simpanin.demo</Text>
              <Text style={styles.reelTitle}>{demoData[0][0]}</Text>
              <Text style={styles.reelDesc}>{demoData[0][1]}</Text>
            </View>

            <TouchableOpacity
              style={styles.shareDemoBtn}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                setDemoStage(1);
              }}
            >
              <View style={styles.shareTooltip}>
                <Text style={styles.shareTooltipText}>Ketuk Bagikan</Text>
              </View>
              <Share2 size={24} color="#000000" />
              <Text style={styles.shareDemoText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fake Sheet: Share Dialog */}
        {demoStage === 1 && (
          <View style={styles.fakeSheet}>
            <Text style={styles.fakeSheetTitle}>Membagikan link</Text>
            <View style={styles.shareGrid}>
              <View style={styles.shareCol}>
                <View style={styles.shareIconCircle}>
                  <MessageSquare size={20} color="#666158" />
                </View>
                <Text style={styles.shareColText}>Pesan</Text>
              </View>

              <TouchableOpacity
                style={styles.highlightAppBtn}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDemoStage(2);
                }}
              >
                <View style={styles.highlightTooltip}>
                  <Text style={styles.highlightTooltipText}>↓ Ketuk SimpanIn</Text>
                </View>
                <SimpanInMascot small size={34} />
                <Text style={styles.highlightAppName}>SimpanIn</Text>
              </TouchableOpacity>

              <View style={styles.shareCol}>
                <View style={styles.shareIconCircle}>
                  <Copy size={20} color="#666158" />
                </View>
                <Text style={styles.shareColText}>Salin link</Text>
              </View>

              <View style={styles.shareCol}>
                <View style={styles.shareIconCircle}>
                  <MoreHorizontal size={20} color="#666158" />
                </View>
                <Text style={styles.shareColText}>Lainnya</Text>
              </View>
            </View>
          </View>
        )}

        {/* Fake Sheet: Save to SimpanIn */}
        {demoStage >= 2 && (
          <View style={[styles.fakeSheet, styles.saveDemoSheet]}>
            <Text style={styles.fakeSheetTitle}>Simpan ke SimpanIn</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlBoxText} numberOfLines={1}>
                https://social.example/reel/quick-dinner-recipe
              </Text>
            </View>

            <TouchableOpacity
              style={styles.toggleLine}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                setPinToggle(!pinToggle);
              }}
            >
              <Text style={styles.toggleLabel}>Sematkan link ini</Text>
              <View style={[styles.toggleTrack, pinToggle && styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, pinToggle && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <View style={styles.folderList}>
              {["Belum Diurutkan", "Resep", "Ide rumah", "Liburan"].map((folderName) => {
                const isResep = folderName === "Resep";
                const isSelected = isResep && demoStage >= 2;
                return (
                  <TouchableOpacity
                    key={folderName}
                    style={[
                      styles.folderRow,
                      isSelected && styles.folderRowSelected,
                    ]}
                    onPress={() => {
                      if (isResep) {
                        Haptics.selectionAsync();
                        setDemoStage(3);
                      }
                    }}
                  >
                    <View style={styles.folderRowLeft}>
                      <Folder
                        size={18}
                        color={isSelected ? "#000000" : "#666158"}
                        strokeWidth={2.4}
                      />
                      <Text
                        style={[
                          styles.folderRowName,
                          isSelected && styles.folderRowNameSelected,
                        ]}
                      >
                        {folderName}
                      </Text>
                    </View>
                    {isResep && demoStage === 2 && (
                      <View style={styles.folderHintBadge}>
                        <Text style={styles.folderHintText}>← Pilih ini</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.saveBtnWrapper}>
              {demoStage === 3 && (
                <View style={styles.saveHintTooltip}>
                  <Text style={styles.saveHintText}>↓ Sekarang ketuk Simpan</Text>
                </View>
              )}
              <NeoButton
                variant={demoStage === 3 ? "yellow" : "secondary"}
                size="lg"
                disabled={demoStage !== 3}
                onPress={() => {
                  if (demoStage === 3) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setDemoStage(4);
                  }
                }}
              >
                Simpan ke "Resep"
              </NeoButton>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 5: INTERACTIVE FOCUS MODE WALKTHROUGH
  // ==========================================
  if (step === 5) {
    const focusItems = [
      {
        source: "social.example",
        collection: "Resep",
        title: "Resep makan malam kilat",
        desc: "5 sayuran, 1 wajan, 15 menit. Enak tanpa cucian menumpuk.",
        themeColor: "#EF7E45",
        symbol: "15",
        subSymbol: "MENIT",
        tag: null,
      },
      {
        source: "Pinterest",
        collection: "Ide rumah",
        title: "Ide sudut baca yang nyaman",
        desc: "Lampu, kursi, dan rak. Mudah dibuat.",
        themeColor: "#88B89E",
        symbol: "⌂",
        subSymbol: "HOME",
        tag: "# interior",
      },
      {
        source: "travel.example",
        collection: "Liburan",
        title: "Tips liburan ke Kyoto: datang pagi-pagi",
        desc: "Kunjungi Higashiyama jam 7 pagi sebelum ramai pengunjung.",
        themeColor: "#7EA8E8",
        symbol: "京都",
        subSymbol: "TRAVEL",
        tag: "# jepang",
      },
    ];

    if (focusCard >= 3) {
      return (
        <SafeAreaView style={[styles.container, styles.focusScreen, styles.focusCompleteCenter]}>
          <View style={styles.successCircle}>
            <Check size={44} color="#FFFFFF" strokeWidth={3.5} />
          </View>
          <Text style={styles.completeTitle}>Semua Simpanan Selesai Ditinjau!</Text>
          <Text style={styles.completeSub}>Kerja bagus. Daftar bacaanmu kini lebih rapi.</Text>
          <NeoButton
            variant="yellow"
            size="lg"
            style={{ width: "100%", maxWidth: 300, marginTop: 24 }}
            onPress={nextStep}
          >
            Lanjutkan →
          </NeoButton>
        </SafeAreaView>
      );
    }

    const item = focusItems[focusCard];

    return (
      <SafeAreaView style={[styles.container, styles.focusScreen]}>
        <View style={styles.focusHead}>
          <View style={styles.focusHeadLeft}>
            <Text style={styles.focusHeadSmall}>SIMPANAN BARU</Text>
            <Text style={styles.focusHeadCount}>0{focusCard + 1} / 03</Text>
          </View>
          <TouchableOpacity
            style={styles.focusCloseBtn}
            onPress={() => setStep(6)}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3 Progress Bars */}
        <View style={styles.progressBars}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressBarSeg,
                i <= focusCard && styles.progressBarSegDone,
              ]}
            />
          ))}
        </View>

        {/* Neobrutalist Rotated Focus Card */}
        <TouchableOpacity
          style={styles.focusCard}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.selectionAsync();
            setFocusCard((c) => c + 1);
          }}
        >
          <View style={[styles.focusVisualBox, { backgroundColor: item.themeColor }]}>
            <Text style={styles.focusVisualSymbol}>{item.symbol}</Text>
            {item.subSymbol && (
              <Text style={styles.focusVisualSubSymbol}>{item.subSymbol}</Text>
            )}
          </View>

          <View style={styles.focusMetaRow}>
            <Text style={styles.focusSourceText}>{item.source}</Text>
            <View style={styles.focusCollectionBadge}>
              <Text style={styles.focusCollectionText}>{item.collection}</Text>
            </View>
          </View>

          <Text style={styles.focusCardTitle}>{item.title}</Text>
          <Text style={styles.focusCardDesc}>{item.desc}</Text>

          {item.tag && (
            <View style={styles.focusTagBadge}>
              <Text style={styles.focusTagText}>{item.tag}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.focusHelpArea}>
          <Text style={styles.focusHelpDesc}>
            Mode Fokus membantumu meninjau simpanan satu per satu. Buka yang prioritas, arsipkan sisanya.
          </Text>
          <Text style={styles.focusHelpAction}>
            {focusCard === 2
              ? "← Ketuk kartu untuk selesai"
              : "Ketuk kartu untuk beralih ke simpanan berikutnya →"}
          </Text>
          <NeoButton
            variant="yellow"
            size="md"
            style={{ marginTop: 14 }}
            onPress={() => {
              Haptics.selectionAsync();
              setFocusCard((c) => c + 1);
            }}
          >
            {focusCard === 2 ? "Selesai Meninjau" : "Lanjut Kartu Berikutnya"}
          </NeoButton>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 7: READY SCREEN
  // ==========================================
  if (step === 7) {
    const coreValues = [
      {
        icon: <Share2 size={20} color="#000000" strokeWidth={2.4} />,
        bg: "#F7CB54",
        title: "Simpan Cepat lewat Menu Bagikan",
        desc: "Bagikan link langsung dari browser atau media sosial favoritmu ke SimpanIn dalam satu ketukan.",
      },
      {
        icon: <Folder size={20} color="#000000" strokeWidth={2.4} />,
        bg: "#A6E3D1",
        title: "Koleksi Rapi & Terstruktur",
        desc: "Kelompokkan simpanan berdasarkan topik agar selalu mudah kamu temukan saat dibutuhkan.",
      },
      {
        icon: <Sparkles size={20} color="#000000" strokeWidth={2.4} />,
        bg: "#FFD180",
        title: "Mode Fokus & Tinjauan Santai",
        desc: "Tinjau link satu per satu agar konten dan inspirasi penting tidak sekadar menumpuk.",
      },
      {
        icon: <ShieldCheck size={20} color="#000000" strokeWidth={2.4} />,
        bg: "#B5D5F5",
        title: "Privat & Sepenuhnya Milikmu",
        desc: "Data tersimpan langsung di ponselmu tanpa akun, tanpa pelacak, dan bebas kamu cadangkan.",
      },
    ];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.onboardTop}>
          <TouchableOpacity onPress={prevStep} style={styles.plainBtn}>
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>8 / 8</Text>
          </View>
          <View style={styles.plainBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.readyScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.readyCenter}>
            <SimpanInMascot size={84} />
            <Text style={styles.readyTitle}>Semua Siap, Waktunya Rapi!</Text>
            <Text style={styles.readySub}>
              Satu tempat terpusat untuk semua link, artikel, dan inspirasi pentingmu. Selamat tinggal tumpukan tab dan screenshot.
            </Text>

            {/* Core Values Card */}
            <View style={styles.readyCardBox}>
              {coreValues.map((item, idx) => (
                <View
                  key={item.title}
                  style={[
                    styles.readyRowItem,
                    idx < coreValues.length - 1 && styles.readyRowBorder,
                  ]}
                >
                  <View style={[styles.readyIconBadge, { backgroundColor: item.bg }]}>
                    {item.icon}
                  </View>
                  <View style={styles.readyTextCol}>
                    <Text style={styles.readyItemTitle}>{item.title}</Text>
                    <Text style={styles.readyItemDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Quick Practical Tip */}
            <View style={styles.quickTipCard}>
              <View style={styles.quickTipHeader}>
                <Lightbulb size={16} color="#000000" strokeWidth={2.5} />
                <Text style={styles.quickTipBadgeText}>TIPS AWAL</Text>
              </View>
              <Text style={styles.quickTipBody}>
                Coba buka link artikel atau video yang sedang kamu nikmati, lalu pilih Bagikan (Share) langsung ke SimpanIn.
              </Text>
            </View>

            {/* Action Section */}
            <View style={styles.readyActionSection}>
              <NeoButton
                variant="yellow"
                size="lg"
                style={styles.startAppBtn}
                onPress={() => {
                  setIsProcessing(true);
                  setTimeout(() => {
                    finishOnboarding();
                  }, 300);
                }}
              >
                {isProcessing ? "Menyiapkan SimpanIn..." : "Mulai Gunakan SimpanIn →"}
              </NeoButton>

              <Text style={styles.readyFootnote}>
                Gratis · Tanpa Perlu Akun · Tersimpan di Perangkatmu
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // REGULAR SLIDES (0, 1, 2, 4, 6)
  // ==========================================
  const slides = [
    {
      title: "Disimpan, tapi jarang dibuka?",
      sub: 'Bookmark tersebar di berbagai aplikasi. Screenshot menumpuk di galeri. Tab browser disimpan untuk "nanti".',
      cta: "Ada cara yang lebih rapi →",
      art: "unopened",
    },
    {
      title: "Tersimpan di mana-mana,",
      highlight: "Lalu terlupakan.",
      sub: "Saat benar-benar butuh referensinya, mencarinya kembali butuh waktu lama.",
      cta: "Sering mengalaminya →",
      art: "scattered",
    },
    {
      title: "Kenalkan, SimpanIn.",
      sub: "Satu tempat terpusat untuk semua yang kamu simpan. Simpan sekali, temukan kapan saja.",
      cta: "Lihat cara kerjanya →",
      art: "meet",
    },
    {}, // Step 3
    {
      title: "Semudah itu. Langsung tersimpan.",
      sub: "Judul, cuplikan, dan sumber link langsung terisi otomatis ke folder pilihanmu.",
      cta: "Lanjut ke fitur berikutnya →",
      art: "preview",
    },
    {}, // Step 5
    {
      title: "Ingin diingatkan secara berkala?",
      sub: "Dapatkan pengingat santai agar artikel dan inspirasi pentingmu tidak berakhir menumpuk.",
      cta: "Nyalakan Pengingat",
      art: "notification",
    },
    {}, // Step 7
  ];

  const slide = slides[step];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.onboardTop}>
        {step > 0 ? (
          <TouchableOpacity onPress={prevStep} style={styles.plainBtn}>
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.plainBtn} />
        )}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{step + 1} / 8</Text>
        </View>
        <TouchableOpacity onPress={skipToFinal}>
          <Text style={styles.textBtn}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Copy / Headings */}
      <View style={styles.onboardCopy}>
        {step === 1 ? (
          <View style={styles.titleWithHighlightRow}>
            <Text style={styles.headlineTitle}>Kamu menyimpannya. </Text>
            <View style={styles.highlightPill}>
              <Text style={styles.highlightPillText}>Lalu hilang.</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.headlineTitle}>{slide.title}</Text>
        )}
        <Text style={styles.headlineSub}>{slide.sub}</Text>
      </View>

      {/* Slide Art Section */}
      <View style={styles.artSection}>
        {/* SLIDE 0: Unopened Art */}
        {slide.art === "unopened" && (
          <View style={styles.unopenedArtWrapper}>
            <View style={styles.saveCard}>
              <View style={styles.unopenedBadge}>
                <Text style={styles.unopenedBadgeText}>BELUM DIBUKA</Text>
              </View>
              <View style={styles.miniFood}>
                <Text style={styles.miniFoodNumber}>15'</Text>
              </View>
              <Text style={styles.saveCardTimestamp}>Disimpan 42 hari lalu</Text>
              <Text style={styles.saveCardTitle}>Resep makan malam kilat</Text>
            </View>
            <View style={styles.unopenedMascotPos}>
              <SimpanInMascot size={74} />
            </View>
          </View>
        )}

        {/* SLIDE 1: Scattered Badges Art */}
        {slide.art === "scattered" && (
          <View style={styles.scatteredWrapper}>
            <View style={[styles.floatPill, styles.f1]}>
              <Text style={styles.floatPillText}>Instagram</Text>
            </View>
            <View style={[styles.floatPill, styles.f2]}>
              <Text style={styles.floatPillText}>TikTok</Text>
            </View>
            <View style={[styles.floatPill, styles.f3]}>
              <Text style={styles.floatPillText}>X</Text>
            </View>
            <View style={[styles.floatPill, styles.f4]}>
              <Text style={styles.floatPillText}>Chrome</Text>
            </View>
            <View style={[styles.floatPill, styles.f5]}>
              <Text style={styles.floatPillText}>Threads</Text>
            </View>

            <View style={[styles.saveCard, styles.saveCardScattered]}>
              <Text style={styles.saveCardCategoryLabel}>INSTAGRAM REEL</Text>
              <Text style={styles.saveCardTitle}>Resep makan malam kilat</Text>
              <View style={[styles.miniFood, { height: 95 }]}>
                <Text style={[styles.miniFoodNumber, { fontSize: 34 }]}>15'</Text>
              </View>
            </View>
          </View>
        )}

        {/* SLIDE 2: Meet Mascot Art */}
        {slide.art === "meet" && (
          <View style={styles.meetWrapper}>
            <View style={styles.meetMascotPos}>
              <SimpanInMascot size={120} />
            </View>
            <View style={styles.foundCard}>
              <Text style={styles.foundCardCategory}>Sudah ketemu</Text>
              <Text style={styles.foundCardTitle}>Resep makan malam kilat</Text>
              <View style={styles.foundCheckRow}>
                <Check size={18} color="#087E59" strokeWidth={3.5} />
                <Text style={styles.foundCheckText}>Ketemu!</Text>
              </View>
            </View>
          </View>
        )}

        {/* SLIDE 4: Preview Art */}
        {slide.art === "preview" && (
          <View style={styles.previewWrapper}>
            <View style={styles.detailPreviewCard}>
              <View style={styles.miniFoodBig}>
                <Text style={[styles.miniFoodNumber, { fontSize: 48 }]}>15'</Text>
              </View>
              <Text style={styles.previewSourceText}>social.example</Text>
              <Text style={styles.previewTitleText}>Resep makan malam kilat</Text>
              <View style={styles.previewCollectionTag}>
                <Text style={styles.previewCollectionTagText}>Resep</Text>
              </View>
            </View>

            <View style={styles.previewSheetPill}>
              <SimpanInMascot small size={28} />
              <Check size={18} color="#000000" strokeWidth={3} />
            </View>
          </View>
        )}

        {/* SLIDE 6: Lockscreen Notification Mockup */}
        {slide.art === "notification" && (
          <View style={styles.lockscreen}>
            <Text style={styles.lockDate}>Selasa, 29 September</Text>
            <Text style={styles.lockTime}>9:41</Text>

            <View style={styles.notificationBubble}>
              <SimpanInMascot small size={36} />
              <View style={styles.notifTextCol}>
                <Text style={styles.notifStrong}>SimpanIn · Pengingat Santai</Text>
                <Text style={styles.notifPara}>
                  Ada simpanan yang belum sempat kamu baca. Luangkan 2 menit untuk melihatnya.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Action Area */}
      <View style={styles.onboardBottom}>
        {step === 6 && (
          <NeoButton
            variant="secondary"
            size="lg"
            onPress={nextStep}
          >
            Lewati Dulu
          </NeoButton>
        )}

        <NeoButton
          variant="primary"
          size="lg"
          onPress={
            step === 6
              ? async () => {
                  try {
                    const granted = await requestNotificationPermission();
                    if (granted) {
                      setNotificationsEnabled(true);
                      await sendImmediateTestNotification(3);
                    }
                  } catch {
                    // ignore
                  }
                  nextStep();
                }
              : nextStep
          }
        >
          {slide.cta}
        </NeoButton>

        {/* Neobrutalist Dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View
              key={i}
              style={[
                styles.dotItem,
                i === step && styles.dotItemActive,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardTop: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  plainBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  stepBadge: {
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    ...NEO_SHADOW_SM,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
  },
  textBtn: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    textDecorationLine: "underline",
  },
  onboardCopy: {
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 24,
    zIndex: 2,
  },
  headlineTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
    color: "#000000",
    marginBottom: 10,
  },
  titleWithHighlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  highlightPill: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ rotate: "-1deg" }],
  },
  highlightPillText: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#000000",
  },
  headlineSub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    color: "#666158",
    maxWidth: 350,
  },
  artSection: {
    flex: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  onboardBottom: {
    marginTop: "auto",
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 12,
    zIndex: 4,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 6,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C9C4BC",
  },
  dotItemActive: {
    width: 22,
    backgroundColor: "#111111",
  },

  // ------------------------------------------
  // SLIDE ART STYLES
  // ------------------------------------------
  saveCard: {
    width: 240,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    ...NEO_SHADOW_LG,
    padding: 14,
    borderRadius: 14,
    transform: [{ rotate: "-3deg" }],
    gap: 8,
  },
  unopenedArtWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 300,
  },
  unopenedBadge: {
    backgroundColor: "#111111",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unopenedBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  miniFood: {
    height: 120,
    backgroundColor: "#EF7E45",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  miniFoodNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  saveCardTimestamp: {
    fontSize: 11,
    color: "#8A8478",
    fontWeight: "600",
  },
  saveCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    lineHeight: 20,
  },
  unopenedMascotPos: {
    position: "absolute",
    right: 32,
    bottom: 10,
    transform: [{ rotate: "8deg" }],
  },

  // SCATTERED ART
  scatteredWrapper: {
    width: "100%",
    height: 320,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  saveCardScattered: {
    width: 215,
    zIndex: 2,
  },
  saveCardCategoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A8478",
    letterSpacing: 0.5,
  },
  floatPill: {
    position: "absolute",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    ...NEO_SHADOW_SM,
    borderRadius: 20,
    zIndex: 1,
  },
  floatPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  f1: {
    left: 20,
    top: 35,
    transform: [{ rotate: "-8deg" }],
  },
  f2: {
    right: 20,
    top: 25,
    transform: [{ rotate: "7deg" }],
  },
  f3: {
    left: 28,
    bottom: 25,
    transform: [{ rotate: "4deg" }],
  },
  f4: {
    right: 18,
    bottom: 30,
    transform: [{ rotate: "-4deg" }],
  },
  f5: {
    right: 24,
    top: 135,
    transform: [{ rotate: "12deg" }],
  },

  // MEET ART
  meetWrapper: {
    position: "relative",
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  meetMascotPos: {
    position: "absolute",
    top: 15,
    left: 35,
    zIndex: 3,
    transform: [{ rotate: "-6deg" }],
  },
  foundCard: {
    width: 270,
    padding: 18,
    paddingTop: 45,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    ...NEO_SHADOW_LG,
    borderRadius: 14,
    transform: [{ rotate: "2deg" }],
    gap: 8,
  },
  foundCardCategory: {
    fontSize: 11,
    fontWeight: "800",
    color: "#666158",
  },
  foundCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
  },
  foundCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  foundCheckText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#087E59",
  },

  // PREVIEW ART
  previewWrapper: {
    position: "relative",
    width: "100%",
    height: 330,
    alignItems: "center",
    justifyContent: "center",
  },
  detailPreviewCard: {
    width: 270,
    padding: 14,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    ...NEO_SHADOW_LG,
    borderRadius: 14,
    gap: 8,
  },
  miniFoodBig: {
    height: 155,
    backgroundColor: "#EF7E45",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewSourceText: {
    fontSize: 11,
    color: "#666158",
    fontWeight: "600",
  },
  previewTitleText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#000000",
  },
  previewCollectionTag: {
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 4,
  },
  previewCollectionTagText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  previewSheetPill: {
    position: "absolute",
    bottom: 12,
    right: 32,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    ...NEO_SHADOW_SM,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
  },

  // LOCKSCREEN ART
  lockscreen: {
    width: 295,
    height: 360,
    borderWidth: 2.5,
    borderColor: "#000000",
    borderRadius: 28,
    backgroundColor: "#8FC9FF",
    ...NEO_SHADOW_LG,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  lockDate: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  lockTime: {
    fontSize: 54,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -3,
    marginTop: 2,
  },
  notificationBubble: {
    marginTop: 65,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  notifTextCol: {
    flex: 1,
  },
  notifStrong: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  notifPara: {
    fontSize: 11,
    lineHeight: 15,
    color: "#333333",
    marginTop: 2,
  },

  // ------------------------------------------
  // STEP 3: DEMO STYLES
  // ------------------------------------------
  demoBg: {
    backgroundColor: "#171717",
  },
  tryBanner: {
    marginHorizontal: 18,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    borderRadius: 8,
    alignItems: "center",
  },
  tryBannerText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
  },
  reel: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: "#E76C41",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 18,
    position: "relative",
    overflow: "hidden",
  },
  reelArt: {
    height: "58%",
    justifyContent: "center",
    alignItems: "center",
  },
  reelArtNum: {
    fontSize: 88,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 88,
  },
  reelArtSub: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 4,
    marginTop: 2,
  },
  reelCopy: {
    position: "absolute",
    bottom: 24,
    left: 16,
    width: "68%",
  },
  reelAuthor: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  reelTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  reelDesc: {
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 16,
    opacity: 0.9,
  },
  shareDemoBtn: {
    position: "absolute",
    right: 16,
    bottom: 50,
    backgroundColor: "#FFFFFF",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  shareDemoText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#000000",
    marginTop: 2,
  },
  shareTooltip: {
    position: "absolute",
    top: -36,
    right: -8,
    backgroundColor: "#F7CB54",
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: 105,
    alignItems: "center",
  },
  shareTooltipText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000000",
  },
  fakeSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 2.5,
    borderColor: "#000000",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    minHeight: 280,
  },
  fakeSheetTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 16,
  },
  shareGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },
  shareCol: {
    alignItems: "center",
    width: "22%",
    gap: 6,
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEEAE4",
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  shareColText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666158",
  },
  highlightAppBtn: {
    width: "24%",
    backgroundColor: "#FFE39A",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    position: "relative",
    gap: 4,
  },
  highlightAppName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  highlightTooltip: {
    position: "absolute",
    bottom: -36,
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    width: 110,
    alignItems: "center",
    zIndex: 10,
  },
  highlightTooltipText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000000",
  },
  saveDemoSheet: {
    minHeight: 380,
  },
  urlBox: {
    backgroundColor: "#EEEAE4",
    borderWidth: 1.5,
    borderColor: "#000000",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  urlBoxText: {
    fontSize: 11,
    color: "#666158",
    fontWeight: "600",
  },
  toggleLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderColor: "#000000",
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DDDDDD",
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackOn: {
    backgroundColor: "#A6E3D1",
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  toggleThumbOn: {
    transform: [{ translateX: 20 }],
  },
  folderList: {
    gap: 6,
    marginBottom: 16,
  },
  folderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E1DA",
    borderRadius: 8,
  },
  folderRowSelected: {
    backgroundColor: "#FFF3C8",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  folderRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  folderIconSquare: {
    fontSize: 14,
    color: "#666158",
  },
  folderRowName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  folderRowNameSelected: {
    fontWeight: "900",
  },
  folderHintBadge: {
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  folderHintText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000000",
  },
  saveBtnWrapper: {
    marginTop: "auto",
    position: "relative",
  },
  saveHintTooltip: {
    position: "absolute",
    top: -34,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  saveHintText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000000",
  },
  demoSuccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#A6E3D1",
    borderWidth: 3,
    borderColor: "#000000",
    ...NEO_SHADOW_LG,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  demoSuccessTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  demoSuccessSub: {
    fontSize: 15,
    color: "#C9C4BC",
    marginTop: 6,
  },
  demoSuccessBtn: {
    marginTop: 32,
    width: "100%",
    maxWidth: 260,
  },

  // ------------------------------------------
  // STEP 5: FOCUS MODE STYLES
  // ------------------------------------------
  focusScreen: {
    backgroundColor: "#121212",
    paddingHorizontal: 18,
  },
  focusCompleteCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 18,
  },
  completeSub: {
    fontSize: 15,
    color: "#AAAAAA",
    marginTop: 4,
  },
  focusHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  focusHeadLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  focusHeadSmall: {
    color: "#F7CB54",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  focusHeadCount: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  focusCloseBtn: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    padding: 5,
    borderRadius: 6,
  },
  progressBars: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 16,
  },
  progressBarSeg: {
    flex: 1,
    height: 5,
    backgroundColor: "#444444",
    borderRadius: 3,
  },
  progressBarSegDone: {
    backgroundColor: "#F7CB54",
  },
  focusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#000000",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#F7CB54",
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    transform: [{ rotate: "-1deg" }],
  },
  focusVisualBox: {
    height: 190,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  focusVisualSymbol: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  focusVisualSubSymbol: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
    marginTop: 2,
  },
  focusMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  focusSourceText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#666158",
  },
  focusCollectionBadge: {
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  focusCollectionText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  focusCardTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 6,
  },
  focusCardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: "#555555",
    marginBottom: 10,
  },
  focusTagBadge: {
    backgroundColor: "#EEEEEE",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
  },
  focusTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  focusHelpArea: {
    marginTop: "auto",
    paddingVertical: 20,
    alignItems: "center",
  },
  focusHelpDesc: {
    color: "#AAAAAA",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  focusHelpAction: {
    color: "#F7CB54",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },

  // ------------------------------------------
  // STEP 7: READY SCREEN STYLES
  // ------------------------------------------
  readyScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  readyCenter: {
    alignItems: "center",
    paddingTop: 10,
  },
  readyTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
    color: "#000000",
    marginTop: 14,
    lineHeight: 32,
  },
  readySub: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666158",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 340,
  },
  readyCardBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    ...NEO_SHADOW_SM,
    borderRadius: 14,
    marginTop: 20,
    overflow: "hidden",
  },
  readyRowItem: {
    flexDirection: "row",
    padding: 14,
    alignItems: "flex-start",
    gap: 12,
  },
  readyRowBorder: {
    borderBottomWidth: 1.5,
    borderColor: "#EAE6DE",
  },
  readyIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  readyTextCol: {
    flex: 1,
  },
  readyItemTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 3,
  },
  readyItemDesc: {
    fontSize: 12,
    color: "#666158",
    lineHeight: 17,
  },
  quickTipCard: {
    width: "100%",
    backgroundColor: "#F5F0E8",
    borderWidth: 2,
    borderColor: "#000000",
    ...NEO_SHADOW_SM,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  quickTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  quickTipBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  quickTipBody: {
    fontSize: 12,
    color: "#44403C",
    lineHeight: 18,
  },
  readyActionSection: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
  },
  startAppBtn: {
    width: "100%",
  },
  readyFootnote: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8A8478",
    textAlign: "center",
    marginTop: 12,
  },
});
