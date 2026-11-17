/**
 * Utility to parse and detect deadline dates from text/captions
 * and compute reminder schedules.
 */

const ID_MONTHS: Record<string, number> = {
  januari: 0,
  jan: 0,
  februari: 1,
  pebruari: 1,
  feb: 1,
  maret: 2,
  mar: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  juni: 5,
  jun: 5,
  juli: 6,
  jul: 6,
  agustus: 7,
  agu: 7,
  ags: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  oktober: 9,
  okt: 9,
  oct: 9,
  november: 10,
  nopember: 10,
  nov: 10,
  desember: 11,
  des: 11,
  dec: 11,
};

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES_ID = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

export interface DetectedDeadline {
  date: Date;
  dateTimestamp: number;
  detectedSnippet: string;
  formattedDate: string;
  confidence: "high" | "medium";
}

/**
 * Detect deadline or event date from text (captions, notes, titles).
 */
export function detectDeadlineFromText(text: string): DetectedDeadline | null {
  if (!text || typeof text !== "string") return null;

  const cleanText = text.trim();
  if (cleanText.length < 3) return null;

  const now = new Date();
  const currentYear = now.getFullYear();

  // Pattern 1: Date ranges like "1 - 25 November 2026" or "10 s.d. 25 Des"
  const rangeRegex = /(?:periode|jadwal|tanggal|dari)?\s*\d{1,2}\s*(?:-|–|—|s\.?d\.?|sampai|hingga)\s*(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/i;
  const rangeMatch = cleanText.match(rangeRegex);
  if (rangeMatch) {
    const day = parseInt(rangeMatch[1], 10);
    const monthStr = rangeMatch[2].toLowerCase();
    const yearStr = rangeMatch[3];
    const monthIdx = ID_MONTHS[monthStr];

    if (monthIdx !== undefined && day >= 1 && day <= 31) {
      let year = yearStr ? parseInt(yearStr, 10) : currentYear;
      if (!yearStr) {
        const candidate = new Date(year, monthIdx, day, 23, 59, 59);
        if (candidate.getTime() < now.getTime() - 24 * 3600 * 1000) {
          year += 1;
        }
      }
      const targetDate = new Date(year, monthIdx, day, 23, 59, 59);
      return {
        date: targetDate,
        dateTimestamp: targetDate.getTime(),
        detectedSnippet: rangeMatch[0].trim(),
        formattedDate: `${day} ${MONTH_NAMES_SHORT[monthIdx]} ${year}`,
        confidence: "high",
      };
    }
  }

  // Pattern 2: Contextual deadline keywords ("deadline", "batas akhir", "ditutup", "due date", "s.d.")
  const keywordDateRegex = /(?:deadline|tenggat|batas\s+(?:akhir|pendaftaran|pengumpulan|submit)?|ditutup|terakhir|due\s*(?:date)?|close[ds]?|s\.?d\.?|sampai|hingga)\s*[:\-\s]?\s*(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/i;
  const kwMatch = cleanText.match(keywordDateRegex);
  if (kwMatch) {
    const day = parseInt(kwMatch[1], 10);
    const monthStr = kwMatch[2].toLowerCase();
    const yearStr = kwMatch[3];
    const monthIdx = ID_MONTHS[monthStr];

    if (monthIdx !== undefined && day >= 1 && day <= 31) {
      let year = yearStr ? parseInt(yearStr, 10) : currentYear;
      if (!yearStr) {
        const candidate = new Date(year, monthIdx, day, 23, 59, 59);
        if (candidate.getTime() < now.getTime() - 24 * 3600 * 1000) {
          year += 1;
        }
      }
      const targetDate = new Date(year, monthIdx, day, 23, 59, 59);
      return {
        date: targetDate,
        dateTimestamp: targetDate.getTime(),
        detectedSnippet: kwMatch[0].trim(),
        formattedDate: `${day} ${MONTH_NAMES_SHORT[monthIdx]} ${year}`,
        confidence: "high",
      };
    }
  }

  // Pattern 3: Slash or dash formats with keywords (e.g. "Deadline: 25/11/2026" or "Batas: 25-11-2026")
  const kwSlashRegex = /(?:deadline|tenggat|batas|ditutup|due|close)\s*[:\-\s]?\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/i;
  const slashMatch = cleanText.match(kwSlashRegex);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : currentYear;
    if (year < 100) year += 2000;

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const targetDate = new Date(year, month, day, 23, 59, 59);
      return {
        date: targetDate,
        dateTimestamp: targetDate.getTime(),
        detectedSnippet: slashMatch[0].trim(),
        formattedDate: `${day} ${MONTH_NAMES_SHORT[month]} ${year}`,
        confidence: "high",
      };
    }
  }

  // Pattern 4: General date pattern ("25 November 2026" or "15 Des 2026")
  const generalDateRegex = /\b(\d{1,2})\s+([a-zA-Z]{3,10})(?:\s+(\d{4}))?\b/i;
  const genMatch = cleanText.match(generalDateRegex);
  if (genMatch) {
    const day = parseInt(genMatch[1], 10);
    const monthStr = genMatch[2].toLowerCase();
    const yearStr = genMatch[3];
    const monthIdx = ID_MONTHS[monthStr];

    if (monthIdx !== undefined && day >= 1 && day <= 31) {
      let year = yearStr ? parseInt(yearStr, 10) : currentYear;
      if (!yearStr) {
        const candidate = new Date(year, monthIdx, day, 23, 59, 59);
        if (candidate.getTime() < now.getTime() - 24 * 3600 * 1000) {
          year += 1;
        }
      }
      const targetDate = new Date(year, monthIdx, day, 23, 59, 59);
      return {
        date: targetDate,
        dateTimestamp: targetDate.getTime(),
        detectedSnippet: genMatch[0].trim(),
        formattedDate: `${day} ${MONTH_NAMES_SHORT[monthIdx]} ${year}`,
        confidence: "medium",
      };
    }
  }

  return null;
}

/**
 * Format deadline date to Indonesian string
 */
export function formatDeadlineDate(
  timestamp: number,
  options: { withDay?: boolean; withYear?: boolean } = {}
): string {
  const date = new Date(timestamp);
  const dayName = DAY_NAMES_ID[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_SHORT[date.getMonth()];
  const year = date.getFullYear();

  if (options.withDay) {
    return `${dayName}, ${day} ${month} ${year}`;
  }
  if (options.withYear === false) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${year}`;
}

export function formatDeadlineFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const dayName = DAY_NAMES_ID[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_FULL[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

export type DeadlineUrgency = "urgent" | "warning" | "normal" | "passed";

export interface DeadlineStatus {
  label: string;
  badgeLabel: string;
  urgency: DeadlineUrgency;
  daysRemaining: number;
}

/**
 * Calculate remaining days and urgency status
 */
export function getDeadlineStatus(deadlineTimestamp: number): DeadlineStatus {
  const now = new Date();
  // Normalize both to start of day for clean day difference
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(deadlineTimestamp);
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  const diffMs = targetDate - nowDate;
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (days < 0) {
    const passedDays = Math.abs(days);
    return {
      label: `Lewat ${passedDays} hari`,
      badgeLabel: `Lewat ${passedDays} hr`,
      urgency: "passed",
      daysRemaining: days,
    };
  }

  if (days === 0) {
    return {
      label: "Hari ini adalah tenggat akhir",
      badgeLabel: "Hari Ini",
      urgency: "urgent",
      daysRemaining: 0,
    };
  }

  if (days === 1) {
    return {
      label: "Besok adalah batas akhir (H-1)",
      badgeLabel: "Besok (H-1)",
      urgency: "urgent",
      daysRemaining: 1,
    };
  }

  if (days <= 3) {
    return {
      label: `Tersisa ${days} hari lagi (H-${days})`,
      badgeLabel: `Sisa ${days} hr`,
      urgency: "warning",
      daysRemaining: days,
    };
  }

  return {
    label: `Tersisa ${days} hari lagi`,
    badgeLabel: `${formatDeadlineDate(deadlineTimestamp, { withYear: false })}`,
    urgency: "normal",
    daysRemaining: days,
  };
}

/**
 * Calculate the exact notification fire timestamp based on timing preset
 */
export function calculateReminderTimestamp(
  deadlineTimestamp: number,
  timing: "h3" | "h1" | "h0" | "custom",
  customTimestamp?: number | null
): number {
  if (timing === "custom" && customTimestamp) {
    return customTimestamp;
  }

  const deadline = new Date(deadlineTimestamp);
  const year = deadline.getFullYear();
  const month = deadline.getMonth();
  const date = deadline.getDate();

  if (timing === "h3") {
    // 3 days before deadline at 09:00 WIB
    const target = new Date(year, month, date - 3, 9, 0, 0);
    return target.getTime();
  }

  if (timing === "h1") {
    // 1 day before deadline at 09:00 WIB
    const target = new Date(year, month, date - 1, 9, 0, 0);
    return target.getTime();
  }

  // "h0" - On the day at 08:00 WIB
  const target = new Date(year, month, date, 8, 0, 0);
  return target.getTime();
}

/**
 * Human readable label for reminder timing
 */
export function getReminderTimingLabel(
  timing: "h3" | "h1" | "h0" | "custom" | null | undefined
): string {
  switch (timing) {
    case "h3":
      return "H-3 (09:00 WIB)";
    case "h1":
      return "H-1 (09:00 WIB)";
    case "h0":
      return "Hari H (08:00 WIB)";
    case "custom":
      return "Waktu Kustom";
    default:
      return "Belum diatur";
  }
}
