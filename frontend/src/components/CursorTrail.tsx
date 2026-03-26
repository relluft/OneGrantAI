import { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  life: number;
  vx: number;
  vy: number;
  color: string;

  constructor(x: number, y: number, isMoving: boolean) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1.5;
    this.life = 1;
    
    // Spread more if moving
    const spread = isMoving ? 1.0 : 0.2;
    this.vx = (Math.random() - 0.5) * spread;
    this.vy = (Math.random() - 0.5) * spread;
    
    // Mix of blue (accent) and primary colors
    this.color = Math.random() > 0.4 ? '#00CEFF' : '#6C5CE7';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.035; // Fade speed (faster now)
    this.size *= 0.94; // Shrink speed
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    // Lower global alpha for less prominence
    ctx.globalAlpha = this.life * 0.4;
    ctx.fill();
    
    // Add glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.globalAlpha = 1; // reset alpha for other ops
  }
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const mouse = useRef({ x: -100, y: -100 });
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.current.x;
      const dy = e.clientY - mouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const count = Math.min(Math.max(Math.floor(dist / 4), 1), 5);
      
      // Initialize if it's the first move
      if (mouse.current.x !== -100) {
        // Spawn particles along the distance moved
        for(let i=0; i<count; i++) {
          const px = mouse.current.x + dx * (i/count);
          const py = mouse.current.y + dy * (i/count);
          particles.current.push(new Particle(px, py, dist > 3));
        }
      }
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tx = mouse.current.x;
      const ty = mouse.current.y;
      
      if (tx !== -100) {
        // Occasionally spawn subtle particles even when still to make it feel alive
        if (Math.random() < 0.05) {
           particles.current.push(new Particle(tx, ty, false));
        }
      }

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
      }

      particles.current = particles.current.filter(p => p.life > 0 && p.size > 0.1);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
