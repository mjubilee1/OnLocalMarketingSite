import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Clock, FileSignature, GraduationCap } from 'lucide-react';
import { Button, Card, Field, Input, Select } from '../components/ui';
import { PhotoInput } from '../components/photoInput';
import { phoneOk } from '../lib/profile';
import { Logo } from '../layouts/AdminLayout';
import { roleTimeToReady } from '../lib/readiness';
import { cn, color, LANGUAGES } from '../lib/utils';
import { useCatalog, useStore } from '../store';


export default function Join() {
  const { code } = useParams();
  const inviteCode = useStore((s) => s.inviteCode);
  const orgName = useStore((s) => s.orgName);
  const createStaff = useStore((s) => s.createStaff);
  const setCurrent = useStore((s) => s.setCurrentStaff);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const nav = useNavigate();
  const acceptInvite = useStore((s) => s.acceptInvite);
  // A personal invite link (?invite=token) pre-fills the form and completes the existing invited record.
  const [params] = useSearchParams();
  const token = params.get('invite');
  const invited = useStore((s) => (token ? s.staff.find((x) => x.inviteToken === token) : undefined));
  const [form, setForm] = useState(() => ({
    name: invited?.name ?? '',
    email: invited?.email ?? '',
    phone: invited?.phone ?? '',
    photo: invited?.photo ?? '',
    language: invited?.language ?? 'English',
  }));
  const [tried, setTried] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>(() => invited?.roleIds ?? []);

  const valid = code?.toUpperCase() === inviteCode;
  const canSubmit = !!form.name.trim() && form.email.includes('@') && phoneOk(form.phone) && !!form.photo && roleIds.length > 0;

  if (!valid)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-sm p-8 text-center">
          <div className="text-4xl">🔗</div>
          <h1 className="mt-3 text-lg font-semibold">This invite link isn't valid</h1>
          <p className="mt-1 text-sm text-slate-500">Ask your crew manager for a new link or QR code.</p>
        </Card>
      </div>
    );

  // Already signed up (e.g. they tapped the link in a reminder email): take them straight to their app.
  if (invited && invited.status !== 'invited')
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-600 to-indigo-800 p-6">
        <Card className="max-w-sm p-8 text-center">
          <div className="text-4xl">👋</div>
          <h1 className="mt-3 text-lg font-semibold">Welcome back, {invited.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">You've already joined the {orgName} crew. Pick up where you left off.</p>
          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() => {
              setCurrent(invited.id);
              nav('/app');
            }}
          >
            Continue onboarding
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center rounded-xl bg-white/95 py-3">
          <Logo />
        </div>
        <Card className="p-6">
          <h1 className="text-xl font-bold text-slate-900">{invited ? `${invited.name.split(' ')[0]}, you're invited to the ${orgName} crew` : `Join the ${orgName} crew`}</h1>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
            {[
              { icon: FileSignature, t: 'E-sign docs' },
              { icon: GraduationCap, t: 'Quick training' },
              { icon: Clock, t: 'Pick shifts' },
            ].map((x) => (
              <div key={x.t} className="rounded-lg bg-slate-50 p-2">
                <x.icon size={18} className="mx-auto mb-1 text-indigo-600" />
                {x.t}
              </div>
            ))}
          </div>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (!canSubmit) return;
              const details = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), roleIds };
              let id: string;
              if (invited) {
                acceptInvite(invited.id, details);
                id = invited.id;
              } else id = createStaff(details);
              setCurrent(id);
              toast(`Welcome to the crew, ${form.name.split(' ')[0]}!`, '🎉');
              nav('/app');
            }}
          >
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Your photo <span className="text-rose-500">*</span>
              </span>
              <PhotoInput value={form.photo} onChange={(photo) => setForm({ ...form, photo })} invalid={tried} name={form.name} />
            </div>
            <Field label="Full name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jamie Smith" autoComplete="name" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@mail.com" autoComplete="email" />
              </Field>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Mobile <span className="text-rose-500">*</span>
                </span>
                <Input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={tried && !phoneOk(form.phone) ? 'border-rose-300!' : undefined}
                />
                {tried && !phoneOk(form.phone) && <span className="mt-1 block text-xs text-rose-600">Enter a valid mobile number.</span>}
              </label>
            </div>
            <Field label="Preferred language">
              <Select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">What would you like to work as?</span>
              <div className="space-y-2">
                {cat.roles.map((r) => {
                  const on = roleIds.includes(r.id);
                  const c = color(r.color);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRoleIds(on ? roleIds.filter((x) => x !== r.id) : [...roleIds, r.id])}
                      className={cn('flex w-full items-center gap-3 rounded-lg p-3 text-left ring-1 transition cursor-pointer', on ? `${c.soft} ring-2 ${c.ring}` : 'ring-slate-200 hover:bg-slate-50')}
                    >
                      <div className={cn('flex h-5 w-5 items-center justify-center rounded border', on ? `${c.bg} border-transparent text-white` : 'border-slate-300')}>
                        {on && <Check size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500">
                          ${r.hourlyRate}/hr • ~{roleTimeToReady(r, cat)} min to get ready
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {tried && !roleIds.length && <p className="text-xs text-rose-600">Pick at least one role.</p>}
            <Button type="submit" size="lg" className="w-full">
              Create my crew profile
            </Button>
            <p className="text-center text-xs text-slate-400">By continuing you agree to receive shift and onboarding emails. You can opt out any time.</p>
          </form>
        </Card>
      </div>
    </div>
  );
}
