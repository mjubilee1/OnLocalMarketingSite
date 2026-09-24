import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck, FileText, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import { ContractPdfActions, ContractStagePill, ContractSummary, SignContractModal } from '../../components/contract';
import { stage, TEMPLATE_NAME } from '../../lib/contracts';
import { fmtDate, fmtTime } from '../../lib/utils';
import { useCurrentStaff, useStore } from '../../store';

export default function ContractSign() {
  const { id } = useParams();
  const me = useCurrentStaff();
  const c = useStore((s) => s.contracts.find((x) => x.id === id));
  const save = useStore((s) => s.saveContract);
  const [address, setAddress] = useState(c?.staff.address ?? '');
  const [signing, setSigning] = useState(false);
  const [reading, setReading] = useState(false);

  // Crew only ever see contracts addressed to them, and never unsent drafts.
  if (!c || c.staffId !== me.id || c.status === 'draft') return <div className="p-8 text-center text-slate-500">Contract not found.</div>;
  const st = stage(c);
  const mine = c.staff;
  const canSign = !mine.signedAt && c.status !== 'void';

  const openFull = async () => {
    setReading(true);
    try {
      const m = await import('../../lib/contractPdf');
      const url = await m.contractPreviewUrl(c);
      // New tab works on desktop and hands off to the PDF viewer on phones.
      window.open(url, '_blank', 'noopener');
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-28px)] flex-col bg-white">
      <div className="sticky top-7 z-10 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link to="/app" className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{c.title}</div>
          <div className="text-xs text-slate-500">{TEMPLATE_NAME}</div>
        </div>
        <ContractStagePill c={c} />
      </div>

      <div className="flex-1 space-y-4 px-4 py-5">
        {st === 'completed' ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <CircleCheck className="mx-auto text-emerald-500" size={30} />
            <div className="mt-1 font-semibold text-emerald-800">Signed by both parties</div>
            <div className="text-xs text-emerald-700">Download your copy for your records.</div>
          </div>
        ) : mine.signedAt ? (
          <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
            You signed on {fmtDate(mine.signedAt)} at {fmtTime(mine.signedAt)}. We'll let you know when {c.employer.name} countersigns.
          </div>
        ) : c.status === 'void' ? (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">This contract was cancelled and is no longer valid.</div>
        ) : (
          <p className="text-sm text-slate-600">
            {c.employer.name} has sent you a contract. Check the key terms below, read the full contract, then sign.
          </p>
        )}

        <Card className="px-4 py-2">
          <ContractSummary c={c} />
        </Card>

        <button onClick={openFull} className="flex w-full items-center gap-3 rounded-xl p-4 text-left ring-1 ring-slate-200 active:bg-slate-50 cursor-pointer">
          {reading ? <Loader2 size={20} className="animate-spin text-indigo-600" /> : <FileText size={20} className="text-indigo-600" />}
          <div className="flex-1">
            <div className="text-sm font-medium">Read the full contract (5 pages)</div>
            <div className="text-xs text-slate-500">Includes the standard clauses: confidentiality, safety, taxes, independent contractor status and more.</div>
          </div>
        </button>

        {canSign && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Your mailing address</span>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => address.trim() !== mine.address && save({ ...c, staff: { ...mine, address: address.trim() } }, 'Service Provider added their mailing address')}
              placeholder="Street, city, state, ZIP"
              autoComplete="street-address"
            />
            <span className="mt-1 block text-xs text-slate-500">Printed in section 1 of the contract.</span>
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          <ContractPdfActions c={c} size="sm" preview={false} />
        </div>
      </div>

      {canSign && (
        <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4">
          <Button
            size="lg"
            className="w-full"
            disabled={!address.trim()}
            onClick={() => {
              if (address.trim() !== mine.address) save({ ...c, staff: { ...mine, address: address.trim() } }, 'Service Provider added their mailing address');
              setSigning(true);
            }}
          >
            {address.trim() ? 'Review & sign' : 'Add your address to sign'}
          </Button>
        </div>
      )}
      <SignContractModal open={signing} onClose={() => setSigning(false)} c={useStore.getState().contracts.find((x) => x.id === c.id) ?? c} party="staff" />
    </div>
  );
}
