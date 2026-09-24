import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX, X } from 'lucide-react';
import { Button, RichText } from '../../components/ui';
import { Confetti } from '../../components/extras';
import { VideoEmbed } from '../../components/video';
import { badge } from '../../lib/badges';
import { courseProgress, requirements } from '../../lib/readiness';
import { cn } from '../../lib/utils';
import { useCatalog, useCurrentStaff, useStore } from '../../store';
import type { Course, Lesson } from '../../types';

function Quiz({ lesson, passMark, onPass }: { lesson: Lesson; passMark: number; onPass: (score: number) => void }) {
  const qs = lesson.questions ?? [];
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = qs[qi];

  if (!qs.length) return <Button onClick={() => onPass(100)}>Continue</Button>;

  if (finished) {
    const score = Math.round((correct / qs.length) * 100);
    const passed = score >= passMark;
    return (
      <div className="anim-pop py-8 text-center">
        <div className="text-6xl">{passed ? (score === 100 ? '🧠' : '🎉') : '💪'}</div>
        <div className="mt-4 text-3xl font-bold">{score}%</div>
        <p className="mt-1 text-slate-500">
          {correct} of {qs.length} correct
        </p>
        <p className={cn('mt-4 font-medium', passed ? 'text-emerald-600' : 'text-amber-600')}>
          {passed ? (score === 100 ? 'Perfect score!' : 'Nice work — you passed!') : `You need ${passMark}% to pass. Have another go!`}
        </p>
        <div className="mt-8">
          {passed ? (
            <Button size="lg" className="w-full" onClick={() => onPass(score)}>
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setQi(0);
                setPicked(null);
                setCorrect(0);
                setFinished(false);
              }}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const answered = picked !== null;
  return (
    <div key={q!.id} className="anim-slide">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
        Question {qi + 1} of {qs.length}
      </div>
      <p className="mb-5 text-lg font-semibold text-slate-900">{q!.prompt}</p>
      <div className="space-y-2.5">
        {q!.options.map((o, i) => {
          const isRight = i === q!.correct;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                if (isRight) setCorrect((c) => c + 1);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 text-left text-sm font-medium ring-1 transition cursor-pointer',
                !answered && 'ring-slate-200 hover:ring-indigo-300 active:bg-indigo-50',
                answered && isRight && 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400',
                answered && isPicked && !isRight && 'anim-shake bg-rose-50 text-rose-900 ring-2 ring-rose-400',
                answered && !isRight && !isPicked && 'opacity-50 ring-slate-200',
              )}
            >
              <span className="flex-1">{o}</span>
              {answered && isRight && <CircleCheck size={20} className="text-emerald-500" />}
              {answered && isPicked && !isRight && <CircleX size={20} className="text-rose-500" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="anim-pop mt-5">
          <div className={cn('rounded-xl p-4 text-sm', picked === q!.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800')}>
            <strong>{picked === q!.correct ? 'Correct! ' : 'Not quite. '}</strong>
            {q!.explanation ?? (picked === q!.correct ? '' : `The answer is “${q!.options[q!.correct]}”.`)}
          </div>
          <Button
            size="lg"
            className="mt-4 w-full"
            onClick={() => {
              if (qi + 1 < qs.length) {
                setQi(qi + 1);
                setPicked(null);
              } else setFinished(true);
            }}
          >
            {qi + 1 < qs.length ? 'Next question' : 'See results'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CoursePlayer() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const preview = params.get('preview') === '1';
  const me = useCurrentStaff();
  const cat = useCatalog();
  const course = cat.courses.find((c) => c.id === id);
  const completeLesson = useStore((s) => s.completeLesson);
  const nav = useNavigate();

  const firstOpen = (c: Course) => {
    const done = me.courses[c.id]?.completedLessonIds ?? [];
    const idx = c.lessons.findIndex((l) => !done.includes(l.id));
    return idx === -1 ? 0 : idx;
  };
  const [idx, setIdx] = useState(() => (course ? firstOpen(course) : 0));
  const [result, setResult] = useState<{ points: number; badges: string[] } | null>(null);

  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;
  const lesson = course.lessons[idx];

  const advance = (score?: number) => {
    if (!lesson) return;
    if (!preview) {
      const res = completeLesson(me.id, course.id, lesson.id, score);
      if (res.courseCompleted) return setResult({ points: course.points, badges: res.newBadges });
      if (res.newBadges.length) useStore.getState().toast(`Badge unlocked: ${badge(res.newBadges[0]!)?.name}`, badge(res.newBadges[0]!)?.emoji);
    }
    if (idx + 1 < course.lessons.length) setIdx(idx + 1);
    else if (preview) setResult({ points: course.points, badges: [] });
    else setResult({ points: 0, badges: [] }); // re-watching a completed course
  };

  if (result) {
    const nextCourse = cat.courses.find((c) => c.id !== course.id && requirements(me, cat).courseIds.includes(c.id) && courseProgress(me, c) < 1);
    return (
      <div className="flex min-h-[calc(100vh-28px)] flex-col items-center justify-center bg-gradient-to-b from-indigo-600 to-violet-700 p-8 text-center text-white">
        {result.points > 0 && <Confetti />}
        <div className="anim-pop text-7xl">{course.emoji}</div>
        <h1 className="mt-6 text-2xl font-bold">{result.points > 0 ? 'Course complete!' : 'All done'}</h1>
        <p className="mt-2 opacity-90">{course.title}</p>
        {result.points > 0 && <div className="mt-6 rounded-full bg-white/20 px-5 py-2 text-lg font-bold">+{result.points} points</div>}
        {result.badges.map((b) => (
          <div key={b} className="anim-pop mt-4 flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
            <span className="text-3xl">{badge(b)?.emoji}</span>
            <div className="text-left">
              <div className="text-xs uppercase opacity-80">Badge unlocked</div>
              <div className="font-semibold">{badge(b)?.name}</div>
            </div>
          </div>
        ))}
        <div className="mt-10 w-full max-w-xs space-y-3">
          {nextCourse && !preview && (
            <button
              onClick={() => {
                setResult(null);
                nav(`/app/learn/${nextCourse.id}`);
                setIdx(firstOpen(nextCourse));
              }}
              className="w-full rounded-xl bg-white py-3 font-semibold text-indigo-700"
            >
              Next: {nextCourse.emoji} {nextCourse.title}
            </button>
          )}
          <Link to={preview ? `/admin/training/${course.id}` : '/app'} className="block w-full rounded-xl py-3 font-semibold ring-1 ring-white/40">
            {preview ? 'Back to builder' : 'Back to home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-28px)] flex-col bg-white">
      <div className="sticky top-7 z-10 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <Link to={preview ? `/admin/training/${course.id}` : '/app/learn'} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X size={22} />
          </Link>
          <div className="flex flex-1 gap-1">
            {course.lessons.map((l, i) => (
              <div key={l.id} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < idx ? 'bg-indigo-500' : i === idx ? 'bg-indigo-300' : 'bg-slate-200')} />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {idx + 1}/{course.lessons.length}
          </span>
        </div>
        {preview && <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-center text-xs text-amber-700">Preview mode — progress isn't saved</div>}
      </div>

      {lesson && (
        <div key={lesson.id} className="flex flex-1 flex-col px-5 pb-6 anim-slide">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {course.emoji} {course.title}
          </div>
          <h1 className="mb-5 mt-1 text-2xl font-bold text-slate-900">{lesson.title}</h1>
          {lesson.kind === 'video' && <VideoEmbed url={lesson.videoUrl} title={lesson.title} className="mb-5" showOpenLink />}
          {lesson.kind === 'quiz' ? (
            <Quiz lesson={lesson} passMark={course.passingScore} onPass={(score) => advance(score)} />
          ) : (
            <>
              <div className="flex-1">{lesson.body && <RichText text={lesson.body} className="text-[15px]" />}</div>
              <Button size="lg" className="mt-8 w-full" onClick={() => advance()}>
                {idx + 1 < course.lessons.length ? 'Continue' : 'Finish'}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
