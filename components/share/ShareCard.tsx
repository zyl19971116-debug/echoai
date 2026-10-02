'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ImageDown, Loader2 } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/Toast';
import { EchoMark } from '@/components/ui/EchoLogo';
import { cn, formatSignedPercent } from '@/lib/format';

interface ShareCardProps {
  humanGrowth: number;
  aiGrowth: number;
  days: number;
  archetype: string;
  address: string;
  className?: string;
}

const W = 1080;
const H = 1350;

/* ------------------------------------------------------------------ */
/* canvas helpers                                                      */
/* ------------------------------------------------------------------ */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Canvas has no letter-spacing in every browser — draw glyph by glyph. */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' | 'right' = 'left',
) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (chars.length - 1);
  let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + spacing;
  });
  return total;
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function ShareCard({ humanGrowth, aiGrowth, days, archetype, address, className }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generating, setGenerating] = useState(false);
  const { push } = useToast();

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = W;
    canvas.height = H;

    /* ---- background ---- */
    const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, '#050914');
    bg.addColorStop(0.55, '#03060B');
    bg.addColorStop(1, '#070C18');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* ---- top glow ---- */
    const glow = ctx.createRadialGradient(W / 2, H * 0.24, 20, W / 2, H * 0.24, W * 0.72);
    glow.addColorStop(0, 'rgba(140,100,255,0.42)');
    glow.addColorStop(0.45, 'rgba(76,141,255,0.14)');
    glow.addColorStop(1, 'rgba(3,6,11,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    /* ---- grid ---- */
    ctx.strokeStyle = 'rgba(110,145,235,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 68) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 68) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    /* ---- frame ---- */
    ctx.strokeStyle = 'rgba(122,158,255,0.22)';
    ctx.lineWidth = 2;
    roundRect(ctx, 44, 44, W - 88, H - 88, 6);
    ctx.stroke();

    /* ---- corner ticks ---- */
    ctx.strokeStyle = 'rgba(160,190,255,0.6)';
    ctx.lineWidth = 3;
    const tick = 26;
    const c = 44;
    [
      [c, c, 1, 1],
      [W - c, c, -1, 1],
      [c, H - c, 1, -1],
      [W - c, H - c, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * tick, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * tick);
      ctx.stroke();
    });

    /* ---- wordmark ---- */
    ctx.strokeStyle = 'rgba(140,170,255,0.95)';
    ctx.lineWidth = 3.5;
    const markX = 92;
    const markY = 112;
    ctx.beginPath();
    ctx.arc(markX + 4, markY + 4, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(markX + 4, markY + 4, 17, -Math.PI / 2.6, Math.PI / 2.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(markX + 4, markY + 4, 17, Math.PI - Math.PI / 2.6, Math.PI + Math.PI / 2.6);
    ctx.stroke();

    ctx.font = '600 30px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#EAF0FF';
    drawTracked(ctx, 'ECHO AI', markX + 46, markY + 16, 8);

    /* ---- eyebrow ---- */
    ctx.font = '600 26px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(160,182,225,0.6)';
    drawTracked(ctx, 'MY AI SHADOW', W / 2, 380, 12, 'center');

    /* ---- headline ---- */
    const headline = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
    headline.addColorStop(0, '#9FC2FF');
    headline.addColorStop(1, '#C7AEFF');
    ctx.font = '700 156px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = headline;
    drawTracked(ctx, 'BEAT ME.', W / 2, 560, 2, 'center');

    /* ---- archetype ---- */
    ctx.font = '600 24px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(199,174,255,0.9)';
    drawTracked(ctx, archetype, W / 2, 632, 10, 'center');

    /* ---- stat blocks ---- */
    const blocks = [
      { label: 'ME', value: formatSignedPercent(humanGrowth), accent: '#4C8DFF' },
      { label: 'AI ME', value: formatSignedPercent(aiGrowth), accent: '#B98CFF' },
    ];
    const boxW = 400;
    const boxH = 260;
    const gap = 40;
    const startX = W / 2 - (boxW * 2 + gap) / 2;
    const boxY = 760;

    blocks.forEach((block, index) => {
      const x = startX + index * (boxW + gap);
      ctx.fillStyle = 'rgba(14,20,38,0.72)';
      roundRect(ctx, x, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.strokeStyle = `${block.accent}66`;
      ctx.lineWidth = 2;
      roundRect(ctx, x, boxY, boxW, boxH, 6);
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,182,225,0.6)';
      ctx.font = '600 22px Inter, "Segoe UI", Arial, sans-serif';
      drawTracked(ctx, block.label, x + boxW / 2, boxY + 68, 10, 'center');

      ctx.fillStyle = block.accent;
      ctx.font = '700 84px Inter, "Segoe UI", Arial, sans-serif';
      drawTracked(ctx, block.value, x + boxW / 2, boxY + 178, 0, 'center');
    });

    /* ---- footer ---- */
    ctx.font = '600 26px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(234,240,255,0.85)';
    drawTracked(ctx, `${days} DAYS`, W / 2, 1128, 10, 'center');

    ctx.font = '600 20px Inter, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(160,182,225,0.45)';
    drawTracked(ctx, 'SIMULATED · NOT FINANCIAL ADVICE', W / 2, 1180, 6, 'center');

    ctx.font = '500 20px ui-monospace, Consolas, monospace';
    ctx.fillStyle = 'rgba(160,182,225,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText(`${address.slice(0, 6)}...${address.slice(-4)}`, W / 2, 1240);
    ctx.textAlign = 'left';

    return canvas;
  }, [aiGrowth, archetype, address, days, humanGrowth]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await draw();
      if (!canvas) throw new Error('no canvas');

      // let the browser paint the frame before the (synchronous) export
      await new Promise((resolve) => {
        requestAnimationFrame(() => resolve(null));
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `echo-ai-shadow-${days}d.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      push({
        title: 'Share card generated',
        description: 'A 1080×1350 PNG was saved to your downloads.',
        variant: 'success',
      });
    } catch {
      push({
        title: 'Could not generate the card',
        description: 'Your browser blocked canvas export. The preview below is still shareable.',
        variant: 'error',
      });
    } finally {
      setGenerating(false);
    }
  }, [draw, days, push]);

  return (
    <div className={cn('flex flex-col gap-6 lg:flex-row lg:items-start', className)}>
      {/* ---------------- visual preview (mirrors the canvas) ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[380px] shrink-0"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-echo-violet/25 bg-[linear-gradient(160deg,#070C18_0%,#03060B_55%,#080D1A_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_26%,rgba(140,100,255,0.34),transparent_70%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-lines-sm opacity-60" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-5 border border-white/10" />

          <div className="relative flex h-full flex-col justify-between p-8">
            <span className="flex items-center gap-2.5">
              <EchoMark size={22} gradientId="share-mark" />
              <span className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-white">Echo AI</span>
            </span>

            <div className="text-center">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-echo-faint">My AI Shadow</p>
              <p className="display mt-4 text-[2.6rem] text-gradient glow-text">BEAT ME.</p>
              <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#C7AEFF]">
                {archetype}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-sm border border-echo-blue/35 bg-void-800/60 px-3 py-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.22em] text-echo-faint">Me</p>
                  <p className="mono mt-2 text-[1.25rem] text-echo-blue">{formatSignedPercent(humanGrowth)}</p>
                </div>
                <div className="rounded-sm border border-echo-violet/45 bg-void-800/60 px-3 py-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.22em] text-echo-faint">AI me</p>
                  <p className="mono mt-2 text-[1.25rem] text-[#C7AEFF]">{formatSignedPercent(aiGrowth)}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-white">{days} days</p>
              <p className="mt-2 text-[0.55rem] uppercase tracking-[0.2em] text-echo-faint">
                Simulated · not financial advice
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---------------- controls ---------------- */}
      <div className="flex-1">
        <span className="kicker">Share card</span>
        <h3 className="display mt-4 text-[1.5rem] uppercase text-white">Post the result</h3>
        <p className="mt-4 max-w-md text-[0.86rem] leading-relaxed text-echo-muted">
          Exports a 1080 × 1350 PNG straight from the browser — no server, no upload. The card carries the simulation
          label so it can never be mistaken for real trading performance.
        </p>

        <dl className="mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Human</dt>
            <dd className="mono mt-1.5 text-[0.95rem] text-white">{formatSignedPercent(humanGrowth)}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">AI shadow</dt>
            <dd className="mono mt-1.5 text-[0.95rem] text-[#C7AEFF]">{formatSignedPercent(aiGrowth)}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Window</dt>
            <dd className="mono mt-1.5 text-[0.95rem] text-white">{days} days</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Format</dt>
            <dd className="mono mt-1.5 text-[0.95rem] text-white">PNG · 1080×1350</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <GlowButton
            onClick={handleGenerate}
            disabled={generating}
            icon={
              generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageDown className="h-3.5 w-3.5" />
            }
          >
            {generating ? 'Generating' : 'Generate share card'}
          </GlowButton>
          <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
            <Download className="h-3 w-3" />
            Saved locally
          </span>
        </div>
      </div>

      {/* offscreen canvas used for the export */}
      <canvas ref={canvasRef} width={W} height={H} className="hidden" aria-hidden="true" />
    </div>
  );
}
