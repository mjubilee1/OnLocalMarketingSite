/**
 * Turns the links managers actually paste (share links, watch pages, shorts, Drive files)
 * into something embeddable. Shared by the browser and the server (for title lookups).
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'drive' | 'file';

export interface VideoInfo {
  provider: VideoProvider;
  id: string;
  embedUrl: string;
  /** Canonical public page, used for "open in new tab" and oEmbed lookups. */
  watchUrl: string;
  thumbnail?: string;
}

export const PROVIDER_LABEL: Record<VideoProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  loom: 'Loom',
  drive: 'Google Drive',
  file: 'Video file',
};

export const SUPPORTED_HINT = 'YouTube, Vimeo, Loom, Google Drive, or a direct .mp4 / .webm link';

/** "1m30s", "90", "90s", "1h2m3s" → seconds */
function parseStart(t: string | null): number {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return +t;
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + +(m[3] ?? 0) : 0;
}

export function parseVideo(input: string | undefined): VideoInfo | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^(www|m)\./, '').toLowerCase();
  const parts = u.pathname.split('/').filter(Boolean);

  // YouTube: watch?v=, youtu.be/, shorts/, embed/, live/, nocookie
  if (['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'music.youtube.com'].includes(host)) {
    let id: string | undefined;
    if (host === 'youtu.be') id = parts[0];
    else if (parts[0] === 'watch') id = u.searchParams.get('v') ?? undefined;
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1];
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    const start = parseStart(u.searchParams.get('t') ?? u.searchParams.get('start'));
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${start ? `&start=${start}` : ''}`,
      watchUrl: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo: vimeo.com/123, vimeo.com/123/abcdef (unlisted hash), player.vimeo.com/video/123?h=abc
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const i = host === 'player.vimeo.com' ? parts.indexOf('video') + 1 : parts.findIndex((p) => /^\d+$/.test(p));
    const id = parts[i];
    if (!id || !/^\d+$/.test(id)) return null;
    const hash = u.searchParams.get('h') ?? (host === 'vimeo.com' && /^[a-f0-9]{6,}$/i.test(parts[i + 1] ?? '') ? parts[i + 1] : undefined);
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`,
      watchUrl: `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`,
    };
  }

  // Loom: loom.com/share/<id> or /embed/<id>
  if (host === 'loom.com') {
    const id = ['share', 'embed'].includes(parts[0] ?? '') ? parts[1] : undefined;
    if (!id || !/^[a-f0-9]{16,}$/i.test(id)) return null;
    return { provider: 'loom', id, embedUrl: `https://www.loom.com/embed/${id}`, watchUrl: `https://www.loom.com/share/${id}` };
  }

  // Google Drive: file/d/<id>/view, open?id=<id>, uc?id=<id>
  if (host === 'drive.google.com') {
    const id = parts[0] === 'file' && parts[1] === 'd' ? parts[2] : u.searchParams.get('id') ?? undefined;
    if (!id || !/^[\w-]{10,}$/.test(id)) return null;
    return { provider: 'drive', id, embedUrl: `https://drive.google.com/file/d/${id}/preview`, watchUrl: `https://drive.google.com/file/d/${id}/view` };
  }

  // Direct video file
  if (/\.(mp4|webm|ogv|ogg|mov|m4v)$/i.test(u.pathname)) {
    return { provider: 'file', id: u.href, embedUrl: u.href, watchUrl: u.href };
  }
  return null;
}

/** Only these fixed endpoints are ever fetched server-side, built from the parsed id (no SSRF). */
export function oembedEndpoint(v: VideoInfo): string | null {
  const q = encodeURIComponent(v.watchUrl);
  if (v.provider === 'youtube') return `https://www.youtube.com/oembed?format=json&url=${q}`;
  if (v.provider === 'vimeo') return `https://vimeo.com/api/oembed.json?url=${q}`;
  if (v.provider === 'loom') return `https://www.loom.com/v1/oembed?url=${q}`;
  return null;
}

export interface VideoMeta {
  title?: string;
  author?: string;
  thumbnail?: string;
  durationSec?: number;
}

/** Browser helper: asks our server for the video's title (providers block direct browser lookups). */
export async function fetchVideoMeta(url: string): Promise<VideoMeta> {
  try {
    const r = await fetch(`/api/video/info?url=${encodeURIComponent(url)}`);
    return r.ok ? await r.json() : {};
  } catch {
    return {};
  }
}
