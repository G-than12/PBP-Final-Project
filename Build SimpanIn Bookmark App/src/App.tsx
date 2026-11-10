import { useEffect, useMemo, useState } from "react";

type Collection = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isSystem?: boolean;
  createdAt: number;
};

type SavedItem = {
  id: string;
  url: string;
  title: string;
  description: string;
  source: string;
  collectionId: string;
  isPinned: boolean;
  isReviewed: boolean;
  tags: string[];
  notes: string;
  createdAt: number;
  image: string;
};

type Screen = "home" | "search" | "settings" | "collection" | "detail" | "focus" | "paywall";

const COLORS = [
  "#F7CB54",
  "#FF8C79",
  "#A6E3D1",
  "#8FC9FF",
  "#D0B7FF",
  "#FFB8D2",
  "#B8E986",
  "#FF9F43",
  "#FFE39A",
  "#80CBC4",
  "#90CAF9",
  "#CE93D8",
  "#EF9A9A",
  "#C5E1A5",
  "#B0BEC5",
  "#FFFFFF",
];
const ICONS = [
  "folder",
  "book",
  "food",
  "home",
  "plane",
  "star",
  "heart",
  "idea",
  "camera",
  "music",
  "work",
  "gift",
  "film",
  "game",
  "shop",
  "coffee",
  "leaf",
  "code",
  "study",
  "fitness",
  "art",
  "map",
  "link",
  "archive",
];
const ICON_MAP: Record<string, string> = {
  folder: "▰",
  book: "▥",
  food: "♨",
  home: "⌂",
  plane: "✈",
  star: "★",
  heart: "♥",
  idea: "✦",
  camera: "◉",
  music: "♫",
  work: "▣",
  gift: "◇",
  film: "▶",
  game: "◆",
  shop: "▤",
  coffee: "♨",
  leaf: "♧",
  code: "</>",
  study: "A+",
  fitness: "↗",
  art: "✎",
  map: "⌖",
  link: "↗",
  archive: "□",
};

const now = Date.now();
const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: "inbox",
    name: "Belum Diurutkan",
    color: "#8FC9FF",
    icon: "archive",
    isSystem: true,
    createdAt: now - 5000,
  },
  { id: "recipes", name: "Resep", color: "#F7CB54", icon: "food", createdAt: now - 4000 },
  { id: "homeideas", name: "Ide rumah", color: "#A6E3D1", icon: "home", createdAt: now - 3000 },
  { id: "travel", name: "Liburan", color: "#FF8C79", icon: "plane", createdAt: now - 2000 },
];

const INITIAL_ITEMS: SavedItem[] = [
  {
    id: "item1",
    url: "https://social.example/reel/quick-dinner-recipe",
    title: "Resep makan malam kilat",
    description: "5 sayuran, 1 wajan, 15 menit. Makan malam enak tanpa cucian menumpuk.",
    source: "social.example",
    collectionId: "recipes",
    isPinned: true,
    isReviewed: false,
    tags: ["resep", "cepat"],
    notes: "Coba hari Jumat. Ganti paprika dengan jamur.",
    createdAt: now - 90000,
    image: "food",
  },
  {
    id: "item2",
    url: "https://pinterest.example/reading-corner",
    title: "Ide sudut baca yang nyaman",
    description: "Lampu, kursi, dan rak. Mudah dibuat untuk ruang kecil.",
    source: "Pinterest",
    collectionId: "homeideas",
    isPinned: false,
    isReviewed: false,
    tags: ["interior"],
    notes: "",
    createdAt: now - 80000,
    image: "home",
  },
  {
    id: "item3",
    url: "https://travel.example/kyoto-morning",
    title: "Tips liburan ke Kyoto: datang pagi-pagi",
    description: "Kunjungi Higashiyama jam 7 pagi sebelum jalanan ramai.",
    source: "travel.example",
    collectionId: "travel",
    isPinned: false,
    isReviewed: false,
    tags: ["jepang"],
    notes: "Masukkan ke itinerary hari kedua.",
    createdAt: now - 70000,
    image: "travel",
  },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    folder: <path d="M3 6h6l2 2h10v11H3z" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    arrow: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    pin: (
      <>
        <path d="m9 3 6 0-.7 5 2.7 3v2H7v-2l2.7-3z" />
        <path d="M12 13v8" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: (
      <>
        <path d="m5 5 14 14M19 5 5 19" />
      </>
    ),
    bell: (
      <>
        <path d="M6 16h12l-1.5-2V9a4.5 4.5 0 0 0-9 0v5z" />
        <path d="M10 19h4" />
      </>
    ),
    paste: (
      <>
        <rect x="6" y="5" width="12" height="16" rx="1" />
        <path d="M9 5V3h6v2M9 9h6M9 13h6" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4-1 11-11-3-3L5 16z" />
        <path d="m14 7 3 3" />
      </>
    ),
    trash: (
      <>
        <path d="M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="m8 11 8-5M8 13l8 5" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

function Mascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={`mascot ${small ? "small" : ""}`}
      viewBox="0 0 150 170"
      role="img"
      aria-label="Maskot SimpanIn"
    >
      <path d="M46 21h75v123l-37-23-38 23z" fill="#69B7F4" stroke="#000" strokeWidth="5" />
      <path d="M31 12h75v123l-37-23-38 23z" fill="#F7CB54" stroke="#000" strokeWidth="5" />
      <circle cx="55" cy="65" r="4" fill="#000" />
      <circle cx="83" cy="65" r="4" fill="#000" />
      <path d="M55 81q14 14 28 0" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
      <g transform="translate(16 9) rotate(-25)">
        <rect x="0" y="0" width="40" height="18" rx="9" fill="#fff" stroke="#000" strokeWidth="4" />
        <path d="M19 1v16" stroke="#F43F5E" strokeWidth="9" />
      </g>
    </svg>
  );
}

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function Btn({
  children,
  onClick,
  secondary,
  danger,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`btn ${secondary ? "secondary" : ""} ${danger ? "danger" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function Sheet({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <section className={`sheet ${className}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn flat" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Modal({
  title,
  text,
  onClose,
  children,
}: {
  title: string;
  text?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="overlay center" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {children || <Btn onClick={onClose}>OK</Btn>}
      </section>
    </div>
  );
}

function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState(0);
  const [focusCard, setFocusCard] = useState(0);
  const [processing, setProcessing] = useState(false);
  const next = () => setStep((s) => Math.min(7, s + 1));

  if (step === 3) {
    const demoData = [
      ["Resep makan malam kilat", "5 sayuran, 1 wajan, 15 menit."],
      ["Ide sudut baca yang nyaman", "Lampu, kursi, dan rak. Mudah dibuat."],
      ["Tips liburan ke Kyoto: datang pagi-pagi", "Kunjungi Higashiyama jam 7 pagi."],
    ];
    if (demo >= 4)
      return (
        <div className="onboarding demo-bg">
          <div className="demo-success">
            <div className="success-circle">
              <Icon name="check" size={34} />
            </div>
            <h1>Tersimpan!</h1>
            <p>Link tersimpan</p>
            <Btn onClick={next}>Lanjutkan</Btn>
          </div>
        </div>
      );
    return (
      <div className="onboarding demo-bg">
        <OnboardTop step={step} onBack={() => setStep(2)} onSkip={() => setStep(7)} />
        <div className="try-banner">Coba sekarang · simpan reel ini ke SimpanIn</div>
        {demo === 0 && (
          <div className="reel">
            <div className="reel-art">
              <span>15</span>
              <small>MENIT</small>
            </div>
            <div className="reel-copy">
              <b>@simpanin.demo</b>
              <h2>{demoData[0][0]}</h2>
              <p>{demoData[0][1]}</p>
            </div>
            <button className="share-demo" onClick={() => setDemo(1)}>
              <Icon name="share" />
              <span>Bagikan</span>
              <i>Ketuk Bagikan</i>
            </button>
          </div>
        )}
        {demo === 1 && (
          <div className="fake-sheet">
            <h2>Membagikan link</h2>
            <div className="share-row">
              <span>Pesan</span>
              <button onClick={() => setDemo(2)} className="highlight-app">
                <Mascot small />
                <b>SimpanIn</b>
                <i>↓ Ketuk SimpanIn</i>
              </button>
              <span>Salin link</span>
              <span>Lainnya</span>
            </div>
          </div>
        )}
        {demo >= 2 && (
          <div className="fake-sheet save-demo">
            <h2>Simpan ke SimpanIn</h2>
            <div className="url-box">https://social.example/reel/quick-dinner-recipe</div>
            <label className="toggle-line">
              Sematkan link ini <span className="toggle" />
            </label>
            <div className="folder-list">
              {["Belum Diurutkan", "Resep", "Ide rumah", "Liburan"].map((x) => (
                <button
                  key={x}
                  className={x === "Resep" && demo >= 2 ? "selected" : ""}
                  onClick={() => x === "Resep" && setDemo(3)}
                >
                  <span>▰</span>
                  {x}
                  {x === "Resep" && demo === 2 && <i>← Pilih ini</i>}
                </button>
              ))}
            </div>
            <Btn onClick={() => demo === 3 && setDemo(4)} className={demo === 3 ? "pulse" : ""}>
              Simpan ke "Resep"{demo === 3 && <i>↓ Sekarang ketuk Simpan</i>}
            </Btn>
          </div>
        )}
      </div>
    );
  }

  if (step === 5) {
    const focusItems = [
      ["social.example", "Resep", "Resep makan malam kilat", "5 sayuran, 1 wajan, 15 menit."],
      [
        "Pinterest",
        "Ide rumah",
        "Ide sudut baca yang nyaman",
        "Lampu, kursi, dan rak. Mudah dibuat.",
        "# interior",
      ],
      [
        "travel.example",
        "Liburan",
        "Tips liburan ke Kyoto: datang pagi-pagi",
        "Kunjungi Higashiyama jam 7 pagi.",
        "# jepang",
      ],
    ];
    if (focusCard === 3)
      return (
        <div className="focus-screen complete">
          <div className="success-circle">
            <Icon name="check" size={42} />
          </div>
          <h1>Semua sudah kamu tinjau!</h1>
          <p>Kerja bagus.</p>
          <Btn onClick={next}>Lanjutkan</Btn>
        </div>
      );
    const item = focusItems[focusCard];
    return (
      <div className="focus-screen">
        <div className="focus-head">
          <div>
            <small>SIMPANAN BARU</small>
            <b>0{focusCard + 1} / 03</b>
          </div>
          <button onClick={() => setStep(6)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="progress-bars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i <= focusCard ? "done" : ""} />
          ))}
        </div>
        <button className="focus-card" onClick={() => setFocusCard((c) => c + 1)}>
          <div
            className={`item-visual ${focusCard === 0 ? "food" : focusCard === 1 ? "home" : "travel"}`}
          >
            <span>{focusCard === 0 ? "15" : focusCard === 1 ? "⌂" : "京都"}</span>
          </div>
          <div className="focus-meta">
            <span>{item[0]}</span>
            <em>{item[1]}</em>
          </div>
          <h2>{item[2]}</h2>
          <p>{item[3]}</p>
          {item[4] && <strong>{item[4]}</strong>}
        </button>
        <div className="focus-help">
          <p>Mode Fokus menampilkan simpananmu satu per satu. Buka yang penting, lewati sisanya.</p>
          <b>
            {focusCard === 2
              ? "← Geser sekali lagi untuk selesai"
              : "Geser ke kiri atau kanan untuk menjelajah →"}
          </b>
        </div>
      </div>
    );
  }

  if (step === 7)
    return <Paywall onClose={onDone} processing={processing} setProcessing={setProcessing} />;

  const slides = [
    {
      title: "Disimpan belum tentu dipakai.",
      sub: 'Bookmark di 7 aplikasi. Screenshot di galeri. Tab yang disimpan untuk "nanti".',
      cta: "Ada cara yang lebih baik",
      art: "unopened",
    },
    {
      title: "Kamu menyimpannya. Lalu hilang.",
      sub: "Konten bagus tercecer di mana-mana.",
      cta: "Itu aku banget",
      art: "scattered",
    },
    {
      title: "Kenalkan, SimpanIn.",
      sub: "Satu tempat untuk semua yang kamu simpan. Simpan sekali. Temukan saat dibutuhkan.",
      cta: "Tunjukkan caranya",
      art: "meet",
    },
    {},
    {
      title: "Begitu saja. Sudah ada di Resep",
      sub: "Judul, pratinjau, dan sumber — sudah terisi untukmu.",
      cta: "Ayo pakai →",
      art: "preview",
    },
    {},
    {
      title: "Jangan lupakan lagi simpananmu!",
      sub: "Pengingat ringan saat simpananmu sedang menunggu.",
      cta: "Nyalakan pengingat",
      art: "notification",
    },
  ] as { title?: string; sub?: string; cta?: string; art?: string }[];
  const slide = slides[step];
  return (
    <div className="onboarding">
      <OnboardTop
        step={step}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onSkip={() => setStep(7)}
      />
      <div className="onboard-copy">
        <h1>
          {step === 1 ? (
            <>
              Kamu menyimpannya. <mark>Lalu hilang.</mark>
            </>
          ) : (
            slide.title
          )}
        </h1>
        <p>{slide.sub}</p>
      </div>
      <OnboardArt type={slide.art || ""} />
      <div className="onboard-bottom">
        {step === 6 && (
          <Btn secondary onClick={next}>
            Nanti saja
          </Btn>
        )}
        <Btn
          onClick={
            step === 6
              ? () => {
                  alert("Izinkan SimpanIn mengirim notifikasi kepada Anda?");
                  next();
                }
              : next
          }
        >
          {slide.cta}
        </Btn>
        <div className="dots">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className={i === step ? "active" : ""} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardTop({
  step,
  onBack,
  onSkip,
}: {
  step: number;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <header className="onboard-top">
      <button onClick={onBack} className="plain">
        <Icon name="arrow" />
      </button>
      <span>{step + 1} / 8</span>
      <button onClick={onSkip} className="text-btn">
        Lewati
      </button>
    </header>
  );
}

function OnboardArt({ type }: { type: string }) {
  if (type === "notification")
    return (
      <div className="lockscreen">
        <small>Selasa, 29 September</small>
        <b>9:41</b>
        <div className="notification">
          <Mascot small />
          <div>
            <strong>SimpanIn · sekarang</strong>
            <p>Jangan lupakan simpananmu — Yuk, geser simpanan yang belum kamu lihat.</p>
          </div>
        </div>
      </div>
    );
  if (type === "scattered")
    return (
      <div className="scattered">
        <span className="float f1">Instagram</span>
        <span className="float f2">TikTok</span>
        <span className="float f3">X</span>
        <span className="float f4">Chrome</span>
        <span className="float f5">Threads</span>
        <div className="save-card">
          <small>INSTAGRAM REEL</small>
          <b>Resep makan malam kilat</b>
          <div className="mini-food">15'</div>
        </div>
      </div>
    );
  if (type === "meet")
    return (
      <div className="meet-art">
        <Mascot />
        <div className="found-card">
          <span>Sudah ketemu</span>
          <b>Resep makan malam kilat</b>
          <strong>
            <Icon name="check" /> Ketemu!
          </strong>
        </div>
      </div>
    );
  if (type === "preview")
    return (
      <div className="preview-art">
        <div className="detail-preview">
          <div className="mini-food big">15'</div>
          <small>social.example</small>
          <b>Resep makan malam kilat</b>
          <span>Resep</span>
        </div>
        <div className="preview-sheet">
          <Mascot small />
          <Icon name="check" />
        </div>
      </div>
    );
  return (
    <div className="unopened-art">
      <div className="save-card">
        <span className="label">BELUM DIBUKA</span>
        <div className="mini-food">15'</div>
        <small>Disimpan 42 hari lalu</small>
        <b>Resep makan malam kilat</b>
      </div>
      <Mascot small />
    </div>
  );
}

function Paywall({
  onClose,
  processing,
  setProcessing,
}: {
  onClose: () => void;
  processing?: boolean;
  setProcessing?: (x: boolean) => void;
}) {
  const [plan, setPlan] = useState("Tahunan");
  const features = [
    ["Simpanan", "4 link/hari, 10 gambar", "Tanpa batas"],
    ["Koleksi", "3 koleksi", "Tanpa batas"],
    ["Mode Fokus", "✓", "✓"],
    ["Pengingat", "✓", "✓"],
    ["Bagikan koleksi", "—", "✓"],
    ["Ekspor & cadangan", "—", "✓"],
    ["Subfolder", "—", "✓"],
  ];
  return (
    <div className="paywall">
      <button className="pay-close" onClick={onClose}>
        <Icon name="close" />
      </button>
      <div className="ready-badge">✓ SIMPANIN-MU SUDAH SIAP</div>
      <Mascot small />
      <h1>Simpananmu butuh sebuah sistem</h1>
      <p>Untuk kamu yang menyimpan bookmark seperti membangun otak kedua.</p>
      <div className="compare">
        <div className="compare-head">
          <b>Fitur</b>
          <b>Gratis</b>
          <b>Pro</b>
        </div>
        {features.map((r) => (
          <div key={r[0]}>
            <span>{r[0]}</span>
            <span>{r[1]}</span>
            <strong>{r[2]}</strong>
          </div>
        ))}
      </div>
      <h2>SimpanIn paling cocok untuk...</h2>
      <div className="testimonials">
        <blockquote>
          <b>Mahasiswa</b>
          <p>“Semua referensi tugas akhirnya rapi dan gampang ditemukan.”</p>
        </blockquote>
        <blockquote>
          <b>Wirausahawan</b>
          <p>“Ide konten tidak lagi hilang di antara puluhan aplikasi.”</p>
        </blockquote>
      </div>
      <div className="pricing">
        <p>Tinggal bareng (sekarang kita serius)</p>
        <div className="plan-row">
          {[
            ["Bulanan", "Rp 35.000"],
            ["Tahunan", "Rp 219.000"],
            ["Seumur hidup", "Rp 349.000"],
          ].map(([x, price]) => (
            <button key={x} onClick={() => setPlan(x)} className={plan === x ? "active" : ""}>
              {x === "Tahunan" && <i>HEMAT 48%</i>}
              {x === "Seumur hidup" && <i>PENAWARAN TERBATAS</i>}
              <b>{x}</b>
              <span>{price}</span>
              <small>
                {x === "Tahunan"
                  ? "Rp18.250/bulan"
                  : x === "Seumur hidup"
                    ? "sekali bayar"
                    : "per bulan"}
              </small>
            </button>
          ))}
        </div>
        <Btn
          onClick={() => {
            setProcessing?.(true);
            setTimeout(onClose, 900);
          }}
        >
          {processing ? "Memproses..." : "Mulai uji coba gratis 3 hari"}
        </Btn>
        <small>
          Rp 219.000/tahun setelah uji coba gratis 3 hari. Batalkan perpanjangan kapan saja.
        </small>
        <a>Pulihkan pembelian | Ketentuan | Privasi</a>
      </div>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useStoredState("simpanin-onboarded", false);
  const [splash, setSplash] = useState(!onboarded);
  const [screen, setScreen] = useState<Screen>("home");
  const [collections, setCollections] = useStoredState<Collection[]>(
    "simpanin-collections",
    INITIAL_COLLECTIONS,
  );
  const [items, setItems] = useStoredState<SavedItem[]>("simpanin-items", INITIAL_ITEMS);
  const [selectedCollection, setSelectedCollection] = useState("recipes");
  const [selectedItem, setSelectedItem] = useState("item1");
  const [sheet, setSheet] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; text?: string } | null>(null);
  const [quickUrl, setQuickUrl] = useState("");
  const [draftCollection, setDraftCollection] = useState<Collection | null>(null);
  const [sort, setSort] = useState("Terlama dulu");
  const [homeTitle, setHomeTitle] = useStoredState("simpanin-title", [
    "Simpan sekarang.",
    "Temukan kapan saja.",
  ]);
  const [darkMode, setDarkMode] = useStoredState("simpanin-dark", false);

  useEffect(() => {
    if (splash) {
      const t = setTimeout(() => setSplash(false), 1100);
      return () => clearTimeout(t);
    }
  }, [splash]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  const nav = (next: Screen) => {
    setScreen(next);
    window.scrollTo(0, 0);
  };
  const collection = collections.find((c) => c.id === selectedCollection) || collections[0];
  const item = items.find((i) => i.id === selectedItem) || items[0];
  const unreviewed = items.filter((i) => !i.isReviewed).length;

  if (splash)
    return (
      <div className="splash">
        <Mascot />
        <h1>SimpanIn</h1>
        <p>Simpan sekali. Temukan kapan saja.</p>
      </div>
    );
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;

  const createCollection = (c: Collection) => {
    setCollections((prev) =>
      draftCollection?.id ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c],
    );
    setSheet(null);
    setDraftCollection(null);
  };
  const openCollection = (id: string) => {
    setSelectedCollection(id);
    nav("collection");
  };
  const openItem = (id: string) => {
    setSelectedItem(id);
    nav("detail");
  };
  const saveLink = (collectionId: string, url = quickUrl) => {
    const newItem: SavedItem = {
      id: crypto.randomUUID(),
      url,
      title: url.includes("design") ? "Inspirasi desain yang disimpan" : "Simpanan baru dari web",
      description: "Pratinjau dan deskripsi link akan tersedia di sini.",
      source: new URL(url.startsWith("http") ? url : `https://${url}`).hostname,
      collectionId,
      isPinned: false,
      isReviewed: false,
      tags: [],
      notes: "",
      createdAt: Date.now(),
      image: "web",
    };
    setItems((prev) => [newItem, ...prev]);
    setQuickUrl("");
    setSheet(null);
    setModal({ title: "Tersimpan!", text: "Link tersimpan" });
  };

  return (
    <div className="app-shell">
      {screen === "home" && (
        <Home
          collections={collections}
          items={items}
          unreviewed={unreviewed}
          quickUrl={quickUrl}
          setQuickUrl={setQuickUrl}
          setSheet={setSheet}
          setDraftCollection={setDraftCollection}
          openCollection={openCollection}
          nav={nav}
          sort={sort}
          homeTitle={homeTitle}
        />
      )}
      {screen === "search" && (
        <SearchScreen
          collections={collections}
          items={items}
          onBack={() => nav("home")}
          openCollection={openCollection}
          openItem={openItem}
        />
      )}
      {screen === "settings" && (
        <Settings
          items={items}
          collections={collections}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          nav={nav}
          setSheet={setSheet}
          setModal={setModal}
          homeTitle={homeTitle}
        />
      )}
      {screen === "collection" && (
        <CollectionScreen
          collection={collection}
          items={items.filter((i) => i.collectionId === collection.id)}
          onBack={() => nav("home")}
          openItem={openItem}
          setSheet={setSheet}
          setModal={setModal}
          nav={nav}
        />
      )}
      {screen === "detail" && item && (
        <DetailScreen
          item={item}
          collection={collections.find((c) => c.id === item.collectionId)!}
          onBack={() => nav("collection")}
          setItems={setItems}
          setSheet={setSheet}
          setModal={setModal}
        />
      )}
      {screen === "focus" && (
        <FocusMode
          items={items.filter((i) => !i.isReviewed)}
          onDone={(reviewed) => {
            setItems((prev) =>
              prev.map((x) => (reviewed.includes(x.id) ? { ...x, isReviewed: true } : x)),
            );
            nav("home");
          }}
        />
      )}
      {screen === "paywall" && <Paywall onClose={() => nav("settings")} />}

      {sheet === "create" && (
        <CollectionEditor
          initial={draftCollection}
          count={collections.filter((c) => !c.isSystem).length}
          onClose={() => {
            setSheet(null);
            setDraftCollection(null);
          }}
          onSave={createCollection}
        />
      )}
      {sheet === "sort" && (
        <Sheet title="Urutkan koleksi" onClose={() => setSheet(null)}>
          <div className="option-list">
            {["Terlama dulu", "Terbaru dulu", "Nama A–Z", "Terakhir disimpan"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setSort(x);
                  setSheet(null);
                }}
              >
                {x}
                <span>{sort === x ? "●" : "○"}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "save" && (
        <SaveSheet
          collections={collections}
          url={quickUrl}
          onClose={() => setSheet(null)}
          onCreate={() => setSheet("create")}
          onSave={saveLink}
        />
      )}
      {sheet === "collection-menu" && (
        <CollectionMenu
          collection={collection}
          itemCount={items.filter((i) => i.collectionId === collection.id).length}
          onClose={() => setSheet(null)}
          setSheet={setSheet}
          setModal={setModal}
        />
      )}
      {sheet === "add-url" && (
        <AddUrl onClose={() => setSheet(null)} onSave={(url) => saveLink(collection.id, url)} />
      )}
      {sheet === "move" && item && (
        <MoveSheet
          collections={collections}
          current={item.collectionId}
          onClose={() => setSheet(null)}
          onMove={(id: string) => {
            setItems((prev) =>
              prev.map((x) => (x.id === item.id ? { ...x, collectionId: id } : x)),
            );
            setSheet(null);
            setModal({
              title: "Berhasil dipindahkan",
              text: "Link sudah dipindahkan ke koleksi yang dipilih.",
            });
          }}
        />
      )}
      {sheet === "tag" && item && (
        <TagSheet
          item={item}
          onClose={() => setSheet(null)}
          onAdd={(tag: string) => {
            setItems((prev) =>
              prev.map((x) => (x.id === item.id ? { ...x, tags: [...x.tags, tag] } : x)),
            );
            setSheet(null);
          }}
        />
      )}
      {sheet === "home-title" && (
        <HomeTitleEditor
          value={homeTitle}
          onClose={() => setSheet(null)}
          onSave={(v: string[]) => {
            setHomeTitle(v);
            setSheet(null);
          }}
        />
      )}
      {sheet === "pro" && (
        <ProModal
          onClose={() => setSheet(null)}
          onShow={() => {
            setSheet(null);
            nav("paywall");
          }}
        />
      )}
      {modal && <Modal title={modal.title} text={modal.text} onClose={() => setModal(null)} />}
    </div>
  );
}

function Home({
  collections,
  items,
  unreviewed,
  quickUrl,
  setQuickUrl,
  setSheet,
  setDraftCollection,
  openCollection,
  nav,
  sort,
  homeTitle,
}: any) {
  const sorted = [...collections].sort((a, b) =>
    sort === "Nama A–Z"
      ? a.name.localeCompare(b.name)
      : sort === "Terbaru dulu"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
  );
  const requestCollection = () => {
    setDraftCollection(null);
    setSheet(collections.filter((c: Collection) => !c.isSystem).length >= 3 ? "pro" : "create");
  };
  return (
    <main className="screen home-screen">
      <header className="main-header">
        <button className="icon-btn" onClick={() => nav("settings")}>
          <Icon name="settings" />
        </button>
        <div className="wordmark">
          <Mascot small />
          <b>SimpanIn</b>
        </div>
        <div>
          <button className="icon-btn" onClick={requestCollection}>
            <Icon name="folder" />
            <i>+</i>
          </button>
          <button className="icon-btn" onClick={() => nav("search")}>
            <Icon name="search" />
          </button>
        </div>
      </header>
      {(homeTitle[0] || homeTitle[1]) && (
        <h1 className="hero-title">
          {homeTitle[0]}
          <br />
          {homeTitle[1]}
        </h1>
      )}
      <div className="quick-save">
        <Icon name="paste" />
        <input
          aria-label="Tempel link"
          value={quickUrl}
          onChange={(e) => setQuickUrl(e.target.value)}
          placeholder="# Tempel link untuk simpan cepat"
        />
        <button onClick={() => quickUrl && setSheet("save")}>
          <Icon name="plus" />
        </button>
      </div>
      {unreviewed > 0 && (
        <button className="review-card" onClick={() => nav("focus")}>
          <span>
            <Icon name="bell" />
          </span>
          <div>
            <b>{unreviewed} simpanan baru menunggu</b>
            <small>Tinjau sekarang</small>
          </div>
          <strong>›</strong>
        </button>
      )}
      <section className="section">
        <div className="section-head">
          <h2>Koleksiku</h2>
          <button onClick={() => setSheet("sort")}>{sort.replace(" dulu", "")}⌄</button>
        </div>
        <div className="collection-grid">
          {sorted.map((c, index) => {
            const count = items.filter((i: SavedItem) => i.collectionId === c.id).length;
            const fresh = items.filter(
              (i: SavedItem) => i.collectionId === c.id && !i.isReviewed,
            ).length;
            return (
              <button
                className="folder-card"
                key={c.id}
                onClick={() => openCollection(c.id)}
                style={{ "--folder": c.color } as React.CSSProperties}
              >
                <span className="folder-tab" />
                <div className="folder-icon">{ICON_MAP[c.icon]}</div>
                {fresh > 0 && <i>{fresh > 1 ? `${fresh} BARU` : "BARU"}</i>}
                <h3>{c.name}</h3>
                <p>{count} simpanan</p>
                <small>0 subkoleksi</small>
                {index === 0 && <em>UTAMA</em>}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function CollectionEditor({
  initial,
  count,
  onClose,
  onSave,
}: {
  initial: Collection | null;
  count: number;
  onClose: () => void;
  onSave: (c: Collection) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon || ICONS[0]);
  return (
    <Sheet
      title={initial ? "Edit koleksi" : "Tambah koleksi baru"}
      onClose={onClose}
      className="editor-sheet"
    >
      <label className="field-label">
        NAMA <span>{name.length}/40</span>
      </label>
      <input
        className="text-input"
        maxLength={40}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama koleksi"
      />
      <label className="field-label">WARNA</label>
      <div className="color-grid">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={color === c ? "active" : ""}
          >
            {color === c && <Icon name="check" />}
          </button>
        ))}
      </div>
      <label className="field-label">IKON</label>
      <div className="icon-grid">
        {ICONS.map((x) => (
          <button key={x} onClick={() => setIcon(x)} className={icon === x ? "active" : ""}>
            {ICON_MAP[x]}
          </button>
        ))}
      </div>
      {!initial && count >= 3 && (
        <p className="limit-note">Batas 3 koleksi Paket Gratis sudah tercapai.</p>
      )}
      <Btn
        disabled={!name.trim() || (!initial && count >= 3)}
        onClick={() =>
          onSave({
            id: initial?.id || crypto.randomUUID(),
            name: name.trim(),
            color,
            icon,
            createdAt: initial?.createdAt || Date.now(),
            isSystem: initial?.isSystem,
          })
        }
      >
        {initial ? "Perbarui koleksi" : "Buat koleksi"}
      </Btn>
    </Sheet>
  );
}

function SaveSheet({ collections, url, onClose, onCreate, onSave }: any) {
  const [selected, setSelected] = useState(collections[0].id);
  const [pinned, setPinned] = useState(false);
  const chosen = collections.find((c: Collection) => c.id === selected);
  return (
    <Sheet title="Simpan ke SimpanIn" onClose={onClose}>
      <div className="url-box">{url}</div>
      <label className="toggle-line">
        Sematkan link ini{" "}
        <button className={`toggle ${pinned ? "on" : ""}`} onClick={() => setPinned(!pinned)} />
      </label>
      <div className="subhead">
        <b>KOLEKSI</b>
        <button onClick={onCreate}>
          <Icon name="folder" />
          <i>+</i>
        </button>
      </div>
      <div className="option-list folders">
        {collections.map((c: Collection) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={c.id === selected ? "selected" : ""}
          >
            <span style={{ background: c.color }}>{ICON_MAP[c.icon]}</span>
            {c.name}
            <i>{c.id === selected ? "●" : "○"}</i>
          </button>
        ))}
      </div>
      <Btn onClick={() => onSave(selected)}>Simpan ke "{chosen.name}"</Btn>
    </Sheet>
  );
}

function CollectionScreen({ collection, items, onBack, openItem, setSheet, setModal, nav }: any) {
  return (
    <main className="screen collection-screen">
      <header className="collection-header">
        <button className="icon-btn" onClick={onBack}>
          <Icon name="arrow" />
        </button>
        <div>
          <h1>{collection.name}</h1>
          <p>{items.length} simpanan · 0 subkoleksi</p>
        </div>
        <button className="focus-button" onClick={() => nav("focus")}>
          Mode Fokus
        </button>
        <button className="icon-btn" onClick={() => setSheet("collection-menu")}>
          <Icon name="more" />
        </button>
      </header>
      <div className="collection-banner" style={{ background: collection.color }}>
        <span>{ICON_MAP[collection.icon]}</span>
        <div>
          <small>KOLEKSI</small>
          <b>{collection.name}</b>
        </div>
      </div>
      <div className="items-label">SIMPANAN ({items.length})</div>
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-folder">▰</div>
          <h2>Belum ada simpanan</h2>
          <p>Ketuk + atau bagikan untuk menyimpan.</p>
          <Btn
            onClick={() =>
              setModal({
                title: "Simpan link dari aplikasi apa pun",
                text: "1. Ketuk Bagikan  2. Pilih SimpanIn  3. Pilih koleksi  4. Ketuk Simpan",
              })
            }
          >
            Lihat caranya
          </Btn>
        </div>
      ) : (
        <div className="item-grid">
          {items.map((x: SavedItem) => (
            <ItemCard key={x.id} item={x} onClick={() => openItem(x.id)} />
          ))}
        </div>
      )}
      <button className="fab" onClick={() => setSheet("add-url")}>
        <Icon name="plus" />
      </button>
    </main>
  );
}

function ItemCard({ item, onClick }: { item: SavedItem; onClick: () => void }) {
  return (
    <button className="item-card" onClick={onClick}>
      <div className={`item-visual ${item.image}`}>
        <span>
          {item.image === "food"
            ? "15"
            : item.image === "home"
              ? "⌂"
              : item.image === "travel"
                ? "京都"
                : "↗"}
        </span>
        {!item.isReviewed && <i>BARU</i>}
        {item.isPinned && (
          <b>
            <Icon name="pin" size={15} />
          </b>
        )}
      </div>
      <small>{item.source}</small>
      <h3>{item.title}</h3>
    </button>
  );
}

function CollectionMenu({ itemCount, onClose, setSheet, setModal }: any) {
  return (
    <Sheet title="Opsi koleksi" onClose={onClose}>
      <div className="menu-list">
        <button onClick={() => setSheet("add-url")}>
          <span>＋</span>
          <div>
            <b>Tambah link</b>
            <small>Simpan URL baru</small>
          </div>
        </button>
        <button
          onClick={() =>
            itemCount
              ? setModal({ title: "Pilih link", text: "Ketuk simpanan yang ingin dipilih." })
              : setModal({
                  title: "Tidak ada yang bisa dipilih",
                  text: "Belum ada simpanan di koleksi ini.",
                })
          }
        >
          <span>☑</span>
          <div>
            <b>Pilih link</b>
            <small>Pilih beberapa simpanan</small>
          </div>
        </button>
        <button onClick={() => setSheet("pro")}>
          <span>▰</span>
          <div>
            <b>Buat subkoleksi</b>
            <small>Atur koleksi di dalam koleksi</small>
          </div>
          <i>PRO</i>
        </button>
        <button
          onClick={() =>
            setModal({
              title: "Pilih yang mau dibagikan",
              text: "Tingkat atas saja atau semua link (termasuk subkoleksi).",
            })
          }
        >
          <span>↗</span>
          <div>
            <b>Bagikan koleksi</b>
            <small>Kirim koleksi ke teman</small>
          </div>
        </button>
        <button>
          <span>⇅</span>
          <div>
            <b>Urutkan simpanan</b>
            <small>Terbaru</small>
          </div>
          <strong>›</strong>
        </button>
      </div>
    </Sheet>
  );
}

function AddUrl({ onClose, onSave }: { onClose: () => void; onSave: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <Sheet title="Tambah link" onClose={onClose}>
      <label className="field-label">URL LINK</label>
      <input
        autoFocus
        className="text-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Tempel link untuk disimpan..."
      />
      <Btn disabled={!url} onClick={() => onSave(url)}>
        Simpan link
      </Btn>
    </Sheet>
  );
}

function DetailScreen({ item, collection, onBack, setItems, setSheet, setModal }: any) {
  const update = (patch: Partial<SavedItem>) =>
    setItems((prev: SavedItem[]) => prev.map((x) => (x.id === item.id ? { ...x, ...patch } : x)));
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  return (
    <main className="screen detail-screen">
      <div className={`detail-hero item-visual ${item.image}`}>
        <button className="icon-btn" onClick={onBack}>
          <Icon name="arrow" />
        </button>
        <span>
          {item.image === "food"
            ? "15"
            : item.image === "home"
              ? "⌂"
              : item.image === "travel"
                ? "京都"
                : "↗"}
        </span>
        <button
          className={`icon-btn pin ${item.isPinned ? "active" : ""}`}
          onClick={() => update({ isPinned: !item.isPinned })}
        >
          <Icon name="pin" />
        </button>
      </div>
      <div className="detail-body">
        <span className="platform">{item.source}</span>
        <div className="title-edit">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                update({ title });
                setEditing(false);
              }}
              autoFocus
            />
          ) : (
            <h1>{item.title}</h1>
          )}
          <button onClick={() => setEditing(true)}>
            <Icon name="edit" />
          </button>
        </div>
        <div className="detail-meta">
          <span style={{ background: collection.color }}>{collection.name}</span>
          <small>Disimpan hari ini</small>
        </div>
        <Btn onClick={() => window.open(item.url, "_blank")}>Buka link ↗</Btn>
        <div className="actions">
          <button onClick={() => navigator.share?.({ title: item.title, url: item.url })}>
            <Icon name="share" />
            <span>Bagikan</span>
          </button>
          <button onClick={() => setSheet("move")}>
            <Icon name="folder" />
            <span>Pindahkan</span>
          </button>
          <button
            onClick={() =>
              setModal({
                title: "Muat ulang metadata link?",
                text: "Muat Ulang akan memperbarui pratinjau link. Catatan, status sematan, dan koleksimu tidak akan berubah.",
              })
            }
          >
            <span className="action-symbol">↻</span>
            <span>Muat Ulang</span>
          </button>
          <button
            onClick={() =>
              setModal({ title: "Hapus link", text: "Hapus link ini secara permanen?" })
            }
          >
            <Icon name="trash" />
            <span>Hapus</span>
          </button>
        </div>
        <section className="detail-section">
          <label>DESKRIPSI</label>
          <p>{item.description}</p>
        </section>
        <section className="detail-section">
          <label>TAG</label>
          <div className="tags">
            {item.tags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => update({ tags: item.tags.filter((x: string) => x !== tag) })}
              >
                #{tag} ×
              </button>
            ))}
            <button onClick={() => setSheet("tag")}>+ Tambah</button>
          </div>
        </section>
        <section className="detail-section">
          <label>CATATAN</label>
          <textarea
            value={item.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Ketuk untuk menambahkan catatan..."
          />
        </section>
      </div>
    </main>
  );
}

function MoveSheet({ collections, current, onClose, onMove }: any) {
  const [selected, setSelected] = useState(current);
  const chosen = collections.find((c: Collection) => c.id === selected);
  return (
    <Sheet title="Pindahkan ke koleksi" onClose={onClose}>
      <p className="current-note">
        Saat ini: <b>{collections.find((c: Collection) => c.id === current)?.name}</b>
      </p>
      <div className="option-list folders">
        {collections.map((c: Collection) => (
          <button
            className={c.id === selected ? "selected" : ""}
            key={c.id}
            onClick={() => setSelected(c.id)}
          >
            <span style={{ background: c.color }}>{ICON_MAP[c.icon]}</span>
            {c.name}
            <i>{c.id === selected ? "●" : "○"}</i>
          </button>
        ))}
      </div>
      <Btn onClick={() => onMove(selected)}>Pindahkan ke "{chosen.name}"</Btn>
    </Sheet>
  );
}

function TagSheet({ item, onClose, onAdd }: any) {
  const [tag, setTag] = useState("");
  return (
    <Sheet title="Tambah tag" onClose={onClose}>
      <label className="field-label">NAMA TAG</label>
      <input
        className="text-input"
        value={tag}
        onChange={(e) => setTag(e.target.value.replace(/\s/g, "-"))}
        placeholder="mis. inspirasi-desain"
      />
      <p className="empty-copy">
        {item.tags.length
          ? "Buat tag lain untuk simpanan ini."
          : "Belum ada tag yang bisa dipakai ulang."}
      </p>
      <Btn disabled={!tag} onClick={() => onAdd(tag)}>
        Buat tag
      </Btn>
    </Sheet>
  );
}

function FocusMode({ items, onDone }: { items: SavedItem[]; onDone: (ids: string[]) => void }) {
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const current = items[index];
  const advance = () => {
    if (current) setReviewed((x) => [...x, current.id]);
    setIndex((x) => x + 1);
  };
  if (!current)
    return (
      <div className="focus-screen complete">
        <div className="success-circle">
          <Icon name="check" size={42} />
        </div>
        <h1>Semua sudah kamu tinjau!</h1>
        <p>Kerja bagus.</p>
        <Btn onClick={() => onDone(reviewed)}>Lanjutkan</Btn>
      </div>
    );
  return (
    <div className="focus-screen">
      <div className="focus-head">
        <div>
          <small>SIMPANAN BARU</small>
          <b>
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </b>
        </div>
        <button onClick={() => onDone(reviewed)}>
          <Icon name="close" />
        </button>
      </div>
      <div className="progress-bars">
        {items.map((_, i) => (
          <span key={i} className={i <= index ? "done" : ""} />
        ))}
      </div>
      <button className="focus-card" onClick={advance}>
        <div className={`item-visual ${current.image}`}>
          <span>
            {current.image === "food"
              ? "15"
              : current.image === "home"
                ? "⌂"
                : current.image === "travel"
                  ? "京都"
                  : "↗"}
          </span>
        </div>
        <div className="focus-meta">
          <span>{current.source}</span>
          <em>{current.collectionId}</em>
        </div>
        <h2>{current.title}</h2>
        <p>{current.description}</p>
        {current.tags[0] && <strong># {current.tags[0]}</strong>}
      </button>
      <div className="focus-help">
        <p>Mode Fokus menampilkan simpananmu satu per satu. Buka yang penting, lewati sisanya.</p>
        <b>
          {index === items.length - 1
            ? "← Geser sekali lagi untuk selesai"
            : "Geser ke kiri atau kanan untuk menjelajah →"}
        </b>
      </div>
    </div>
  );
}

function SearchScreen({ collections, items, onBack, openCollection, openItem }: any) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Ringkasan");
  const filteredItems = items.filter((x: SavedItem) =>
    `${x.title} ${x.source} ${x.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredCollections = collections.filter((x: Collection) =>
    x.name.toLowerCase().includes(query.toLowerCase()),
  );
  const tabs = ["Koleksi", "Simpanan", "Disematkan", "Tag"];
  return (
    <main className="screen search-screen">
      <div className="search-top">
        <div>
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari koleksi atau simpanan..."
          />
          {query && <button onClick={() => setQuery("")}>Bersihkan</button>}
        </div>
        <button onClick={onBack}>Batal</button>
      </div>
      <section className="library-card">
        <div>
          <small>PUSTAKAMU</small>
          <b>
            {collections.length} koleksi · {items.length} simpanan
          </b>
        </div>
        <div className="library-tabs">
          {tabs.map((x) => (
            <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>
              {x}
            </button>
          ))}
        </div>
        {tab !== "Ringkasan" && (
          <button className="summary-link" onClick={() => setTab("Ringkasan")}>
            Ringkasan
          </button>
        )}
      </section>
      {tab === "Ringkasan" && (
        <section>
          <h3 className="eyebrow">BARU DISIMPAN</h3>
          <div className="horizontal-items">
            {items.slice(0, 3).map((x: SavedItem) => (
              <ItemCard item={x} key={x.id} onClick={() => openItem(x.id)} />
            ))}
          </div>
          <p className="search-prompt">
            {query
              ? `${filteredItems.length + filteredCollections.length} hasil ditemukan`
              : "Ketik sesuatu untuk mencari..."}
          </p>
          {query && (
            <>
              <CollectionList list={filteredCollections} items={items} open={openCollection} />
              <div className="item-grid">
                {filteredItems.map((x: SavedItem) => (
                  <ItemCard key={x.id} item={x} onClick={() => openItem(x.id)} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
      {tab === "Koleksi" && (
        <CollectionList list={filteredCollections} items={items} open={openCollection} />
      )}
      {tab === "Simpanan" && (
        <>
          <div className="filter-chips">
            <button>Semua {filteredItems.length}</button>
            <button>Link {filteredItems.length}</button>
            <button>Gambar 0</button>
          </div>
          <div className="item-grid">
            {filteredItems.map((x: SavedItem) => (
              <ItemCard key={x.id} item={x} onClick={() => openItem(x.id)} />
            ))}
          </div>
        </>
      )}
      {tab === "Disematkan" && (
        <div className="item-grid">
          {filteredItems
            .filter((x: SavedItem) => x.isPinned)
            .map((x: SavedItem) => (
              <ItemCard key={x.id} item={x} onClick={() => openItem(x.id)} />
            ))}
        </div>
      )}
      {tab === "Tag" && (
        <div className="tag-list">
          {Array.from(new Set<string>(items.flatMap((x: SavedItem) => x.tags))).map((tag) => (
            <button key={tag} onClick={() => setQuery(tag)}>
              #{tag}
              <span>{items.filter((x: SavedItem) => x.tags.includes(tag)).length}</span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

function CollectionList({ list, items, open }: any) {
  return (
    <div className="collection-list">
      {list.map((c: Collection) => (
        <button key={c.id} onClick={() => open(c.id)}>
          <span style={{ background: c.color }}>{ICON_MAP[c.icon]}</span>
          <div>
            <b>{c.name}</b>
            <small>{items.filter((i: SavedItem) => i.collectionId === c.id).length} simpanan</small>
          </div>
          <strong>›</strong>
        </button>
      ))}
    </div>
  );
}

function Settings({
  items,
  collections,
  darkMode,
  setDarkMode,
  nav,
  setSheet,
  setModal,
  homeTitle,
}: any) {
  const customCount = collections.filter((c: Collection) => !c.isSystem).length;
  return (
    <main className="screen settings-screen">
      <header className="simple-header">
        <button className="icon-btn" onClick={() => nav("home")}>
          <Icon name="arrow" />
        </button>
        <h1>Pengaturan</h1>
      </header>
      <section className="plan-card">
        <span>PAKET GRATIS</span>
        <h2>SimpanIn Free</h2>
        <p>Simpan lebih cerdas, setiap hari.</p>
        <Usage label="Link hari ini" value={Math.min(items.length, 4)} max={4} />
        <Usage label="Gambar tersimpan" value={0} max={10} />
        <Usage label="Koleksi" value={customCount} max={3} />
        <Btn onClick={() => nav("paywall")}>Upgrade ke Pro →</Btn>
      </section>
      <SettingsGroup title="PREFERENSI">
        <Setting title="Umpan balik haptik" sub="Getar saat melakukan aksi dan memilih" toggle />
        <Setting
          title="Mode gelap"
          sub="Gunakan tampilan yang lebih gelap untuk aplikasi"
          checked={darkMode}
          onClick={() => setDarkMode(!darkMode)}
        />
        <Setting title="Bahasa" sub="Bahasa Indonesia" chevron />
        <Setting
          title="Judul beranda"
          sub={`${homeTitle[0]} ${homeTitle[1]}`}
          chevron
          onClick={() => setSheet("home-title")}
        />
        <Setting
          title="Pengingat simpanan baru"
          sub="Pengingat ringan untuk meninjau simpanan"
          toggle
        />
      </SettingsGroup>
      <SettingsGroup title="DATA & PENYIMPANAN">
        <Setting
          title="Sinkronisasi cloud"
          sub="Simpan ke Google Drive"
          pro
          chevron
          onClick={() => setSheet("pro")}
        />
        <Setting
          title="Cadangan & pemulihan"
          sub="Ekspor atau pulihkan datamu"
          pro
          chevron
          onClick={() => setSheet("pro")}
        />
      </SettingsGroup>
      <SettingsGroup title="DUKUNGAN">
        <Setting
          title="Panduan"
          sub="Bagikan link ke SimpanIn"
          chevron
          onClick={() =>
            setModal({
              title: "Simpan link dari aplikasi apa pun",
              text: "1. Ketuk Bagikan  2. Pilih SimpanIn  3. Pilih koleksi  4. Ketuk Simpan",
            })
          }
        />
        <Setting title="Kirim masukan" chevron />
        <Setting title="Kebijakan Privasi" chevron />
        <Setting title="Ketentuan Layanan" chevron />
        <Setting title="Beri rating SimpanIn di Google Play" chevron />
      </SettingsGroup>
      <SettingsGroup title="AKUN">
        <Setting
          title="Hapus semua data"
          danger
          onClick={() =>
            setModal({
              title: "Hapus semua data?",
              text: "Semua simpanan, koleksi, dan tag di perangkat ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
            })
          }
        />
      </SettingsGroup>
      <footer className="settings-footer">
        <span>Versi 1.7.0 (build 19)</span>
        <button>Salin ID pengguna</button>
      </footer>
    </main>
  );
}

function Usage({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="usage">
      <div>
        <span>{label}</span>
        <b>
          {value}/{max}
        </b>
      </div>
      <div>
        <i style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-group">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
function Setting({ title, sub, chevron, toggle, checked, pro, danger, onClick }: any) {
  const [local, setLocal] = useState(false);
  return (
    <button
      className={`setting ${danger ? "danger-text" : ""}`}
      onClick={() => {
        toggle && !onClick && setLocal(!local);
        onClick?.();
      }}
    >
      <div>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </div>
      {pro && <i>PRO</i>}
      {(toggle || checked !== undefined) && (
        <span className={`toggle ${(checked ?? local) ? "on" : ""}`} />
      )}
      {chevron && <strong>›</strong>}
    </button>
  );
}

function HomeTitleEditor({ value, onClose, onSave }: any) {
  const [lines, setLines] = useState(value);
  return (
    <Sheet title="Judul beranda" onClose={onClose}>
      <label className="field-label">PRATINJAU</label>
      <div className="title-preview">
        {lines[0]}
        <br />
        {lines[1]}
      </div>
      <label className="field-label">
        BARIS 1 <span>{lines[0].length}/24</span>
      </label>
      <input
        className="text-input"
        maxLength={24}
        value={lines[0]}
        onChange={(e) => setLines([e.target.value, lines[1]])}
      />
      <label className="field-label">
        BARIS 2 <span>{lines[1].length}/24</span>
      </label>
      <input
        className="text-input"
        maxLength={24}
        value={lines[1]}
        onChange={(e) => setLines([lines[0], e.target.value])}
      />
      <p className="empty-copy">Kosongkan kedua baris untuk menyembunyikan judul.</p>
      <button
        className="reset-link"
        onClick={() => setLines(["Simpan sekarang.", "Temukan kapan saja."])}
      >
        Kembalikan ke default
      </button>
      <Btn onClick={() => onSave(lines)}>Simpan</Btn>
    </Sheet>
  );
}

function ProModal({ onClose, onShow }: { onClose: () => void; onShow: () => void }) {
  return (
    <div className="overlay center" onMouseDown={onClose}>
      <section className="modal pro-modal" onMouseDown={(e) => e.stopPropagation()}>
        <Mascot small />
        <span className="pro-label">☆ JADI PRO ☆</span>
        <h2>Fitur ini adalah fitur Pro.</h2>
        <p>Ini yang kamu dapatkan dengan Pro:</p>
        <div className="mini-compare">
          <b>Fitur</b>
          <b>Gratis</b>
          <b>Pro</b>
          <span>Subkoleksi</span>
          <span>—</span>
          <strong>✓</strong>
          <span>Cadangan</span>
          <span>—</span>
          <strong>✓</strong>
          <span>Simpanan</span>
          <span>4/hari</span>
          <strong>Tanpa batas</strong>
        </div>
        <div className="modal-actions">
          <Btn secondary onClick={onClose}>
            Nanti saja
          </Btn>
          <Btn onClick={onShow}>Tunjukkan →</Btn>
        </div>
      </section>
    </div>
  );
}
