import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { handleAI, resolveModels } from './ai';
import { oembedEndpoint, parseVideo, type VideoMeta } from '../src/lib/video';
import { emailStatus, sendCrewEmails, type EmailEnv } from './email';
import { findCovers, findLessonImages, imageProvider, trackCover, type ImageEnv } from './images';

async function videoInfo(url: string): Promise<VideoMeta | null> {
  const v = parseVideo(url);
  if (!v) return null;
  const endpoint = oembedEndpoint(v);
  if (!endpoint) return { thumbnail: v.thumbnail };
  try {
    const r = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return { thumbnail: v.thumbnail };
    const j: any = await r.json();
    return {
      title: typeof j.title === 'string' ? j.title.slice(0, 150) : undefined,
      author: typeof j.author_name === 'string' ? j.author_name.slice(0, 80) : undefined,
      thumbnail: typeof j.thumbnail_url === 'string' ? j.thumbnail_url : v.thumbnail,
      durationSec: typeof j.duration === 'number' ? Math.round(j.duration) : undefined,
    };
  } catch {
    return { thumbnail: v.thumbnail };
  }
}

const MAX_BODY = 120_000;

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Request too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Serves /api/ai/* from the Vite dev and preview servers so the OpenRouter key stays server-side.
 * The key is read from OPENROUTER_API_KEY (.env.local or the process env) — never VITE_-prefixed.
 */
export function aiApi(): Plugin {
  let env = { key: '', models: '' };
  let mail: EmailEnv = {};
  let images: ImageEnv = {};
  let reload = () => {};

  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url?.split('?')[0] ?? '';
    if (!url.startsWith('/api/')) return next();
    // Re-read .env.local on every API call so edits apply without restarting the server.
    reload();
    if (url === '/api/email/status' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(emailStatus(mail)));
    }
    if (url === '/api/email/send' && req.method === 'POST') {
      let body: any;
      try {
        body = await readBody(req);
      } catch (e) {
        res.statusCode = 400;
        return res.end((e as Error).message);
      }
      const proto = String(req.headers['x-forwarded-proto'] ?? 'http').split(',')[0];
      // Invite links must point back at this same server (see safeLink in email.ts).
      const out = await sendCrewEmails(mail, body, `${proto}://${req.headers.host}`);
      res.statusCode = out.status;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(out));
    }
    if (url === '/api/images/status' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ provider: imageProvider(images), ai: !!images.OPENROUTER_API_KEY }));
    }
    if ((url === '/api/images/cover' || url === '/api/images/lessons' || url === '/api/images/track') && req.method === 'POST') {
      let body: any;
      try {
        body = await readBody(req);
      } catch (e) {
        res.statusCode = 400;
        return res.end((e as Error).message);
      }
      res.setHeader('Content-Type', 'application/json');
      if (url === '/api/images/track') {
        await trackCover(images, body);
        return res.end('{}');
      }
      const out = url === '/api/images/lessons' ? await findLessonImages(images, body) : await findCovers(images, body);
      res.statusCode = out.status;
      return res.end(JSON.stringify(out));
    }
    if (url === '/api/video/info' && req.method === 'GET') {
      const target = new URL(req.url!, 'http://local').searchParams.get('url') ?? '';
      const info = await videoInfo(target.slice(0, 2000));
      res.statusCode = info ? 200 : 422;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(info ?? { error: 'Unsupported video link' }));
    }
    if (!url.startsWith('/api/ai/')) return next();

    if (url === '/api/ai/status' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ configured: !!env.key, models: resolveModels(env.models).map((m) => m.label) }));
    }
    const route = url === '/api/ai/course' ? 'course' : url === '/api/ai/lesson' ? 'lesson' : url === '/api/ai/role' ? 'role' : null;
    if (!route || req.method !== 'POST') {
      res.statusCode = 404;
      return res.end('Not found');
    }

    let body: any;
    try {
      body = await readBody(req);
    } catch (e) {
      res.statusCode = 400;
      return res.end((e as Error).message);
    }

    // Stream progress as NDJSON so the manager sees which model is working.
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) abort.abort();
    });
    await handleAI(route, body, env, (e) => res.write(JSON.stringify(e) + '\n'), abort.signal);
    res.end();
  };

  return {
    name: 'onlocalai-ai-api',
    configResolved(cfg) {
      reload = () => {
        const all = loadEnv(cfg.mode, typeof cfg.envDir === 'string' ? cfg.envDir : cfg.root, '');
        const pick = (k: string) => all[k]?.trim() || process.env[k]?.trim() || undefined;
        env = { key: pick('OPENROUTER_API_KEY') || '', models: pick('OPENROUTER_MODELS') || '' };
        mail = {
          RESEND_API_KEY: pick('RESEND_API_KEY'),
          SMTP_HOST: pick('SMTP_HOST'),
          SMTP_PORT: pick('SMTP_PORT'),
          SMTP_USER: pick('SMTP_USER'),
          SMTP_PASS: pick('SMTP_PASS'),
          SMTP_SECURE: pick('SMTP_SECURE'),
          EMAIL_FROM: pick('EMAIL_FROM'),
        };
        images = {
          PEXELS_API_KEY: pick('PEXELS_API_KEY'),
          UNSPLASH_ACCESS_KEY: pick('UNSPLASH_ACCESS_KEY'),
          OPENROUTER_API_KEY: env.key || undefined,
          OPENROUTER_MODELS: env.models || undefined,
        };
      };
      reload();
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
