import { useEffect, useRef, useState } from 'react';
import { Check, ImageOff, Loader2, Search } from 'lucide-react';
import { OnlocalMark } from './brand';
import { Button, Input, Modal } from './ui';
import { findCovers, toCover, type CoverResult, type CoverSearch, type PhotoSubject } from '../lib/images';
import { cn } from '../lib/utils';
import type { CoverImage } from '../types';

/** Pick a photo for a course cover or a card: AI suggests searches from the content, or the manager types their own. */
export function CoverPicker({
  open,
  subject,
  current,
  onClose,
  onPick,
}: {
  open: boolean;
  subject: PhotoSubject;
  current?: CoverImage;
  onClose: () => void;
  onPick: (c: CoverImage | undefined) => void;
}) {
  const [data, setData] = useState<CoverSearch | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<CoverResult | null>(null);
  const abort = useRef<AbortController | null>(null);

  const run = async (q?: string) => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setBusy(true);
    setError('');
    setChosen(null);
    try {
      const d = await findCovers(subject, q, ac.signal);
      setData((prev) => (q && prev ? { ...d, queries: prev.queries } : d));
      if (!d.results.length) setError('No photos found. Try a simpler search, like “bartender” or “festival crowd”.');
    } catch (e) {
      if (!ac.signal.aborted) setError((e as Error).message);
    } finally {
      if (!ac.signal.aborted) setBusy(false);
    }
  };

  useEffect(() => {
    if (open && !data) run();
    if (!open) abort.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={subject.purpose === 'lesson' ? `Photo for “${subject.title}”` : 'Choose a cover photo'} wide>
      <div className="space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) run(query.trim());
          }}
        >
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search photos, e.g. festival security" className="h-10 pl-9!" />
          </div>
          <Button type="submit" variant="secondary" disabled={busy || !query.trim()}>
            Search
          </Button>
          <Button type="button" onClick={() => run()} disabled={busy} className="bg-gradient-to-r from-indigo-600 to-violet-600">
            <OnlocalMark size={16} /> Suggest with onlocalAI
          </Button>
        </form>

        {data?.queries.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <OnlocalMark size={12} className="text-violet-500" /> {data.ai ? 'onlocalAI searched for' : 'Searched for'}
            </span>
            {data.queries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  run(q);
                }}
                className="cursor-pointer rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700 hover:bg-violet-100"
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}

        <div className="min-h-64">
          {busy ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="aspect-[16/9] animate-pulse rounded-lg bg-slate-100" />
              ))}
              <div className="col-span-full flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> {subject.purpose === 'lesson' ? 'onlocalAI is reading the card and finding photos…' : 'onlocalAI is reading the course and finding photos…'}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-slate-500">
              <ImageOff size={28} className="text-slate-300" />
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data?.results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setChosen(r)}
                  className={cn(
                    'group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-lg bg-slate-100 ring-2 transition',
                    chosen?.id === r.id ? 'ring-indigo-600' : 'ring-transparent hover:ring-slate-300',
                  )}
                  title={r.alt}
                >
                  <img src={r.thumb} alt={r.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-left text-[10px] text-white/90">{r.credit}</span>
                  {chosen?.id === r.id && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <div className="flex gap-2">
            {current && (
              <Button
                variant="ghost"
                onClick={() => {
                  onPick(undefined);
                  onClose();
                }}
              >
                Remove photo
              </Button>
            )}
            <Button
              disabled={!chosen}
              onClick={() => {
                if (!chosen) return;
                onPick(toCover(chosen));
                onClose();
              }}
            >
              Use this photo
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
