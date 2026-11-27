import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  KeyRound,
  RefreshCw,
} from "lucide-react-native";
import { useSimpanInStore } from "../src/store/useSimpanInStore";
import { THEME_LIGHT, THEME_DARK } from "../src/constants/theme";
import { NeoCard } from "../src/components/ui/NeoCard";
import { NeoButton } from "../src/components/ui/NeoButton";
import { SimpanInMascot } from "../src/components/ui/SimpanInMascot";
import { safeBack } from "../src/utils/navigation";
import { isSupabaseConfigured } from "../src/lib/supabase";
import {
  signInWithSupabase,
  signUpWithSupabase,
  verifySignupOtp,
  resendSignupOtp,
  translateAuthError,
  syncAllWithSupabase,
} from "../src/services/supabaseSync";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 30;
const RESEND_OTP_COOLDOWN_SECONDS = 60;

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = params.from === "onboarding";

  const isDark = useSimpanInStore((state) => state.settings.darkMode);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  const settings = useSimpanInStore((state) => state.settings);
  const setCloudSync = useSimpanInStore((state) => state.setCloudSync);
  const collections = useSimpanInStore((state) => state.collections);
  const items = useSimpanInStore((state) => state.items);
  const importDatabase = useSimpanInStore((state) => state.importDatabase);

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Login rate limit state (max 3 attempts -> 30s cooldown)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const showFeedback = (type: "error" | "success" | "info", title: string, text: string) => {
    setFeedback({ type, text });
    if (Platform.OS !== "web") {
      Alert.alert(title, text);
    }
  };

  const finishAuthNavigation = () => {
    if (fromOnboarding) {
      router.replace("/home");
    } else {
      safeBack(router, "/settings");
    }
  };

  const handleSubmit = async () => {
    setFeedback(null);

    if (!isSupabaseConfigured) {
      showFeedback(
        "error",
        "Cloud Belum Siap",
        "Konfigurasi layanan cloud (.env) belum terbaca. Restart Expo lalu coba lagi."
      );
      return;
    }

    if (authMode === "login" && lockoutSeconds > 0) {
      showFeedback(
        "error",
        "Terlalu Banyak Percobaan",
        `Silakan tunggu ${lockoutSeconds} detik sebelum mencoba masuk kembali.`
      );
      return;
    }

    if (!email.trim() || !password) {
      showFeedback(
        "error",
        "Data Belum Lengkap",
        "Mohon isi email dan kata sandi terlebih dahulu."
      );
      return;
    }

    if (authMode === "register" && password.length < 6) {
      showFeedback(
        "error",
        "Kata Sandi Terlalu Pendek",
        "Kata sandi minimal 6 karakter."
      );
      return;
    }

    Haptics.selectionAsync();
    setIsLoading(true);
    try {
      if (authMode === "login") {
        await signInWithSupabase(email, password);
        setFailedAttempts(0);
        setLockoutSeconds(0);
        setCloudSync(true);
        const merged = await syncAllWithSupabase(collections, items, {
          ...settings,
          cloudSyncEnabled: true,
        });
        importDatabase({
          collections: merged.collections,
          items: merged.items,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        finishAuthNavigation();
      } else {
        const res = await signUpWithSupabase(email, password);
        if (res.needsEmailConfirmation) {
          setOtpStep(true);
          setOtpCode("");
          setResendCooldown(RESEND_OTP_COOLDOWN_SECONDS);
          showFeedback(
            "info",
            "Masukkan Kode OTP",
            `Kode verifikasi 6 digit telah dikirim ke ${email.trim()}. Cek kotak masuk atau folder Spam.`
          );
        } else if (res.user) {
          setCloudSync(true);
          await syncAllWithSupabase(collections, items, {
            ...settings,
            cloudSyncEnabled: true,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          finishAuthNavigation();
        } else {
          showFeedback(
            "error",
            "Gagal Mendaftar",
            "Tidak dapat membuat akun. Coba gunakan email lain."
          );
        }
      }
    } catch (err: any) {
      const rawMsg = String(err?.message || "").toLowerCase();
      if (authMode === "login" && rawMsg.includes("email not confirmed")) {
        setOtpStep(true);
        setOtpCode("");
        resendSignupOtp(email).catch(() => {});
        setResendCooldown(RESEND_OTP_COOLDOWN_SECONDS);
        showFeedback(
          "info",
          "Verifikasi Email Diperlukan",
          `Akun belum diverifikasi. Kami telah mengirim ulang kode OTP ke ${email.trim()}.`
        );
      } else if (authMode === "login" && rawMsg.includes("invalid login credentials")) {
        const nextAttempts = failedAttempts + 1;
        if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
          setFailedAttempts(0);
          setLockoutSeconds(LOCKOUT_DURATION_SECONDS);
          showFeedback(
            "error",
            "Terlalu Banyak Percobaan",
            `Salah kata sandi ${MAX_LOGIN_ATTEMPTS} kali. Silakan tunggu ${LOCKOUT_DURATION_SECONDS} detik.`
          );
        } else {
          setFailedAttempts(nextAttempts);
          const remaining = MAX_LOGIN_ATTEMPTS - nextAttempts;
          showFeedback(
            "error",
            "Gagal Masuk",
            `Email atau kata sandi salah. Sisa ${remaining} percobaan sebelum jeda ${LOCKOUT_DURATION_SECONDS} detik.`
          );
        }
      } else {
        showFeedback(
          "error",
          authMode === "login" ? "Gagal Masuk" : "Gagal Mendaftar",
          translateAuthError(err)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFeedback(null);
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      showFeedback("error", "Kode OTP Belum Lengkap", "Masukkan 6 digit kode OTP dari email Anda.");
      return;
    }

    Haptics.selectionAsync();
    setIsLoading(true);
    try {
      await verifySignupOtp(email, cleanOtp);
      setCloudSync(true);
      const merged = await syncAllWithSupabase(collections, items, {
        ...settings,
        cloudSyncEnabled: true,
      });
      importDatabase({
        collections: merged.collections,
        items: merged.items,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      finishAuthNavigation();
    } catch (err: any) {
      showFeedback("error", "Verifikasi Gagal", translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setFeedback(null);
    Haptics.selectionAsync();
    try {
      await resendSignupOtp(email);
      setResendCooldown(RESEND_OTP_COOLDOWN_SECONDS);
      showFeedback(
        "success",
        "Kode Terkirim",
        `Kode OTP baru telah dikirim ke ${email.trim()}.`
      );
    } catch (err: any) {
      showFeedback("error", "Gagal Kirim Ulang", translateAuthError(err));
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        {otpStep ? (
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.surface,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setOtpStep(false);
              setFeedback(null);
            }}
            accessibilityLabel="Kembali"
          >
            <ChevronLeft size={22} color={theme.text} />
          </TouchableOpacity>
        ) : !fromOnboarding ? (
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.surface,
                borderColor: isDark ? "#4A4640" : "#000000",
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              safeBack(router, "/settings");
            }}
            accessibilityLabel="Kembali"
          >
            <ChevronLeft size={22} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            finishAuthNavigation();
          }}
          style={styles.skipBtn}
        >
          <Text style={[styles.skipText, { color: theme.textMuted }]}>
            {fromOnboarding ? "Lewati (Pakai Offline)" : "Tutup"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mascot & Brand Header */}
          <View style={styles.heroHeader}>
            <SimpanInMascot size={74} />
            <Text style={[styles.title, { color: theme.text }]}>
              {otpStep
                ? "Verifikasi Email"
                : authMode === "login"
                ? "Masuk ke SimpanIn"
                : "Buat Akun SimpanIn"}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {otpStep
                ? `Masukkan kode 6 digit yang kami kirim ke ${email.trim()}`
                : "Simpan semua koleksi & link kamu ke cloud agar aman saat ganti perangkat."}
            </Text>
          </View>

          {otpStep ? (
            <NeoCard color={theme.card} style={styles.formCard}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Kode Verifikasi (6 Digit)
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <KeyRound size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.otpField, { color: theme.text }]}
                  placeholder="123456"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={(txt) => setOtpCode(txt.replace(/[^0-9]/g, ""))}
                />
              </View>

              {feedback && (
                <View
                  style={[
                    styles.feedbackBox,
                    {
                      backgroundColor:
                        feedback.type === "error"
                          ? "#FEE2E2"
                          : feedback.type === "success"
                          ? "#A6E3D1"
                          : "#FFE7A3",
                    },
                  ]}
                >
                  <Text style={styles.feedbackText}>{feedback.text}</Text>
                </View>
              )}

              <View style={styles.submitWrap}>
                <NeoButton
                  variant="yellow"
                  size="lg"
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otpCode.length < 6}
                  icon={<Cloud size={18} color="#000000" />}
                >
                  {isLoading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                </NeoButton>
              </View>

              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendCooldown > 0}
                style={styles.resendBtn}
              >
                <RefreshCw
                  size={13}
                  color={resendCooldown > 0 ? theme.textSecondary : theme.text}
                />
                <Text
                  style={[
                    styles.resendText,
                    {
                      color: resendCooldown > 0 ? theme.textSecondary : theme.text,
                    },
                  ]}
                >
                  {resendCooldown > 0
                    ? `Kirim ulang kode dalam ${resendCooldown} dtk`
                    : "Kirim ulang kode OTP"}
                </Text>
              </TouchableOpacity>
            </NeoCard>
          ) : (
            <>
              {/* Segmented Mode Switcher */}
              <View
                style={[
                  styles.tabRow,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: isDark ? "#4A4640" : "#000000",
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    authMode === "login" && styles.tabBtnActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAuthMode("login");
                    setFeedback(null);
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: authMode === "login" ? "#000000" : theme.textMuted },
                    ]}
                  >
                    Masuk
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    authMode === "register" && styles.tabBtnActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAuthMode("register");
                    setFeedback(null);
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: authMode === "register" ? "#000000" : theme.textMuted },
                    ]}
                  >
                    Daftar Akun
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Card */}
              <NeoCard color={theme.card} style={styles.formCard}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: theme.cardSecondary,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                >
                  <Mail size={16} color={theme.textMuted} />
                  <TextInput
                    style={[styles.inputField, { color: theme.text }]}
                    placeholder="nama@email.com"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: theme.text, marginTop: 12 }]}>
                  Kata Sandi
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: theme.cardSecondary,
                      borderColor: isDark ? "#4A4640" : "#000000",
                    },
                  ]}
                >
                  <Lock size={16} color={theme.textMuted} />
                  <TextInput
                    style={[styles.inputField, { color: theme.text }]}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color={theme.textMuted} />
                    ) : (
                      <Eye size={16} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {feedback && (
                  <View
                    style={[
                      styles.feedbackBox,
                      {
                        backgroundColor:
                          feedback.type === "error"
                            ? "#FEE2E2"
                            : feedback.type === "success"
                            ? "#A6E3D1"
                            : "#FFE7A3",
                      },
                    ]}
                  >
                    <Text style={styles.feedbackText}>{feedback.text}</Text>
                  </View>
                )}

                <View style={styles.submitWrap}>
                  <NeoButton
                    variant="yellow"
                    size="lg"
                    onPress={handleSubmit}
                    disabled={isLoading || (authMode === "login" && lockoutSeconds > 0)}
                    icon={<Cloud size={18} color="#000000" />}
                  >
                    {isLoading
                      ? "Memproses..."
                      : authMode === "login" && lockoutSeconds > 0
                      ? `Tunggu ${lockoutSeconds} detik...`
                      : authMode === "login"
                      ? "Masuk & Sinkronkan"
                      : "Daftar Sekarang"}
                  </NeoButton>
                </View>
              </NeoCard>
            </>
          )}

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              finishAuthNavigation();
            }}
            style={styles.offlineBtn}
          >
            <Text style={[styles.offlineText, { color: theme.textMuted }]}>
              Tetap gunakan secara lokal tanpa akun →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backBtnPlaceholder: {
    width: 42,
    height: 42,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  heroHeader: {
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 14,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
  },
  tabRow: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#F7CB54",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
  },
  formCard: {
    padding: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 2,
  },
  otpField: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 6,
    paddingVertical: 2,
  },
  submitWrap: {
    marginTop: 18,
  },
  feedbackBox: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 17,
  },
  resendBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  offlineBtn: {
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 8,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
