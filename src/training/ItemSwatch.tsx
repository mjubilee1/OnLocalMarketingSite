import { styleOf, type ItemStyle } from './items';

export function ItemSwatch({ kind, look, className }: { kind: string; look?: ItemStyle; className?: string }) {
  const st = styleOf(kind, look);
  if (st.image) {
    const round = st.shape === 'circle' || st.shape === 'ellipse';
    return (
      <img
        src={st.image}
        alt=""
        className={className ?? 'h-8 w-8'}
        style={{ objectFit: 'cover', borderRadius: round ? '50%' : 6, aspectRatio: st.shape === 'ellipse' ? '3 / 2' : '1' }}
      />
    );
  }
  return (
    <svg viewBox={`0 0 ${st.w} ${st.h}`} className={className ?? 'h-8 w-8'} overflow="visible" aria-hidden>
      {st.shape === 'circle' && (
        <circle cx={st.w / 2} cy={st.h / 2} r={Math.min(st.w, st.h) / 2 - 0.5} fill={st.fill} stroke={st.stroke} strokeWidth={0.7} />
      )}
      {st.shape === 'ellipse' && (
        <ellipse cx={st.w / 2} cy={st.h / 2} rx={st.w / 2 - 0.4} ry={st.h / 2 - 0.4} fill={st.fill} stroke={st.stroke} strokeWidth={0.6} />
      )}
      {(st.shape === 'rect' || st.shape === 'diamond') && (
        <rect x="0.4" y="0.4" width={st.w - 0.8} height={st.h - 0.8} rx={st.rx ?? 1} fill={st.fill} stroke={st.stroke} strokeWidth={0.6} />
      )}
    </svg>
  );
}
