import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
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
  hotId,
  onDrop,
  onResize,
  onSelect,
  boardRef: boardRefProp,
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
  /** Slot the trainee is currently hovering with the right piece. */
  hotId?: string;
  onDrop?: (id: string, pose: Pose) => void;
  /** Drag the corner of a selected piece. Scale is 1 at the piece’s normal size. */
  onResize?: (id: string, scale: number) => void;
  onSelect?: (id: string) => void;
  boardRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const vis = visibleIds ? new Set(visibleIds) : null;
  const hi = new Set(highlightIds ?? []);
  const drag = new Set(dragIds ?? []);
  const wrong = new Set(wrongIds ?? []);
  const slots = slotIds ?? [];
  const localRef = useRef<HTMLDivElement>(null);
  const boardRef = boardRefProp ?? localRef;

  return (
    <div
      ref={boardRef}
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
        const st = styleOf(it.kind, it.look);
        const size = Math.min(14, Math.max(st.w, 8));
        const hot = hotId === id;
        return (
          <div
            key={`slot-${id}`}
            aria-hidden
            className={cn(
              'pointer-events-none absolute rounded-full border-2 border-dashed transition',
              hot ? 'border-indigo-600 bg-indigo-100/80' : 'border-indigo-300 bg-white/50',
            )}
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              width: `${size}%`,
              height: `${size}%`,
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
              boardRef={boardRef}
              onDrop={onDrop}
              onResize={onResize}
              onSelect={onSelect}
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
  boardRef,
  onDrop,
  onResize,
  onSelect,
}: {
  item: SceneItem;
  highlight?: boolean;
  dim?: boolean;
  wrong?: boolean;
  draggable?: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  onDrop?: (id: string, pose: Pose) => void;
  onResize?: (id: string, scale: number) => void;
  onSelect?: (id: string) => void;
}) {
  const st = styleOf(item.kind, item.look);
  const scale = item.scale ?? 1;
  const left = `${item.x}%`;
  const top = `${item.y}%`;
  const [dragGen, setDragGen] = useState(0);
  const [pin, setPin] = useState(false);
  const [resizing, setResizing] = useState(false);

  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const board = boardRef.current;
    if (!board || !onResize) return;
    const rect = board.getBoundingClientRect();
    const ox = rect.left + (item.x / 100) * rect.width;
    const oy = rect.top + (item.y / 100) * rect.height;
    const startDist = Math.max(12, Math.hypot(e.clientX - ox, e.clientY - oy));
    const startScale = item.scale ?? 1;
    setResizing(true);
    const move = (ev: PointerEvent) => {
      const next = Math.min(2.6, Math.max(0.45, (startScale * Math.hypot(ev.clientX - ox, ev.clientY - oy)) / startDist));
      onResize(item.id, Math.round(next * 20) / 20);
    };
    const up = () => {
      setResizing(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <motion.div
      className={cn('absolute z-10 flex flex-col items-center', wrong && 'anim-shake')}
      style={{ left, top, width: `${st.w}%`, zIndex: highlight ? 20 : item.z ?? 1 }}
      initial={false}
      animate={{
        left,
        top,
        x: '-50%',
        y: '-50%',
        rotate: item.rotation ?? 0,
        scale: highlight ? scale * 1.08 : scale,
        opacity: dim ? 0.28 : 1,
      }}
      transition={pin || resizing ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 26 }}
    >
      <motion.div
        key={dragGen}
        drag={draggable}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={{ scale: 1.12, cursor: 'grabbing', zIndex: 40 }}
        onPointerUp={() => onSelect?.(item.id)}
        onDragEnd={(_e, info) => {
          const moved = Math.hypot(info.offset.x, info.offset.y);
          if (moved < 8) {
            onSelect?.(item.id);
            setDragGen((n) => n + 1);
            return;
          }
          if (!onDrop) return;
          const board = boardRef.current;
          if (!board) return;
          const r = board.getBoundingClientRect();
          const x = Math.min(94, Math.max(6, item.x + (info.offset.x / r.width) * 100));
          const y = Math.min(94, Math.max(6, item.y + (info.offset.y / r.height) * 100));
          setPin(true);
          onDrop(item.id, { x, y, rotation: item.rotation, scale: item.scale });
          setDragGen((n) => n + 1);
        }}
        role={draggable ? 'button' : 'img'}
        aria-label={item.label}
        className={cn('flex touch-none flex-col items-center', draggable && 'cursor-grab active:cursor-grabbing')}
      >
        <span className="relative block w-full">
          {st.image ? (
            <img
              src={st.image}
              alt=""
              draggable={false}
              className={cn(
                'pointer-events-none h-auto w-full object-contain drop-shadow-md select-none',
                highlight && 'ring-2 ring-indigo-600 ring-offset-1',
              )}
              style={{ aspectRatio: `${st.w} / ${st.h}`, background: 'transparent' }}
            />
          ) : (
            <svg viewBox={`0 0 ${st.w} ${st.h}`} className={cn('h-auto w-full drop-shadow-sm', highlight && 'text-indigo-600')} overflow="visible">
              {st.shape === 'circle' && (
                <circle cx={st.w / 2} cy={st.h / 2} r={Math.min(st.w, st.h) / 2 - 0.6} fill={st.fill} stroke={highlight ? 'currentColor' : st.stroke} strokeWidth={highlight ? 1.4 : 0.7} />
              )}
              {st.shape === 'ellipse' && (
                <ellipse cx={st.w / 2} cy={st.h / 2} rx={st.w / 2 - 0.5} ry={st.h / 2 - 0.5} fill={st.fill} stroke={highlight ? 'currentColor' : st.stroke} strokeWidth={highlight ? 1.2 : 0.6} />
              )}
              {st.shape === 'rect' && (
                <rect x="0.4" y="0.4" width={st.w - 0.8} height={st.h - 0.8} rx={st.rx ?? 1} fill={st.fill} stroke={highlight ? 'currentColor' : st.stroke} strokeWidth={highlight ? 1.2 : 0.6} />
              )}
            </svg>
          )}
          {highlight && onResize && (
            <span
              role="slider"
              aria-label={`Resize ${item.label}`}
              aria-valuemin={45}
              aria-valuemax={260}
              aria-valuenow={Math.round(scale * 100)}
              onPointerDownCapture={startResize}
              className="absolute -bottom-1 -right-1 z-30 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-indigo-600 bg-white shadow-sm"
            />
          )}
        </span>
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
