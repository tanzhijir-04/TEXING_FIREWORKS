import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Particle, Rocket, ParticleState } from '../types';
import { sampleTextCoordinates } from '../services/textSampler';

interface FireworkCanvasHandle {
  launch: (text: string) => void;
}

const FireworkCanvas = forwardRef<FireworkCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Physics Constants
  const GRAVITY = 0.05;
  const FRICTION = 0.96;
  const HOVER_DURATION = 120; // frames (~2 seconds)
  const EXPLOSION_FORCE = 6;
  const EASE_SPEED = 0.08;

  // Initialize Canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // The Animation Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 1. Trail Effect (Key for visual quality)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Slow fade for trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Set Lighter composition for neon glow
    ctx.globalCompositeOperation = 'lighter';

    // 3. Update & Draw Rockets
    for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
      const r = rocketsRef.current[i];
      
      // Update position
      r.vy += GRAVITY;
      r.x += r.vx;
      r.y += r.vy;

      // Draw Rocket Head
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${r.hue}, 100%, 70%)`;
      ctx.fill();

      // Check for explosion condition (mid-upper screen or velocity slowdown)
      if (r.vy >= -1 || r.y < canvas.height * 0.3) {
        explodeRocket(r, canvas.width, canvas.height);
        rocketsRef.current.splice(i, 1);
      }
    }

    // 4. Update & Draw Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      
      // -- State Machine Logic --
      
      if (p.state === ParticleState.EXPLODE) {
        // Initial chaotic explosion
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        
        // Transition to Morph
        p.timer--;
        if (p.timer <= 0) {
          p.state = ParticleState.MORPH;
        }

      } else if (p.state === ParticleState.MORPH) {
        // Ease towards target coordinates
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        
        p.x += dx * EASE_SPEED;
        p.y += dy * EASE_SPEED;
        
        // If close enough, snap and hover
        const distSq = dx*dx + dy*dy;
        if (distSq < 4) {
          p.state = ParticleState.HOVER;
          p.timer = HOVER_DURATION + Math.random() * 30; // Add variation
        }

      } else if (p.state === ParticleState.HOVER) {
        // Shimmer / Jitter effect
        const jitterX = (Math.random() - 0.5) * 1.5;
        const jitterY = (Math.random() - 0.5) * 1.5;
        
        // Keep pulling slightly to target to prevent drifting too far
        p.x += (p.targetX - p.x) * 0.1 + jitterX;
        p.y += (p.targetY - p.y) * 0.1 + jitterY;
        
        // Color shimmer
        if (Math.random() > 0.9) p.alpha = Math.random() * 0.5 + 0.5;

        p.timer--;
        if (p.timer <= 0) {
            p.state = ParticleState.FALL;
            // Give it a random little push as it dies
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = Math.random() * 2;
        }

      } else if (p.state === ParticleState.FALL) {
        // Gravity takes over
        p.vy += GRAVITY;
        p.vx *= FRICTION; // Air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015; // Fade out
      }

      // -- Rendering --
      
      if (p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      // Draw a small circle
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      // Dynamic color: rotate hue slightly over time or based on velocity
      const hue = p.hue + (p.state === ParticleState.FALL ? 0 : Math.random() * 20 - 10);
      
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${p.alpha})`;
      ctx.fill();
    }

    animationFrameRef.current = requestAnimationFrame(loop);
  }, []);

  // Explode Logic: Turn Rocket into thousands of particles
  const explodeRocket = (rocket: Rocket, width: number, height: number) => {
    // 1. Get Target Points
    const targets = sampleTextCoordinates(rocket.targetText, width, height, 5);
    
    // 2. Spawn Particles
    const newParticles: Particle[] = targets.map((target) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * EXPLOSION_FORCE;
      
      return {
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        targetX: target.x,
        targetY: target.y,
        hue: rocket.hue,
        alpha: 1,
        size: Math.random() * 1.5 + 0.5,
        state: ParticleState.EXPLODE,
        timer: 15 + Math.random() * 10, // Frames to spend exploding before morphing
        shimmer: false
      };
    });

    particlesRef.current.push(...newParticles);
  };

  // Exposed API to Parent
  useImperativeHandle(ref, () => ({
    launch: (text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const x = canvas.width / 2;
        const y = canvas.height;
        
        rocketsRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 4, // Slight angle
            vy: -(Math.random() * 3 + 12), // Fast upward speed
            hue: Math.random() * 360,
            targetText: text,
            exploded: false
        });
    }
  }));

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [loop]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full bg-black z-0"
    />
  );
});

FireworkCanvas.displayName = 'FireworkCanvas';

export default FireworkCanvas;