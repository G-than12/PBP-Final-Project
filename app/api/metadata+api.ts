import {
  extractDirectMetadata,
  isFetchableUrl,
  normalizeUrl,
} from "../../src/utils/metadataParser";

function isPrivateOrBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  // Block private IPv4 ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [, a, b] = ipv4.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31)
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const reqUrl = new URL(request.url);
    const targetRaw = reqUrl.searchParams.get("url") || "";

    if (!targetRaw || !isFetchableUrl(targetRaw)) {
      return Response.json(
        { error: "URL tidak valid" },
        { status: 400 }
      );
    }

    const normalized = normalizeUrl(targetRaw);
    const parsedTarget = new URL(normalized);

    if (isPrivateOrBlockedHost(parsedTarget.hostname)) {
      return Response.json(
        { error: "Host tidak diizinkan" },
        { status: 403 }
      );
    }

    const result = await extractDirectMetadata(normalized);
    return Response.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return Response.json(
      { error: "Gagal mengambil metadata tautan" },
      { status: 500 }
    );
  }
}

