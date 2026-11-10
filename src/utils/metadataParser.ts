export interface ParsedMetadata {
  platform: "Instagram" | "TikTok" | "Pinterest" | "X" | "YouTube" | "Web";
  domain: string;
  inferredTitle: string;
  inferredDescription: string;
  badgeColor: string;
  suggestedTags: string[];
}

export function extractDomain(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "link";
  }
}

export function parseUrlMetadata(url: string): ParsedMetadata {
  const domain = extractDomain(url).toLowerCase();

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

  if (domain.includes("instagram.com")) {
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

  // Fallback for general web
  let title = domain;
  try {
    const parsed = new URL(url.startsWith("http") ? url : "https://" + url);
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
  } catch {}

  return {
    platform: "Web",
    domain,
    inferredTitle: title,
    inferredDescription: `Tautan artikel dan referensi dari ${domain}`,
    badgeColor: "#2563EB",
    suggestedTags: ["referensi", "bacaan"],
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

