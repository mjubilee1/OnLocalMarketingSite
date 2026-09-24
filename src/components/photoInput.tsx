import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { resizePhoto } from '../lib/profile';
import { cn } from '../lib/utils';

/** Round photo picker. On phones the file input offers the camera or the photo library. */
export function PhotoInput({ value, onChange, invalid, name }: { value?: string; onChange: (dataUrl: string) => void; invalid?: boolean; name?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await resizePhoto(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          'group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-offset-2 transition',
          invalid && !value ? 'ring-rose-300' : value ? 'ring-indigo-200' : 'ring-slate-200 hover:ring-indigo-300',
        )}
        aria-label={value ? 'Change photo' : 'Add photo'}
      >
        {value ? <img src={value} alt={name ? `${name}'s photo` : 'Your photo'} className="h-full w-full object-cover" /> : <Camera size={28} className="text-slate-400" />}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 size={22} className="animate-spin text-indigo-600" />
          </span>
        )}
      </button>
      <div className="min-w-0">
        <button type="button" onClick={() => ref.current?.click()} className="cursor-pointer rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          {value ? 'Change photo' : 'Take or upload a photo'}
        </button>
        {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : invalid && !value && <p className="mt-1.5 text-xs text-rose-600">A photo is required.</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
