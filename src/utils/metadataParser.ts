export type SupportedPlatform =
  | "Instagram"
  | "TikTok"
  | "Pinterest"
  | "X"
  | "YouTube"
  | "Web";

export interface ParsedMetadata {
  platform: SupportedPlatform;
  domain: string;
  inferredTitle: string;
  inferredDescription: string;
  badgeColor: string;
  suggestedTags: string[];
}

export interface FetchedLinkMetadata extends ParsedMetadata {
  normalizedUrl: string;
  title: string;
  description: string;
  image?: string;
  fetchedFromRemote: boolean;
  notice?: string;
}

const GENERIC_BLOCKED_TITLES = [
  /^instagram$/i,
  /^log\s*in\s*[•·|-]\s*instagram$/i,
  /^login\s*[•·|-]\s*instagram$/i,
  /^tiktok\s*-\s*make your day$/i,
  /^just a moment\.{0,3}$/i,
  /^attention required/i,
  /^access denied$/i,
  /^403 forbidden$/i,
  /^404 not found$/i,
  /^page not found$/i,
  /^robot or human\??$/i,
  /^verify you are human/i,
  /^sign in to x$/i,
  /^x\.\s*it['’]s what['’]s happening/i,
];

export function isImageUrl(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/")
  );
}

export function extractFirstUrl(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  const urlMatch = trimmed.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i);
  if (urlMatch) {
    return urlMatch[0].replace(/[),.;!?]+$/, "");
  }

  return trimmed.split(/\s+/)[0] || trimmed;
}

export function normalizeUrl(rawInput: string): string {
  const extracted = extractFirstUrl(rawInput);
  if (!extracted) return "";
  if (/^https?:\/\//i.test(extracted)) return extracted;
  return `https://${extracted}`;
}

export function isFetchableUrl(rawInput: string): boolean {
  const candidate = normalizeUrl(rawInput);
  if (!candidate) return false;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname;
    return host.includes(".") && !host.endsWith(".") && host.length >= 4;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const clean = normalizeUrl(url);
    if (!clean) return "link";
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "link";
  }
}

export function parseUrlMetadata(url: string): ParsedMetadata {
  const normalized = normalizeUrl(url);
  const domain = extractDomain(normalized).toLowerCase();

  if (domain.includes("tiktok.com")) {
    return {
      platform: "TikTok",
      domain: "tiktok.com",
      inferredTitle: "Video TikTok",
      inferredDescription: "Video pendek menarik dari kreator TikTok.",
      badgeColor: "#000000",
      suggestedTags: ["tiktok", "video", "tren"],
    };
  }

  if (domain.includes("instagram.com") || domain.includes("instagr.am")) {
    return {
      platform: "Instagram",
      domain: "instagram.com",
      inferredTitle: "Instagram Reel / Post",
      inferredDescription: "Postingan visual atau inspirasi dari Instagram.",
      badgeColor: "#E1306C",
      suggestedTags: ["instagram", "reels", "inspirasi"],
    };
  }

  if (domain.includes("pinterest.com") || domain.includes("pin.it")) {
    return {
      platform: "Pinterest",
      domain: "pinterest.com",
      inferredTitle: "Ide Pinterest",
      inferredDescription: "Inspirasi desain, estetika, dan proyek DIY.",
      badgeColor: "#BD081C",
      suggestedTags: ["pinterest", "desain", "ide"],
    };
  }

  if (domain.includes("twitter.com") || domain.includes("x.com")) {
    return {
      platform: "X",
      domain: "x.com",
      inferredTitle: "Thread di X",
      inferredDescription: "Wawasan, diskusi, atau utas opini dari X.",
      badgeColor: "#14171A",
      suggestedTags: ["x", "utas", "wawasan"],
    };
  }

  if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
    return {
      platform: "YouTube",
      domain: "youtube.com",
      inferredTitle: "Video YouTube",
      inferredDescription: "Video edukasi, tutorial, atau dokumenter.",
      badgeColor: "#FF0000",
      suggestedTags: ["youtube", "tutorial", "video"],
    };
  }

  let title = domain;
  try {
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1]
        .replace(/[-_]/g, " ")
        .replace(/\.[a-zA-Z0-9]+$/, "")
        .trim();
      if (last.length > 2) {
        title = last.charAt(0).toUpperCase() + last.slice(1);
      }
    }
  } catch {
    // ignore URL fallback parsing failure
  }

  return {
    platform: "Web",
    domain,
    inferredTitle: title,
    inferredDescription: `Tautan artikel dan referensi dari ${domain}`,
    badgeColor: "#2563EB",
    suggestedTags: ["referensi", "bacaan"],
  };
}

export function decodeHtmlEntities(input: string): string {
  if (!input) return "";
  return input
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : _;
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : _;
    })
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "…")
    .replace(/&bull;/gi, "•");
}

function stripTagsAndCollapse(text: string): string {
  return decodeHtmlEntities(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function isGenericBlockedTitle(title?: string | null): boolean {
  if (!title) return true;
  const cleaned = title.trim();
  if (!cleaned) return true;
  return GENERIC_BLOCKED_TITLES.some((re) => re.test(cleaned));
}

export function resolveImageUrl(
  rawImg: string | undefined | null,
  baseUrl: string
): string | undefined {
  if (!rawImg) return undefined;
  const decoded = decodeHtmlEntities(rawImg).trim();
  if (!decoded || decoded.startsWith("data:")) return undefined;
  try {
    const resolved = new URL(decoded, baseUrl).toString();
    if (resolved.startsWith("https://") || resolved.startsWith("http://")) {
      return resolved;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function extractHtmlMetadata(
  html: string,
  baseUrl: string
): { title?: string; description?: string; image?: string } {
  if (!html) return {};

  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const metaMap = new Map<string, string>();

  for (const tag of metaTags) {
    const keyMatch = tag.match(/\b(?:property|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const valMatch = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const key = (keyMatch?.[1] || keyMatch?.[2] || keyMatch?.[3] || "").toLowerCase().trim();
    const val = (valMatch?.[1] ?? valMatch?.[2] ?? "").trim();
    if (key && val && !metaMap.has(key)) {
      metaMap.set(key, val);
    }
  }

  const rawTitle =
    metaMap.get("og:title") ||
    metaMap.get("twitter:title") ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
    "";

  const rawDesc =
    metaMap.get("og:description") ||
    metaMap.get("twitter:description") ||
    metaMap.get("description") ||
    "";

  let rawImage =
    metaMap.get("og:image:secure_url") ||
    metaMap.get("og:image") ||
    metaMap.get("og:image:url") ||
    metaMap.get("twitter:image:src") ||
    metaMap.get("twitter:image") ||
    "";

  if (!rawImage) {
    const linkImg = html.match(
      /<link\b[^>]*\brel\s*=\s*["']image_src["'][^>]*\bhref\s*=\s*["']([^"']+)["']/i
    );
    if (linkImg?.[1]) rawImage = linkImg[1];
  }

  const title = stripTagsAndCollapse(rawTitle);
  const description = stripTagsAndCollapse(rawDesc);
  const image = resolveImageUrl(rawImage, baseUrl);

  return {
    title: !isGenericBlockedTitle(title) ? title : undefined,
    description: description || undefined,
    image,
  };
}

export function cleanPlatformMetadata(
  platform: SupportedPlatform,
  raw: { title?: string; description?: string; image?: string }
): { title?: string; description?: string; image?: string } {
  let title = raw.title?.trim();
  let description = raw.description?.trim();
  const image = raw.image?.trim();

  if (platform === "Instagram") {
    // Format example: `Creator on Instagram: "Caption here..."`
    if (title) {
      const igQuoteMatch = title.match(/^(.+?)\s+on Instagram:\s*["“]([\s\S]+)["”]$/i);
      if (igQuoteMatch) {
        const author = igQuoteMatch[1].trim();
        const caption = igQuoteMatch[2].trim();
        const firstLine = caption.split(/\r?\n/)[0]?.trim() || caption;
        title =
          firstLine.length > 90
            ? `${firstLine.slice(0, 87)}...`
            : firstLine || `${author} di Instagram`;
        if (!description || description.length < caption.length) {
          description = `${author}: ${caption}`;
        }
      }
    }

    // Description example: `1,234 likes, 12 comments - username on Jan 1, 2026: "Caption..."`
    if (description) {
      const descQuoteMatch = description.match(
        /^\d[\d.,KMkm]*\s+likes?,\s+\d[\d.,KMkm]*\s+comments?\s+-\s+([^:]+):\s*["“]([\s\S]+)["”]$/i
      );
      if (descQuoteMatch) {
        const metaAuthor = descQuoteMatch[1].trim();
        const caption = descQuoteMatch[2].trim();
        description = caption;
        if (!title || isGenericBlockedTitle(title) || title === "Instagram Reel / Post") {
          const firstLine = caption.split(/\r?\n/)[0]?.trim() || caption;
          title =
            firstLine.length > 90
              ? `${firstLine.slice(0, 87)}...`
              : firstLine || metaAuthor;
        }
      }
    }
  }

  return {
    title: title && !isGenericBlockedTitle(title) ? title : undefined,
    description: description || undefined,
    image,
  };
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.toLowerCase();
    if (host.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes(parts[0])) {
        return parts[1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function extractXStatusParts(
  url: string
): { user: string; id: string } | null {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("x.com") && !host.includes("twitter.com")) return null;
    const match = parsed.pathname.match(/^\/([^/]+)\/status\/(\d+)/i);
    if (!match) return null;
    return { user: match[1], id: match[2] };
  } catch {
    return null;
  }
}

function cleanInstagramUrlForFetch(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("instagram.com")) {
      parsed.searchParams.delete("igsh");
      parsed.searchParams.delete("igshid");
      parsed.searchParams.delete("utm_source");
      parsed.searchParams.delete("utm_medium");
      parsed.searchParams.delete("utm_campaign");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs = 7000
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(
  url: string,
  headers: Record<string, string>,
  timeoutMs = 8000
): Promise<{ text: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    return { text: text.slice(0, 1_500_000), finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPlatformSpecificMetadata(
  targetUrl: string,
  platform: SupportedPlatform
): Promise<{ title?: string; description?: string; image?: string; finalUrl?: string }> {
  if (platform === "YouTube") {
    const videoId = extractYouTubeVideoId(targetUrl);
    const oembed = await fetchJsonWithTimeout<{
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    }>(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`);

    return {
      title: oembed?.title?.trim() || undefined,
      description: oembed?.author_name
        ? `Video YouTube oleh ${oembed.author_name}`
        : undefined,
      image:
        oembed?.thumbnail_url ||
        (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined),
    };
  }

  if (platform === "X") {
    const parts = extractXStatusParts(targetUrl);
    if (parts) {
      const fx = await fetchJsonWithTimeout<{
        tweet?: {
          text?: string;
          author?: { name?: string; screen_name?: string; avatar_url?: string };
          media?: {
            photos?: { url?: string }[];
            videos?: { thumbnail_url?: string }[];
          };
        };
      }>(`https://api.fxtwitter.com/${parts.user}/status/${parts.id}`);

      if (fx?.tweet) {
        const text = fx.tweet.text?.trim() || "";
        const authorLabel = fx.tweet.author?.name
          ? `${fx.tweet.author.name} (@${fx.tweet.author.screen_name || parts.user})`
          : `@${parts.user}`;
        const firstLine = text.split(/\r?\n/)[0]?.trim() || "";
        const title = firstLine
          ? firstLine.length > 85
            ? `${firstLine.slice(0, 82)}...`
            : firstLine
          : `Postingan ${authorLabel}`;
        const image =
          fx.tweet.media?.photos?.[0]?.url ||
          fx.tweet.media?.videos?.[0]?.thumbnail_url ||
          fx.tweet.author?.avatar_url;

        return {
          title,
          description: text ? `${authorLabel}: ${text}` : undefined,
          image,
        };
      }
    }
  }

  if (platform === "TikTok") {
    const oembed = await fetchJsonWithTimeout<{
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    }>(`https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`);

    if (oembed && (oembed.title || oembed.thumbnail_url || oembed.author_name)) {
      return {
        title: oembed.title?.trim() || (oembed.author_name ? `Video TikTok @${oembed.author_name}` : undefined),
        description:
          oembed.author_name && oembed.title
            ? `Oleh ${oembed.author_name} — ${oembed.title}`
            : oembed.title || (oembed.author_name ? `Video TikTok oleh ${oembed.author_name}` : undefined),
        image: oembed.thumbnail_url,
      };
    }
  }

  return {};
}

async function fetchMicrolinkMetadata(
  targetUrl: string
): Promise<{ title?: string; description?: string; image?: string }> {
  const json = await fetchJsonWithTimeout<{
    status?: string;
    data?: {
      title?: string;
      description?: string;
      image?: { url?: string } | null;
      logo?: { url?: string } | null;
    };
  }>(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`, 8000);

  if (json?.status !== "success" || !json.data) return {};
  const title = json.data.title?.trim();
  return {
    title: title && !isGenericBlockedTitle(title) ? title : undefined,
    description: json.data.description?.trim() || undefined,
    image: json.data.image?.url || json.data.logo?.url || undefined,
  };
}

/**
 * Direct server/native HTML & platform extraction (no CORS restrictions).
 * Used by both `app/api/metadata+api.ts` on web and native React Native clients.
 */
export async function extractDirectMetadata(
  rawUrl: string
): Promise<{
  normalizedUrl: string;
  platform: SupportedPlatform;
  title?: string;
  description?: string;
  image?: string;
}> {
  const normalizedUrl = cleanInstagramUrlForFetch(normalizeUrl(rawUrl));
  const base = parseUrlMetadata(normalizedUrl);

  const platformResult = await fetchPlatformSpecificMetadata(
    normalizedUrl,
    base.platform
  );

  // If platform oEmbed/API already provided title, description, and image, return immediately
  if (platformResult.title && platformResult.description && platformResult.image) {
    return {
      normalizedUrl,
      platform: base.platform,
      ...cleanPlatformMetadata(base.platform, platformResult),
    };
  }

  const uaList =
    base.platform === "Instagram"
      ? [
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "WhatsApp/2.23.20.0",
        ]
      : [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        ];

  let htmlMeta: { title?: string; description?: string; image?: string } = {};
  let resolvedUrl = normalizedUrl;

  for (const ua of uaList) {
    const res = await fetchTextWithTimeout(normalizedUrl, {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    });
    if (!res) continue;
    resolvedUrl = res.finalUrl || resolvedUrl;
    const parsed = extractHtmlMetadata(res.text, resolvedUrl);
    htmlMeta = {
      title: htmlMeta.title || parsed.title,
      description: htmlMeta.description || parsed.description,
      image: htmlMeta.image || parsed.image,
    };

    // For short links (e.g. vt.tiktok.com, pin.it), retry platform oEmbed with resolved URL
    if (
      resolvedUrl !== normalizedUrl &&
      base.platform === "TikTok" &&
      (!platformResult.title || !platformResult.image)
    ) {
      const resolvedTikTok = await fetchPlatformSpecificMetadata(resolvedUrl, "TikTok");
      if (resolvedTikTok.title) platformResult.title = resolvedTikTok.title;
      if (resolvedTikTok.description) platformResult.description = resolvedTikTok.description;
      if (resolvedTikTok.image) platformResult.image = resolvedTikTok.image;
    }

    if (htmlMeta.title && htmlMeta.image) break;
  }

  const merged = cleanPlatformMetadata(base.platform, {
    title: platformResult.title || htmlMeta.title,
    description: platformResult.description || htmlMeta.description,
    image: platformResult.image || htmlMeta.image,
  });

  if (!merged.title && !merged.image && !merged.description) {
    const microlink = await fetchMicrolinkMetadata(resolvedUrl);
    const cleanedMicrolink = cleanPlatformMetadata(base.platform, microlink);
    return {
      normalizedUrl: resolvedUrl,
      platform: base.platform,
      ...cleanedMicrolink,
    };
  }

  return {
    normalizedUrl: resolvedUrl,
    platform: base.platform,
    ...merged,
  };
}

/**
 * Client-side automatic metadata & thumbnail fetcher.
 * Works across Expo Web (via local `/api/metadata` + CORS-enabled oEmbed/Microlink)
 * and Expo Native (direct fetch + oEmbed + Microlink).
 */
export async function fetchUrlMetadata(rawUrl: string): Promise<FetchedLinkMetadata> {
  const normalizedUrl = normalizeUrl(rawUrl);
  const fallback = parseUrlMetadata(normalizedUrl);
  const isBrowser = typeof document !== "undefined";

  let remote: {
    title?: string;
    description?: string;
    image?: string;
    normalizedUrl?: string;
  } = {};

  if (isBrowser) {
    // 1. Try CORS-safe direct platform APIs first (fast & works even without server)
    const directPlatform = await fetchPlatformSpecificMetadata(
      normalizedUrl,
      fallback.platform
    );
    remote = { ...directPlatform };

    // 2. If missing image/title/description, query Expo Router API route `/api/metadata`
    if (!remote.title || !remote.description || !remote.image) {
      const apiRes = await fetchJsonWithTimeout<{
        title?: string;
        description?: string;
        image?: string;
        normalizedUrl?: string;
      }>(`/api/metadata?url=${encodeURIComponent(normalizedUrl)}`, 9000);

      if (apiRes) {
        remote = {
          normalizedUrl: apiRes.normalizedUrl || remote.normalizedUrl,
          title: remote.title || apiRes.title,
          description: remote.description || apiRes.description,
          image: remote.image || apiRes.image,
        };
      }
    }

    // 3. Final web fallback: Microlink (CORS-enabled)
    if (!remote.title || !remote.image) {
      const microlink = await fetchMicrolinkMetadata(normalizedUrl);
      remote = {
        ...remote,
        title: remote.title || microlink.title,
        description: remote.description || microlink.description,
        image: remote.image || microlink.image,
      };
    }
  } else {
    // Native (Android/iOS): no CORS restrictions, run direct extraction
    remote = await extractDirectMetadata(normalizedUrl);
  }

  const cleaned = cleanPlatformMetadata(fallback.platform, remote);
  const fetchedFromRemote = Boolean(
    cleaned.title || cleaned.description || cleaned.image
  );

  let notice: string | undefined;
  if (!fetchedFromRemote && fallback.platform === "Instagram") {
    notice =
      "Instagram membatasi pratinjau otomatis tanpa login untuk link ini. Kamu tetap bisa edit judul, deskripsi, atau URL thumbnail di bawah.";
  } else if (!fetchedFromRemote) {
    notice =
      "Pratinjau otomatis tidak tersedia dari situs tujuan. Judul dan deskripsi bawaan digunakan.";
  }

  return {
    ...fallback,
    normalizedUrl: remote.normalizedUrl || normalizedUrl,
    title: cleaned.title || fallback.inferredTitle,
    description: cleaned.description || fallback.inferredDescription,
    image: isImageUrl(cleaned.image) ? cleaned.image : undefined,
    fetchedFromRemote,
    notice,
  };
}

export function formatDateRelative(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    const d = new Date(timestamp);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  if (diffDay > 0) return `${diffDay} hari lalu`;
  if (diffHour > 0) return `${diffHour} jam lalu`;
  if (diffMin > 0) return `${diffMin} menit lalu`;
  return "Baru saja";
}
