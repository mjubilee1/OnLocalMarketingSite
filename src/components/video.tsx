import { useEffect, useRef, useState } from 'react';
import { CircleCheck, ExternalLink, Loader2, TriangleAlert, Video } from 'lucide-react';
import { Input } from './ui';
import { cn } from '../lib/utils';
import { fetchVideoMeta, parseVideo, PROVIDER_LABEL, SUPPORTED_HINT, type VideoMeta } from '../lib/video';

/** Plays any supported link. Unknown or empty links show a placeholder instead of a broken frame. */
export function VideoEmbed({ url, title, className, showOpenLink }: { url?: string; title: string; className?: string; showOpenLink?: boolean }) {
  const v = parseVideo(url);
  return (
    <div className={className}>
      <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
        {!v ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
            <Video size={28} />
            <span className="text-xs">{url ? 'Unsupported video link' : 'Add a video link'}</span>
          </div>
        ) : v.provider === 'file' ? (
          <video src={v.embedUrl} controls playsInline preload="metadata" className="h-full w-full" title={title} />
        ) : (
          <iframe
            src={v.embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            // YouTube refuses to play embeds that send no referrer.
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        )}
      </div>
      {v && showOpenLink && v.provider !== 'file' && (
        <a href={v.watchUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600">
          Video not playing? Open on {PROVIDER_LABEL[v.provider]} <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

/**
 * Link field that recognises the provider as you type and looks up the title,
 * so managers can paste a normal share link rather than hunting for an embed code.
 */
export function VideoLinkInput({
  value,
  onChange,
  onMeta,
  placeholder = 'Paste a YouTube, Vimeo, Loom or Google Drive link',
  autoFocus,
}: {
  value: string;
  onChange: (url: string) => void;
  onMeta?: (meta: VideoMeta) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const v = parseVideo(value);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const lastLooked = useRef('');
  const onMetaRef = useRef(onMeta);
  onMetaRef.current = onMeta;

  useEffect(() => {
    if (!v || v.watchUrl === lastLooked.current) return;
    lastLooked.current = v.watchUrl;
    let live = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const m = await fetchVideoMeta(v.watchUrl);
      if (!live) return;
      setMeta(m);
      setLoading(false);
      onMetaRef.current?.(m);
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
      setLoading(false);
      lastLooked.current = '';
    };
  }, [v?.watchUrl]);

  return (
    <div>
      <Input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode="url" />
      <div className={cn('mt-1.5 flex min-h-5 items-center gap-1.5 text-xs', v ? 'text-emerald-700' : value.trim() ? 'text-amber-700' : 'text-slate-500')}>
        {v ? (
          <>
            <CircleCheck size={13} /> {PROVIDER_LABEL[v.provider]} video
            {loading && <Loader2 size={12} className="animate-spin text-slate-400" />}
            {meta?.title && <span className="truncate text-slate-500">— “{meta.title}”</span>}
          </>
        ) : value.trim() ? (
          <>
            <TriangleAlert size={13} /> Couldn't recognise this link. Supported: {SUPPORTED_HINT}.
          </>
        ) : (
          <>Supported: {SUPPORTED_HINT}.</>
        )}
      </div>
    </div>
  );
}
