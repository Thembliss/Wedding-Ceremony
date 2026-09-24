 "use client";

import { useEffect, useRef } from "react";

interface FireworksProps {
  duration?: number;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
  hue: number;
  trail: { x: number; y: number }[];
};

type Rocket = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  side: "left" | "right";
};

const COLORS = [
  { hue: 42, saturation: 75, lightness: 72 },
  { hue: 48, saturation: 85, lightness: 82 },
  { hue: 0, saturation: 70, lightness: 82 },
  { hue: 8, saturation: 55, lightness: 78 },
  { hue: 0, saturation: 0, lightness: 96 },
];

export default function Fireworks({ duration = 6500 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let stopped = false;
    let startTime = performance.now();
    let lastBurst = 0;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const launchRocket = (side?: "left" | "right") => {
      const chosenSide =
        side || (Math.random() < 0.5 ? "left" : "right");

      const fromLeft = chosenSide === "left";

      const startX = fromLeft
        ? random(-20, width * 0.05)
        : random(width * 0.95, width + 20);

      const targetX = fromLeft
        ? random(width * 0.08, width * 0.28)
        : random(width * 0.72, width * 0.92);

      const targetY = random(height * 0.18, height * 0.58);

      const dx = targetX - startX;
      const dy = targetY - height;

      rockets.push({
        x: startX,
        y: height + 10,
        targetX,
        targetY,
        vx: dx / 58,
        vy: dy / 58,
        life: 0,
        maxLife: 58,
        side: chosenSide,
      });
    };

    const explode = (x: number, y: number) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const count = window.innerWidth < 600 ? 52 : 78;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + random(-0.08, 0.08);
        const speed = random(1.4, 4.8);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.028,
          friction: 0.985,
          life: random(45, 82),
          maxLife: 82,
          size: random(0.8, 2.1),
          alpha: random(0.72, 1),
          hue: color.hue + random(-4, 4),
          trail: [],
        });
      }

      // A few slower glowing embers for a softer luxury look.
      for (let i = 0; i < 16; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(0.5, 1.7);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.018,
          friction: 0.99,
          life: random(65, 105),
          maxLife: 105,
          size: random(1.2, 2.8),
          alpha: random(0.45, 0.8),
          hue: 44,
          trail: [],
        });
      }
    };

    const drawRocket = (rocket: Rocket) => {
      const alpha = Math.max(0, 1 - rocket.life / rocket.maxLife);

      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y);
      ctx.lineTo(
        rocket.x - rocket.vx * 4,
        rocket.y - rocket.vy * 4
      );

      ctx.strokeStyle = `rgba(241,220,168,${alpha * 0.9})`;
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(241,220,168,0.8)";
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawParticle = (particle: Particle) => {
      const alpha =
        particle.alpha *
        Math.max(0, particle.life / particle.maxLife);

      if (particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(
            particle.trail[i].x,
            particle.trail[i].y
          );
        }

        ctx.strokeStyle = `hsla(${particle.hue}, 75%, 75%, ${
          alpha * 0.35
        })`;
        ctx.lineWidth = particle.size * 0.75;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = `hsla(${particle.hue}, 75%, 82%, ${alpha})`;
      ctx.shadowBlur = particle.size * 7;
      ctx.shadowColor = `hsla(${particle.hue}, 75%, 72%, ${
        alpha * 0.8
      })`;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const animate = (now: number) => {
      if (stopped) return;

      const elapsed = now - startTime;

      // Transparent canvas: the invitation/card underneath remains fully visible.
      ctx.clearRect(0, 0, width, height);

      // Launch alternating side fireworks during the active period.
      if (elapsed < duration - 900 && now - lastBurst > 650) {
        launchRocket("left");
        window.setTimeout(() => {
          if (!stopped) launchRocket("right");
        }, 220);

        if (Math.random() < 0.3) {
          window.setTimeout(() => {
            if (!stopped) launchRocket(Math.random() < 0.5 ? "left" : "right");
          }, 380);
        }

        lastBurst = now;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];

        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.life += 1;

        drawRocket(rocket);

        const distanceToTarget = Math.hypot(
          rocket.targetX - rocket.x,
          rocket.targetY - rocket.y
        );

        if (
          rocket.life >= rocket.maxLife ||
          distanceToTarget < 18
        ) {
          explode(rocket.x, rocket.y);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.trail.unshift({
          x: particle.x,
          y: particle.y,
        });

        if (particle.trail.length > 4) {
          particle.trail.pop();
        }

        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        particle.vy += particle.gravity;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;

        drawParticle(particle);

        if (
          particle.life <= 0 ||
          particle.x < -100 ||
          particle.x > width + 100 ||
          particle.y > height + 100
        ) {
          particles.splice(i, 1);
        }
      }

      if (elapsed < duration || rockets.length || particles.length) {
        raf = requestAnimationFrame(animate);
      }
    };

    // Start immediately with one burst from each side so the effect is obvious.
    window.setTimeout(() => {
      if (!stopped) {
        launchRocket("left");
        window.setTimeout(() => {
          if (!stopped) launchRocket("right");
        }, 280);
      }
    }, 80);

    raf = requestAnimationFrame(animate);

    const timeout = window.setTimeout(() => {
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      rockets.length = 0;
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
    }, duration + 1800);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      observer.disconnect();
      rockets.length = 0;
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
    };
  }, [duration]);

  return (
    <div
      className="fireworks-overlay"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 950,
        pointerEvents: "none",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        className="fireworks-canvas"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      />

      <div
        className="fireworks-message"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0,
            animation:
              "fireworksTextIn 1.1s ease-out 0.35s forwards, fireworksTextOut 1s ease-in 4.8s forwards",
            color: "rgba(241,220,168,0.9)",
            fontFamily: "var(--serif)",
            fontSize: "clamp(20px, 3vw, 34px)",
            letterSpacing: "0.16em",
            textShadow:
              "0 0 24px rgba(217,184,120,0.45)",
          }}
        >
          And the celebration begins...
        </p>
      </div>
    </div>
  );
}
