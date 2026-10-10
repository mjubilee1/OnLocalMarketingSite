import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Field, Input, PageHeader } from '../../components/ui';
import { useCompany, useStore } from '../../store';
import { uid } from '../../lib/utils';
import { ItemSwatch } from '../../training/ItemSwatch';
import { lookFromColor, type ItemStyle } from '../../training/items';
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

  const look = lookFromColor(color, shape);

  const add = () => {
    const name = label.trim();
    if (name.length < 2) return;
    save({ id: uid('lib-'), label: name, group, look });
    toast(`Added ${name} to your library`, '📦');
    setLabel('');
  };

  const colors = [brand, ...PRESETS.filter((c) => c.toLowerCase() !== brand.toLowerCase())];

  return (
    <div>
      <PageHeader
        title={`${company.name} library`}
        sub="Your pieces. Name, color, shape — no designer and no photos of people."
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
        <h2 className="font-semibold text-slate-900">Add a piece</h2>
        <p className="mt-1 text-sm text-slate-500">“House vinaigrette.” “Gaylord napkin.” “DND sign.” Then it shows up in every setup card.</p>
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
                <button key={c} type="button" onClick={() => setColor(c)} className="h-8 w-8 rounded-full ring-1 ring-slate-200" style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
            <ItemSwatch kind="custom" look={look} className="h-10 w-10" />
          </div>
          <Button onClick={add} disabled={label.trim().length < 2}>
            <Plus size={16} /> Add to my library
          </Button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-slate-900">Yours ({mine.length})</h2>
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
