import { useEffect, useRef } from 'react';

class Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4; // Slower float
    this.vy = (Math.random() - 0.5) * 0.4;
    this.baseRadius = Math.random() * 2 + 1;
    this.color = Math.random() > 0.5 ? '#00CEFF' : '#6C5CE7';
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around screen
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, isHovering: boolean) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.baseRadius * (isHovering ? 1.5 : 1), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = isHovering ? 15 : 5;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let nodes: Node[] = [];
    
    // Density calculation
    let nodeCount = Math.floor((width * height) / 7500); 
    if (nodeCount > 200) nodeCount = 200; // Cap to prevent lag

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node(width, height));
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      // With fixed positioning, e.clientX / e.clientY map perfectly to canvas coordinates
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nodeCount = Math.floor((width * height) / 7500);
      if (nodeCount > 200) nodeCount = 200;
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node(width, height));
      }
    };

    window.addEventListener('resize', handleResize);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update(width, height);
        
        let isHovering = false;
        
        // Connect to mouse
        const dxMouse = mouseX - nodes[i].x;
        const dyMouse = mouseY - nodes[i].y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < 200) {
          isHovering = true;
          // Slowly attract to mouse creating a "magnetic" feel
          nodes[i].x += dxMouse * 0.015;
          nodes[i].y += dyMouse * 0.015;
          
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouseX, mouseY);
          // Highlight connection lines near mouse
          ctx.strokeStyle = `rgba(0, 206, 255, ${0.5 * (1 - distMouse / 200)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Lines between nodes
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            const opacity = 0.25 * (1 - dist / 100);
            // Change color depending if node is near mouse
            if (isHovering) {
               ctx.strokeStyle = `rgba(0, 206, 255, ${opacity * 2})`;
            } else {
               ctx.strokeStyle = `rgba(108, 92, 231, ${opacity})`;
            }
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        nodes[i].draw(ctx, isHovering);
      }

      // Add a subtle glowing orb behind the mouse on the canvas itself
      if (mouseX !== -1000) {
        const outerGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250);
        outerGlow.addColorStop(0, 'rgba(108, 92, 231, 0.15)');
        outerGlow.addColorStop(0.5, 'rgba(0, 206, 255, 0.05)');
        outerGlow.addColorStop(1, 'rgba(0, 206, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 250, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        pointerEvents: 'none', 
        zIndex: -1, 
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 85%)'
      }} 
    />
  );
}
