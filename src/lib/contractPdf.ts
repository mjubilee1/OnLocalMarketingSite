/**
 * Fills the Event Planning Service Contract PDF (a fillable AcroForm) with a contract's terms,
 * stamps both signatures onto the page-5 signature lines, and appends a signing certificate.
 * pdf-lib is loaded on demand so it isn't in the main bundle.
 */
import type { Contract, ContractParty } from '../types';
import { stage, TEMPLATE_NAME, TEMPLATE_URL, usDate } from './contracts';

/** Exact field names inside the template (note the curly apostrophes in some). */
export const CONTRACT_FIELDS = {
  providerName: "What's the service provider’s full name?",
  providerAddress: "What's the service provider’s mailing address?",
  clientName: "What's the client’s full name?",
  clientAddress: "What's the client’s mailing address?",
  effectiveDate: "What's the effective date of this agreement?",
  startDate: "What's the start date?",
  endDate: "What's the end date?",
  endOther: 'How will this agreement be terminated?',
  endType: 'When will this agreement end?',
  services: 'What services will the service provider perform?',
  payHourly: 'Will the service provider be paid by the hour?',
  hourlyRate: "What's the hourly rate?",
  payPerJob: 'Will the service provider be paid per job?',
  jobAmount: 'What total amount ($) will the provider receive?',
  payOther: 'Will the service provider be compensated in some other manner?',
  payOtherText: 'How will the service provider be paid?',
  paymentPlan: "What's the payment plan?",
  frequency: "What's the frequency of the payment plan?",
  planStart: 'On what date will the payment plan begin?',
  planOther: 'What other payment plan will be implemented?',
  retainer: 'Does the client have to pay a retainer?',
  retainerAmount: "What's the amount ($) of the retainer?",
  retainerRefundable: 'Is the retainer refundable?',
  noticeDays: 'How many days’ notice is required to terminate?',
  governingState: 'Which state laws will govern this agreement?',
  additionalTerms: 'Are there any additional terms and conditions?',
  clientSignDate: 'On what date did the client sign this agreement?',
  clientPrintName: "What's the full printed name of the client?",
  providerSignDate: 'On what date did the service provider sign this agreement?',
  providerPrintName: "What's the full printed name of the service provider?",
} as const;

const F = CONTRACT_FIELDS;

/** Where the signature images go on page 5 (PDF points, origin bottom-left), measured from the template. */
const SIG_BOX = {
  client: { page: 4, x: 190, y: 596, w: 150, h: 24 },
  provider: { page: 4, x: 232, y: 533, w: 150, h: 24 },
};

// Characters the built-in Helvetica (WinAnsi) can encode beyond Latin-1.
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
/** Keep text printable with the standard PDF fonts: fold punctuation, strip accents we can't encode. */
export function pdfSafe(s: string): string {
  return Array.from(
    s
      .replace(/[‘’‛′]/g, "'")
      .replace(/[“”‟″]/g, '"')
      .replace(/[–—−]/g, '-')
      .replace(/…/g, '...')
      .replace(/[   \t]/g, ' ')
      .replace(/\r/g, ''),
  )
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (ch === '\n' || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(ch)) return ch;
      const folded = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
      return folded && Array.from(folded).every((c) => c.codePointAt(0)! < 0x7f) ? folded : '?';
    })
    .join('');
}

/** Render a typed signature in the handwriting font used across the app, as a PNG. */
async function typedSignaturePng(name: string): Promise<string> {
  try {
    await document.fonts.load('64px Caveat');
  } catch {
    /* fall back to cursive */
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = '64px Caveat, cursive';
  const w = Math.ceil(ctx.measureText(name).width) + 24;
  canvas.width = Math.max(w, 60);
  canvas.height = 90;
  ctx.font = '64px Caveat, cursive';
  ctx.fillStyle = '#1e1b4b';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 12, 48);
  return canvas.toDataURL('image/png');
}

/**
 * A drawn signature is mostly empty canvas. Crop to the ink (plus a little padding) so it
 * fills the signature line instead of shrinking to an invisible scribble.
 */
async function trimInk(dataUrl: string): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3]! > 16) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return dataUrl;
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04) + 2;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(width - 1, x1 + pad);
  y1 = Math.min(height - 1, y1 + pad);
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext('2d')!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

export interface BuildOptions {
  /** Unfilled template for offline use. */
  blank?: boolean;
}

export async function buildContractPdf(c: Contract | null, opts: BuildOptions = {}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
  const bytes = await fetch(TEMPLATE_URL).then((r) => {
    if (!r.ok) throw new Error('Contract template not found');
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(bytes);
  if (opts.blank || !c) return pdf.save();

  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const t = c.terms;

  const text = (name: string, value: string) => {
    try {
      form.getTextField(name).setText(pdfSafe(value) || undefined);
    } catch (e) {
      console.warn('Contract field missing', name, e);
    }
  };
  const radio = (name: string, value: string | null) => {
    try {
      const g = form.getRadioGroup(name);
      if (value) g.select(value);
      else g.clear();
    } catch (e) {
      console.warn('Contract radio missing', name, e);
    }
  };
  const check = (name: string, on: boolean) => {
    try {
      const b = form.getCheckBox(name);
      on ? b.check() : b.uncheck();
    } catch (e) {
      console.warn('Contract checkbox missing', name, e);
    }
  };

  // 1. Parties
  text(F.effectiveDate, usDate(t.effectiveDate));
  text(F.providerName, c.staff.name);
  text(F.providerAddress, c.staff.address);
  text(F.clientName, c.employer.name);
  text(F.clientAddress, c.employer.address);
  // 2. Term
  text(F.startDate, usDate(t.startDate));
  radio(F.endType, t.endType);
  text(F.endDate, t.endType === 'Date' ? usDate(t.endDate) : '');
  text(F.endOther, t.endType === 'Other' ? t.endOther : '');
  // 3. Services
  text(F.services, t.services);
  // 4. Payment amount
  check(F.payHourly, t.payHourly);
  text(F.hourlyRate, t.payHourly ? t.hourlyRate.replace(/^\$/, '') : '');
  check(F.payPerJob, t.payPerJob);
  text(F.jobAmount, t.payPerJob ? t.jobAmount.replace(/^\$/, '') : '');
  check(F.payOther, t.payOther);
  text(F.payOtherText, t.payOther ? t.payOtherText : '');
  // 5. Payment method
  radio(F.paymentPlan, t.paymentPlan);
  radio(F.frequency, t.paymentPlan === 'Recurring Basis' ? t.frequency : null);
  text(F.planStart, t.paymentPlan === 'Recurring Basis' ? usDate(t.planStart) : '');
  text(F.planOther, t.paymentPlan === 'Other' ? t.planOther : '');
  // 6. Retainer
  radio(F.retainer, t.retainer);
  text(F.retainerAmount, t.retainer === 'Required' ? t.retainerAmount.replace(/^\$/, '') : '');
  radio(F.retainerRefundable, t.retainer === 'Required' ? t.retainerRefundable : null);
  // 7, 20, 22
  text(F.noticeDays, t.noticeDays);
  text(F.governingState, t.governingState);
  text(F.additionalTerms, t.additionalTerms);
  // Signature block
  text(F.clientPrintName, c.employer.signedAt ? (c.employer.signatory ?? c.employer.name) : '');
  text(F.clientSignDate, usDate(c.employer.signedAt));
  text(F.providerPrintName, c.staff.signedAt ? c.staff.name : '');
  text(F.providerSignDate, usDate(c.staff.signedAt));

  // Multi-line boxes auto-size to huge text by default; keep them readable like the rest of the page.
  for (const name of [F.services, F.additionalTerms]) {
    try {
      form.getTextField(name).setFontSize(10);
    } catch {
      /* field missing */
    }
  }
  form.updateFieldAppearances(font);
  const done = stage(c) === 'completed';
  // A fully signed copy is flattened so nobody can quietly edit it afterwards.
  if (done) form.flatten();

  const pages = pdf.getPages();

  // Company letterhead in the top margin of every template page (content starts below y≈725).
  // Uses the contract's own employer details, so a signed copy never changes with later edits.
  const navy = rgb(0.004, 0.09, 0.37);
  const headName = pdfSafe(c.employer.name);
  const headLine = pdfSafe([c.employer.address, c.employer.email].filter(Boolean).join('  |  '));
  for (const page of pages) {
    if (!headName) break;
    const { width } = page.getSize();
    page.drawText(headName, { x: 72, y: 758, size: 10, font: bold, color: navy, maxWidth: width - 144 });
    if (headLine) page.drawText(headLine, { x: 72, y: 747, size: 7.5, font, color: rgb(0.39, 0.45, 0.55), maxWidth: width - 144 });
    page.drawLine({ start: { x: 72, y: 741 }, end: { x: width - 72, y: 741 }, thickness: 0.5, color: rgb(0.8, 0.83, 0.88) });
  }
  const place = async (p: ContractParty, box: (typeof SIG_BOX)['client']) => {
    if (!p.signature || !p.signedAt) return;
    const png = await pdf.embedPng(p.typed ? await typedSignaturePng(pdfSafe(p.signature)) : await trimInk(p.signature));
    const scale = Math.min(box.w / png.width, box.h / png.height);
    pages[box.page]!.drawImage(png, { x: box.x, y: box.y, width: png.width * scale, height: png.height * scale });
  };
  await place(c.employer, SIG_BOX.client);
  await place(c.staff, SIG_BOX.provider);

  if (!done) {
    for (const page of pages) {
      const { width } = page.getSize();
      page.drawText(c.status === 'void' ? 'VOID - NOT A VALID AGREEMENT' : 'DRAFT - NOT YET SIGNED BY BOTH PARTIES', {
        x: width / 2 - 170,
        y: 400,
        size: 26,
        font: bold,
        color: rgb(0.85, 0.15, 0.2),
        opacity: 0.18,
        rotate: degrees(35),
      });
    }
  }

  // Signing certificate: who signed, when, how, and a fingerprint of what they agreed to.
  const cert = pdf.addPage([612, 792]);
  let y = 740;
  const line = (s: string, size = 10, f = font, color = rgb(0.2, 0.23, 0.3)) => {
    for (const chunk of wrap(pdfSafe(s), f, size, 500)) {
      cert.drawText(chunk, { x: 56, y, size, font: f, color });
      y -= size + 5;
    }
  };
  const wrap = (s: string, f: typeof font, size: number, max: number) => {
    const out: string[] = [];
    for (const para of s.split('\n')) {
      let cur = '';
      for (const word of para.split(' ')) {
        const next = cur ? `${cur} ${word}` : word;
        if (f.widthOfTextAtSize(next, size) > max && cur) {
          out.push(cur);
          cur = word;
        } else cur = next;
      }
      out.push(cur);
    }
    return out;
  };
  line('Signature certificate', 18, bold, rgb(0.004, 0.09, 0.37));
  y -= 4;
  line(`Issued by: ${c.employer.name}${c.employer.address ? `, ${c.employer.address}` : ''}`);
  line(`Document: ${TEMPLATE_NAME} - ${c.title}`);
  line(`Contract ID: ${c.id}`);
  line(`Status: ${done ? 'Completed - signed by both parties' : c.status === 'void' ? 'Void' : 'Incomplete'}`);
  line(`Generated: ${new Date().toISOString()} via onlocalAI (onlocalai.com)`);
  y -= 10;
  for (const [role, p] of [
    ['Client (employer)', c.employer],
    ['Service Provider (crew member)', c.staff],
  ] as const) {
    line(role, 12, bold);
    line(`Name: ${p.name || '-'}${p.email ? `   Email: ${p.email}` : ''}`);
    if (p.signatory) line(`Signed on its behalf by: ${p.signatory}`);
    line(p.signedAt ? `Signed: ${p.signedAt} (${p.typed ? 'typed name' : 'drawn signature'})` : 'Not signed');
    if (p.termsHash) line(`Terms fingerprint (SHA-256) at signing: ${p.termsHash}`, 8);
    y -= 8;
  }
  if (c.employer.termsHash && c.staff.termsHash)
    line(c.employer.termsHash === c.staff.termsHash ? 'Both parties signed identical terms.' : 'WARNING: the parties signed different versions of the terms.', 10, bold);
  y -= 8;
  line('Audit trail', 12, bold);
  for (const a of c.audit) line(`${a.at}  ${a.text}`, 9);

  pdf.setTitle(`${TEMPLATE_NAME} - ${pdfSafe(c.title)}`);
  pdf.setProducer('onlocalAI');
  return pdf.save();
}

export async function downloadContract(c: Contract | null, opts: BuildOptions = {}) {
  const bytes = await buildContractPdf(c, opts);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  a.download = c && !opts.blank ? `contract-${slug(c.title)}${stage(c) === 'completed' ? '-signed' : '-draft'}.pdf` : 'event-planning-service-contract-blank.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Object URL for an inline preview (caller revokes it). */
export async function contractPreviewUrl(c: Contract) {
  const bytes = await buildContractPdf(c);
  return URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
}
