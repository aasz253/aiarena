import React, { useEffect, useRef } from 'react';

interface CyberArenaCanvasProps {
  className?: string;
  intensity?: 'subtle' | 'standard' | 'intense';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const CyberArenaCanvas: React.FC<CyberArenaCanvasProps> = ({ 
  className = '',
  intensity = 'standard' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Adjust particle density for performance & mobile
    const isMobile = width < 768;
    const count = isMobile ? 22 : intensity === 'intense' ? 55 : 35;

    const colors = ['#38bdf8', '#818cf8', '#a855f7', '#0284c7'];
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle perspective grid on bottom third
      const horizon = height * 0.65;
      ctx.save();
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.04)';
      ctx.lineWidth = 1;

      // Horizontal grid lines with perspective compression
      for (let y = horizon; y < height; y += 18 + (y - horizon) * 0.12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical converging perspective lines
      const vanishingX = width * 0.5;
      const step = isMobile ? 90 : 65;
      for (let x = -width * 0.5; x < width * 1.5; x += step) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizon);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // Update and draw particles
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = isMobile ? 85 : 125;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.globalAlpha = (1 - dist / maxDist) * 0.14;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};
