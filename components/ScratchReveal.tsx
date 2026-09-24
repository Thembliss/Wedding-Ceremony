"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ScratchRevealProps {
  onReveal: () => void;
}

const REVEAL_THRESHOLD = 65;

export default function ScratchReveal({ onReveal }: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const revealedRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const drawCover = useCallback(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // Fully opaque liquid-glass cover.
    // The date is underneath this layer and therefore cannot be seen
    // until the user actually scratches it away.
    const cover = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    cover.addColorStop(0, "rgba(238, 228, 230, 0.96)");
    cover.addColorStop(0.45, "rgba(126, 93, 101, 0.96)");
    cover.addColorStop(1, "rgba(67, 28, 39, 0.98)");

    ctx.fillStyle = cover;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Frosted / liquid-metal texture.
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const radius = 18 + Math.random() * 55;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, "rgba(255,255,255,0.55)");
      glow.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine glass grain.
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 1400; i += 1) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.fillRect(x, y, 0.8, 0.8);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
  }, []);

  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const sampleStep = 12;
    const pixels = ctx.getImageData(0, 0, width, height).data;

    let transparent = 0;
    let sampled = 0;

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const alpha = pixels[(y * width + x) * 4 + 3];
        sampled += 1;
        if (alpha < 45) transparent += 1;
      }
    }

    const percent = sampled ? Math.round((transparent / sampled) * 100) : 0;
    const safePercent = Math.min(100, Math.max(0, percent));

    setProgress((previous) =>
      Math.abs(previous - safePercent) >= 2 ? safePercent : previous,
    );

    if (safePercent >= REVEAL_THRESHOLD && !revealedRef.current) {
      revealedRef.current = true;
      setProgress(100);
      setRevealed(true);

      const ctx2 = canvas.getContext("2d");
      if (ctx2) {
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
      }

      onReveal();
    }
  }, [onReveal]);

  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      if (!hasStarted) setHasStarted(true);

      const canvas = canvasRef.current;
      const card = cardRef.current;
      if (!canvas || !card || revealedRef.current) return;

      const rect = card.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(55, Math.min(95, rect.width * 0.11)) * scaleX;

      const last = lastPointRef.current;

      ctx.beginPath();
      if (last) {
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.01, y + 0.01);
      }
      ctx.stroke();

      // Soft secondary pass for a more natural liquid-glass scratch.
      ctx.globalAlpha = 0.35;
      ctx.lineWidth *= 1.65;
      ctx.stroke();

      ctx.restore();

      lastPointRef.current = { x, y };

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          calculateProgress();
        });
      }
    },
    [calculateProgress, hasStarted],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!revealedRef.current) drawCover();
    });

    if (cardRef.current) resizeObserver.observe(cardRef.current);

    drawCover();

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [drawCover]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = null;
    scratch(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || revealedRef.current) return;
    scratch(event.clientX, event.clientY);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <section className="scratch-section">
      <div ref={cardRef} className="scratch-card">
        <div className="scratch-glow" />

        {/* Always visible instruction. */}
        <div
          className="scratch-content"
          style={{
            position: "relative",
            zIndex: 7,
            pointerEvents: "none",
          }}
        >
          <p
            className="scratch-eyebrow"
            style={{
              opacity: hasStarted ? 0 : 1,
              transform: hasStarted ? "translateY(-8px)" : "translateY(0)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            A SECRET IS WAITING
          </p>
          <h2
            style={{
              opacity: hasStarted ? 0 : 1,
              transform: hasStarted ? "translateY(-18px) scale(0.96)" : "translateY(0) scale(1)",
              filter: hasStarted ? "blur(6px)" : "blur(0)",
              transition: "opacity 0.4s ease, transform 0.45s ease, filter 0.4s ease",
            }}
          >
            SCRATCH TO REVEAL
          </h2>
        </div>

        {/* The actual date is underneath the opaque scratch layer. */}
        <div
          className="date-reveal"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            justifyContent: "center",
            margin: 0,
            pointerEvents: "none",
          }}
        >
          <span>12 DECEMBER 2027</span>
          <small>SUNDAY</small>
          <small>7:00 PM</small>
          <small>GRAND CONVENTION HALL</small>
        </div>

        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />

        <div
          className="scratch-instruction"
          style={{
            zIndex: 8,
            opacity: revealed ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        >
          <span>{progress}%</span>
          <span>REVEALED</span>
        </div>
      </div>
    </section>
  );
}
