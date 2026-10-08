import { useState } from 'react';
import { motion } from 'framer-motion';
import { styleOf } from './items';
import type { Pose, Scene, SceneItem } from './types';
import { cn } from '../lib/utils';

export function SceneBoard({
  scene,
  poses,
  visibleIds,
  highlightIds,
  dimOthers,
  flashId,
  wrongIds,
  dragIds,
  slotIds,
  onDrop,
  className,
}: {
  scene: Scene;
  poses?: Record<string, Pose>;
  visibleIds?: string[];
  highlightIds?: string[];
  dimOthers?: boolean;
  flashId?: string;
  wrongIds?: string[];
  dragIds?: string[];
  slotIds?: string[];
  onDrop?: (id: string, pose: Pose) => void;
  className?: string;
}) {
  const vis = visibleIds ? new Set(visibleIds) : null;
  const hi = new Set(highlightIds ?? []);
  const drag = new Set(dragIds ?? []);
  const wrong = new Set(wrongIds ?? []);
  const slots = slotIds ?? [];

  return (
    <div
      data-scene-board
      className={cn('relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200', className)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {scene.kind === 'plate' && <rect width="100" height="100" fill="#eef2ff" />}
        {scene.kind === 'round-table' && <rect width="100" height="100" fill="#f1f5f9" />}
        {scene.kind === 'station' && (
          <>
            <rect width="100" height="100" fill="#f8fafc" />
            <rect x="8" y="22" width="84" height="48" rx="3" fill="#cbd5e1" />
            <rect x="8" y="68" width="84" height="6" fill="#94a3b8" />
          </>
        )}
      </svg>
      {slots.map((id) => {
        const it = scene.items.find((x) => x.id === id);
        if (!it) return null;
        const st = styleOf(it.kind);
        return (
          <div
            key={`slot-${id}`}
            aria-hidden
            className="pointer-events-none absolute rounded-full border-2 border-dashed border-indigo-400 bg-indigo-50/50"
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              width: `${Math.max(st.w, 10)}%`,
              height: `${Math.max(st.w, 10)}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          />
        );
      })}
      {scene.items
        .slice()
        .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
        .map((item) => {
          if (vis && !vis.has(item.id)) return null;
          const pose = poses?.[item.id] ?? item;
          return (
            <Glyph
              key={item.id}
              item={{ ...item, ...pose }}
              highlight={hi.has(item.id) || flashId === item.id}
              dim={dimOthers && hi.size > 0 && !hi.has(item.id)}
              wrong={wrong.has(item.id)}
              draggable={drag.has(item.id)}
              onDrop={onDrop}
            />
          );
        })}
    </div>
  );
}

function Glyph({
  item,
  highlight,
  dim,
  wrong,
  draggable,
  onDrop,
}: {
  item: SceneItem;
  highlight?: boolean;
  dim?: boolean;
  wrong?: boolean;
  draggable?: boolean;
  onDrop?: (id: string, pose: Pose) => void;
}) {
  const st = styleOf(item.kind);
  const scale = item.scale ?? 1;
  const left = `${item.x}%`;
  const top = `${item.y}%`;
  const [dragGen, setDragGen] = useState(0);

  return (
    <motion.div
      className={cn('absolute z-10 flex flex-col items-center', wrong && 'anim-shake')}
      style={{ left, top, width: `${st.w}%`, x: '-50%', y: '-50%', zIndex: highlight ? 20 : item.z ?? 1 }}
      initial={false}
      animate={{
        left,
        top,
        rotate: item.rotation ?? 0,
        scale: highlight ? scale * 1.08 : scale,
        opacity: dim ? 0.28 : 1,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <motion.div
        key={dragGen}
        drag={draggable}
        dragMomentum={false}
        dragElastic={0.12}
        whileDrag={{ scale: 1.12, cursor: 'grabbing', zIndex: 40 }}
        onDragEnd={(_e, info) => {
          if (!onDrop) return;
          const parent = (_e.target as HTMLElement).closest('[data-scene-board]');
          if (!parent) return;
          const r = parent.getBoundingClientRect();
          const x = ((info.point.x - r.left) / r.width) * 100;
          const y = ((info.point.y - r.top) / r.height) * 100;
          onDrop(item.id, { x, y, rotation: item.rotation, scale: item.scale });
          setDragGen((n) => n + 1);
        }}
        role={draggable ? 'button' : 'img'}
        aria-label={item.label}
        className={cn('flex touch-none flex-col items-center', draggable && 'cursor-grab active:cursor-grabbing')}
      >
        <svg viewBox={`0 0 ${st.w} ${st.h}`} className="h-auto w-full drop-shadow-sm" overflow="visible">
          {st.shape === 'circle' && (
            <circle cx={st.w / 2} cy={st.h / 2} r={Math.min(st.w, st.h) / 2 - 0.6} fill={st.fill} stroke={highlight ? '#4f46e5' : st.stroke} strokeWidth={highlight ? 1.4 : 0.7} />
          )}
          {st.shape === 'ellipse' && (
            <ellipse cx={st.w / 2} cy={st.h / 2} rx={st.w / 2 - 0.5} ry={st.h / 2 - 0.5} fill={st.fill} stroke={highlight ? '#4f46e5' : st.stroke} strokeWidth={highlight ? 1.2 : 0.6} />
          )}
          {st.shape === 'rect' && (
            <rect x="0.4" y="0.4" width={st.w - 0.8} height={st.h - 0.8} rx={st.rx ?? 1} fill={st.fill} stroke={highlight ? '#4f46e5' : st.stroke} strokeWidth={highlight ? 1.2 : 0.6} />
          )}
        </svg>
        <span className="mt-0.5 max-w-[4.5rem] truncate text-[9px] font-semibold text-slate-600">{item.label}</span>
      </motion.div>
    </motion.div>
  );
}

export function dist(a: Pose, b: Pose) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
