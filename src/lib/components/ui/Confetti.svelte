<!-- src/lib/components/ui/Confetti.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    export let duration = 3000; // Duration in ms
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    let confetti: Particle[] = [];
    let animationId: number;
    
    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
      rotation: number;
      rotationSpeed: number;
      shape: string;
      opacity: number;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 4 + 2;
        this.color = this.getRandomColor();
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: Math.random() * 3 + 2
        };
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 5 - 2.5;
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
        this.opacity = 1;
      }
      
      getRandomColor(): string {
        const colors = [
          '#3498db', // Primary blue
          '#2ecc71', // Green
          '#e74c3c', // Red
          '#f39c12', // Orange
          '#9b59b6'  // Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        ctx.fillStyle = this.color;
        
        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        }
        
        ctx.restore();
      }
      
      update(width: number, height: number) {
        // Move particle
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Gravity effect
        this.velocity.y += 0.1;
        
        // Rotate
        this.rotation += this.rotationSpeed;
        
        // Fade out
        this.opacity -= 0.02;
        
        // Remove if off screen or faded
        return this.y < height && this.opacity > 0;
      }
    }
    
    function initConfetti() {
      if (!canvas || !ctx) return;
      
      const { width, height } = canvas;
      
      // Generate confetti particles from center
      for (let i = 0; i < 100; i++) {
        confetti.push(new Particle(width / 2, height / 2));
      }
    }
    
    function animateConfetti() {
      if (!canvas || !ctx) return;
      
      const { width, height } = canvas;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      confetti = confetti.filter(particle => particle.update(width, height));
      confetti.forEach(particle => particle.draw(ctx!));
      
      // Continue animation if particles exist
      if (confetti.length > 0) {
        animationId = requestAnimationFrame(animateConfetti);
      }
    }
    
    onMount(() => {
      // Get canvas context
      ctx = canvas.getContext('2d');
      
      // Set canvas to full window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize confetti
      initConfetti();
      
      // Start animation
      animationId = requestAnimationFrame(animateConfetti);
      
      // Stop animation after duration
      const timeoutId = setTimeout(() => {
        cancelAnimationFrame(animationId);
        confetti = [];
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }, duration);
      
      // Cleanup function
      return () => {
        cancelAnimationFrame(animationId);
        clearTimeout(timeoutId);
      };
    });
  </script>
  
  <canvas 
    bind:this={canvas} 
    class="confetti-canvas"
  ></canvas>
  
  <style>
    .confetti-canvas {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
    }
  </style>