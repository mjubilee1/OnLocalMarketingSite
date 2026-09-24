import { useRef, useState } from 'react';
import { FileSignature, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, Card, Field, Input, Modal, PageHeader, Progress, Textarea } from '../../components/ui';
import { requirements } from '../../lib/readiness';
import { daysUntil, pct, uid } from '../../lib/utils';
import { useCatalog, useCompany, useStore } from '../../store';
import { fillPlaceholders, PLACEHOLDERS } from '../../lib/company';
import type { CertType, DocTemplate } from '../../types';

export default function Paperwork() {
  const staff = useStore((s) => s.staff);
  const upsertDoc = useStore((s) => s.upsertDoc);
  const deleteDoc = useStore((s) => s.deleteDoc);
  const upsertCert = useStore((s) => s.upsertCertType);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const [doc, setDoc] = useState<DocTemplate | null>(null);
  const [cert, setCert] = useState<CertType | null>(null);
  const company = useCompany();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  // Insert a placeholder at the cursor so managers never have to type the braces.
  const insertToken = (token: string) => {
    if (!doc) return;
    const el = bodyRef.current;
    const at = el ? el.selectionStart : doc.body.length;
    const end = el ? el.selectionEnd : at;
    setDoc({ ...doc, body: doc.body.slice(0, at) + token + doc.body.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + token.length, at + token.length);
    });
  };
  const current = staff.filter((s) => s.status !== 'inactive');

  return (
    <>
      <PageHeader title="Paperwork & certifications" sub="Documents crew e-sign on their phone, and the licences you need to see before they work." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileSignature size={18} /> E-sign documents
            </h2>
            <Button size="sm" onClick={() => setDoc({ id: uid('d-'), title: '', description: '', body: '' })}>
              <Plus size={14} /> New document
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {cat.docs.map((d) => {
              const need = current.filter((s) => requirements(s, cat).docIds.includes(d.id));
              const signed = need.filter((s) => s.docs[d.id]);
              return (
                <button key={d.id} onClick={() => setDoc(d)} className="block w-full px-5 py-4 text-left hover:bg-slate-50 cursor-pointer">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-sm text-slate-500">{d.description}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={pct(signed.length, need.length)} className="max-w-48" />
                    <span className="text-xs text-slate-500">
                      {signed.length}/{need.length} signed
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={18} /> Certifications & licences
            </h2>
            <Button size="sm" onClick={() => setCert({ id: uid('ct-'), name: '', description: '', validMonths: 12 })}>
              <Plus size={14} /> New type
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {cat.certTypes.map((ct) => {
              const held = staff.flatMap((s) => s.certs.filter((c) => c.certId === ct.id));
              const expiring = held.filter((c) => daysUntil(c.expiresAt) <= 30).length;
              const pending = held.filter((c) => !c.verified).length;
              return (
                <button key={ct.id} onClick={() => setCert(ct)} className="block w-full px-5 py-4 text-left hover:bg-slate-50 cursor-pointer">
                  <div className="font-medium">{ct.name}</div>
                  <div className="text-sm text-slate-500">
                    {ct.description} • valid {ct.validMonths} months
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-slate-600">{held.length} on file</span>
                    {pending > 0 && <span className="text-amber-600">{pending} awaiting verification</span>}
                    {expiring > 0 && <span className="text-rose-600">{expiring} expiring ≤30 days</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="m-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Crew get automatic reminders 30 days before a certificate expires. Expired certificates immediately mark them “not ready” for roles that need it.
          </p>
        </Card>
      </div>

      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.title || 'New document'} wide>
        {doc && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!doc.title.trim()) return;
              upsertDoc(doc);
              toast('Document saved', '✅');
              setDoc(null);
            }}
          >
            <Field label="Title">
              <Input value={doc.title} onChange={(e) => setDoc({ ...doc, title: e.target.value })} />
            </Field>
            <Field label="Short description">
              <Input value={doc.description} onChange={(e) => setDoc({ ...doc, description: e.target.value })} />
            </Field>
            <Field label="Document text" hint="Crew read this and sign with their finger. Changing it doesn't invalidate existing signatures.">
              <Textarea ref={bodyRef} rows={12} value={doc.body} onChange={(e) => setDoc({ ...doc, body: e.target.value })} />
            </Field>
            <div className="-mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500">Insert:</span>
              {PLACEHOLDERS.map((p) => (
                <button type="button" key={p.token} onClick={() => insertToken(p.token)} className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700 hover:bg-indigo-100 cursor-pointer" title={p.token}>
                  + {p.label}
                </button>
              ))}
            </div>
            {doc.body.includes('{{') && (
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Preview with your company profile</div>
                <div className="max-h-40 overflow-auto whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{fillPlaceholders(doc.body, company)}</div>
              </div>
            )}
            <div className="flex justify-between">
              {cat.docs.some((d) => d.id === doc.id) ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => {
                    if (confirm('Delete this document template?')) {
                      deleteDoc(doc.id);
                      setDoc(null);
                    }
                  }}
                >
                  <Trash2 size={16} /> Delete
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!cert} onClose={() => setCert(null)} title={cert?.name || 'New certification type'}>
        {cert && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!cert.name.trim()) return;
              upsertCert(cert);
              toast('Certification type saved', '✅');
              setCert(null);
            }}
          >
            <Field label="Name">
              <Input value={cert.name} onChange={(e) => setCert({ ...cert, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <Input value={cert.description} onChange={(e) => setCert({ ...cert, description: e.target.value })} />
            </Field>
            <Field label="Valid for (months)">
              <Input type="number" min={1} value={cert.validMonths} onChange={(e) => setCert({ ...cert, validMonths: +e.target.value })} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
