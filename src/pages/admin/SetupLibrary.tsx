import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eraser, Images, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button, Field, Input, PageHeader } from '../../components/ui';
import { cutoutBoardDataUrl, fitBoardPhoto } from '../../lib/profile';
import { useCompany, useStore } from '../../store';
import { uid } from '../../lib/utils';
import { cleanStoredPhotos } from '../../training/cleanStoredPhotos';
import { ItemSwatch } from '../../training/ItemSwatch';
import { lookFromColor, lookFromCutout, lookFromImage, type ItemStyle } from '../../training/items';
import type { CustomLibraryItem } from '../../training/types';

const SHAPES: { id: ItemStyle['shape']; label: string }[] = [
  { id: 'circle', label: 'Round' },
  { id: 'ellipse', label: 'Oval' },
  { id: 'rect', label: 'Box' },
];

const SHELVES = [
  { id: 'plate' as const, label: 'Plate' },
  { id: 'table' as const, label: 'Table' },
  { id: 'station' as const, label: 'Station' },
];

const PRESETS = ['#4f46e5', '#d97706', '#16a34a', '#dc2626', '#0284c7', '#7c3aed', '#0f766e', '#1e293b', '#f8fafc'];

/** Filename → readable label: "house-vinaigrette.JPG" → "House vinaigrette" */
const labelFromFile = (name: string) => {
  const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cleaned = base || 'Untitled';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function SetupLibrary() {
  const company = useCompany();
  const mine = useStore((s) => s.customLibrary);
  const brand = useStore((s) => s.libraryBrand);
  const save = useStore((s) => s.saveLibraryItem);
  const remove = useStore((s) => s.removeLibraryItem);
  const setBrand = useStore((s) => s.setLibraryBrand);
  const toast = useStore((s) => s.toast);
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState<CustomLibraryItem['group']>('plate');
  const [shape, setShape] = useState<ItemStyle['shape']>('circle');
  const [color, setColor] = useState(brand);
  const [image, setImage] = useState('');
  const [imageError, setImageError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [cleanBusy, setCleanBusy] = useState(false);
  const [cleanAllBusy, setCleanAllBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  const look = image ? lookFromImage(image, shape) : lookFromColor(color, shape);

  const reset = () => {
    setLabel('');
    setGroup('plate');
    setShape('circle');
    setColor(brand);
    setImage('');
    setImageError('');
    setEditing(null);
  };

  const add = async () => {
    const name = label.trim();
    if (name.length < 2) return;
    const nextLook = image ? await lookFromCutout(image, shape) : look;
    save({ id: editing ?? uid('lib-'), label: name, group, look: nextLook });
    toast(editing ? `Updated ${name}` : `Added ${name} to your library`, '📦');
    reset();
  };

  const eraseAllStored = async () => {
    if (cleanAllBusy) return;
    setCleanAllBusy(true);
    try {
      const st = useStore.getState();
      const { library, boards } = await cleanStoredPhotos({
        customLibrary: st.customLibrary,
        trainingEdits: st.trainingEdits ?? {},
        trainingDrafts: st.trainingDrafts ?? {},
        saveLibraryItem: st.saveLibraryItem,
        saveTrainingDraft: st.saveTrainingDraft,
        patchTrainingEdit: (spec) =>
          useStore.setState((s) => ({ trainingEdits: { ...s.trainingEdits, [spec.id]: spec } })),
      });
      toast(
        library || boards
          ? `Erased backgrounds on ${library} library photo${library === 1 ? '' : 's'}${boards ? ` · ${boards} on boards` : ''}`
          : 'No photos needed cleaning',
        '✨',
      );
      return { library, boards };
    } finally {
      setCleanAllBusy(false);
    }
  };

  useEffect(() => {
    const w = window as unknown as { __onlocalEraseLibrary?: () => Promise<{ library: number; boards: number }> };
    w.__onlocalEraseLibrary = async () => {
      const st = useStore.getState();
      const result = await cleanStoredPhotos({
        customLibrary: st.customLibrary,
        trainingEdits: st.trainingEdits ?? {},
        trainingDrafts: st.trainingDrafts ?? {},
        saveLibraryItem: st.saveLibraryItem,
        saveTrainingDraft: st.saveTrainingDraft,
        patchTrainingEdit: (spec) => useStore.setState((s) => ({ trainingEdits: { ...s.trainingEdits, [spec.id]: spec } })),
      });
      st.toast(
        result.library || result.boards
          ? `Erased backgrounds on ${result.library} library photo${result.library === 1 ? '' : 's'}${result.boards ? ` · ${result.boards} on boards` : ''}`
          : 'No photos needed cleaning',
        '✨',
      );
      return result;
    };
    return () => {
      delete w.__onlocalEraseLibrary;
    };
  }, []);

  const edit = (it: CustomLibraryItem) => {
    setEditing(it.id);
    setLabel(it.label);
    setGroup(it.group);
    setShape(it.look.shape === 'diamond' ? 'rect' : it.look.shape);
    setColor(it.look.fill);
    setImage(it.look.image ?? '');
    setImageError('');
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setImageError('');
    try {
      setImage(await fitBoardPhoto(file));
    } catch (e) {
      setImageError((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const cleanBackground = async () => {
    if (!image || cleanBusy) return;
    setCleanBusy(true);
    setImageError('');
    try {
      setImage(await cutoutBoardDataUrl(image));
    } catch (e) {
      setImageError((e as Error).message);
    } finally {
      setCleanBusy(false);
    }
  };

  const bulkAdd = async (list: FileList | null) => {
    if (!list?.length) return;
    setBulkBusy(true);
    setBulkError('');
    let ok = 0;
    let fail = 0;
    for (const file of Array.from(list)) {
      try {
        const data = await fitBoardPhoto(file);
        const name = labelFromFile(file.name);
        save({ id: uid('lib-'), label: name.length >= 2 ? name : 'Untitled', group, look: await lookFromCutout(data, shape) });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    if (bulkRef.current) bulkRef.current.value = '';
    setBulkBusy(false);
    if (ok) toast(`Added ${ok} piece${ok === 1 ? '' : 's'} to your library`, '📦');
    if (fail) setBulkError(`${fail} photo${fail === 1 ? '' : 's'} couldn’t be read. Try JPG or PNG.`);
  };

  const colors = [brand, ...PRESETS.filter((c) => c.toLowerCase() !== brand.toLowerCase())];

  return (
    <div>
      <PageHeader
        title={`${company.name} library`}
        sub="Name a piece, pick a color, or drop in your own photo. It shows up on every setup card under Yours."
        actions={
          <Link to="/admin/setup/new" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
            Use on a card
          </Link>
        }
      />

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-900">House color</h2>
        <p className="mt-1 text-sm text-slate-500">New items can use this so every property looks like you.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setBrand(c);
                setColor(c);
              }}
              className="h-8 w-8 rounded-full ring-2 ring-offset-2"
              style={{ background: c, boxShadow: brand === c ? `0 0 0 2px ${c}` : undefined }}
              aria-label={c}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-900">{editing ? 'Edit piece' : 'Add a piece'}</h2>
        <p className="mt-1 text-sm text-slate-500">“House vinaigrette.” “Gaylord napkin.” “DND sign.” A photo is optional — a logo, a place setting, a branded item.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="What do you call it?">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="House salad" />
          </Field>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">Shelf</div>
            <div className="flex flex-wrap gap-2">
              {SHELVES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setGroup(s.id)}
                  className={`rounded-full px-3 py-1.5 text-sm ${group === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">Shape</div>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  className={`rounded-full px-3 py-1.5 text-sm ${shape === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">Color</div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    setImage('');
                  }}
                  className="h-8 w-8 rounded-full ring-1 ring-slate-200"
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{image ? 'A photo replaces the color. Pick a color to go back to a shape.' : 'Used when you don’t add a photo.'}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 text-sm font-medium text-slate-700">Photo</div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300"
            >
              {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} className="text-slate-400" />}
            </button>
            <div>
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                {image ? 'Replace photo' : 'Upload photo'}
              </Button>
              {image && (
                <>
                  <Button type="button" variant="secondary" className="ml-2" disabled={cleanBusy} onClick={cleanBackground}>
                    {cleanBusy ? <Loader2 size={14} className="animate-spin" /> : null}
                    {cleanBusy ? 'Cleaning…' : 'Erase background'}
                  </Button>
                  <button type="button" className="ml-2 cursor-pointer text-sm text-slate-500 hover:text-slate-800" onClick={() => setImage('')}>
                    <X size={14} className="mr-0.5 inline" /> Use a shape instead
                  </button>
                </>
              )}
              <p className="mt-1.5 text-xs text-slate-500">Any photo works — we fit it and clear empty white backdrop so you just see the item.</p>
              {imageError && <p className="mt-1 text-xs text-rose-600">{imageError}</p>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
            <ItemSwatch kind="custom" look={look} className="h-10 w-10" />
          </div>
          <Button onClick={add} disabled={label.trim().length < 2}>
            <Plus size={16} /> {editing ? 'Save changes' : 'Add to my library'}
          </Button>
          {editing && (
            <button type="button" className="cursor-pointer text-sm text-slate-500 hover:text-slate-800" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </section>

      {!editing && (
        <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Bulk add photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Drop in a whole batch from a photo day. We fit each one and name it from the file — rename anytime below. Uses the shelf and shape selected above.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" disabled={bulkBusy} onClick={() => bulkRef.current?.click()}>
              {bulkBusy ? <Loader2 size={16} className="animate-spin" /> : <Images size={16} />}
              {bulkBusy ? 'Adding…' : 'Choose multiple photos'}
            </Button>
            <span className="text-xs text-slate-500">
              Shelf: <span className="font-medium capitalize text-slate-700">{group}</span>
              {' · '}
              Shape: <span className="font-medium text-slate-700">{SHAPES.find((s) => s.id === shape)?.label}</span>
            </span>
          </div>
          {bulkError && <p className="mt-2 text-xs text-rose-600">{bulkError}</p>}
          <input
            ref={bulkRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={(e) => bulkAdd(e.target.files)}
          />
        </section>
      )}

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Yours ({mine.length})</h2>
          {mine.some((it) => it.look.image) && (
            <Button type="button" variant="secondary" size="sm" disabled={cleanAllBusy} onClick={eraseAllStored}>
              {cleanAllBusy ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} />}
              {cleanAllBusy ? 'Erasing…' : 'Erase all backgrounds'}
            </Button>
          )}
        </div>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nothing custom yet. The starter kit (chicken, glasses, urns) is already on every card.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((it) => (
              <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <ItemSwatch kind={it.id} look={it.look} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{it.label}</div>
                  <div className="text-xs capitalize text-slate-500">{it.group}</div>
                </div>
                <button type="button" onClick={() => edit(it)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${it.label}`}>
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => remove(it.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${it.label}`}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
