<!-- src/lib/components/ui/Confetti.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    export let duration = 4000; // Increased duration
    
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
      gravity: number; // Added gravity
      resistance: number; // Added resistance
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 5 + 3; // Slightly larger particles
        this.color = this.getRandomColor();
        this.velocity = {
          x: (Math.random() - 0.5) * 15, // Increased horizontal velocity range
          y: Math.random() * -15 - 5 // Increased initial upward velocity
        };
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5; // Faster rotation
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
        this.opacity = 1;
        this.gravity = 0.3; // Stronger gravity
        this.resistance = 0.98; // Air resistance
      }
      
      getRandomColor(): string {
        const colors = [
          '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', // Original gradient colors
          '#1dd1a1', '#f368e0', '#ff9f43', '#54a0ff' // Added vibrant colors
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
        // Apply air resistance
        this.velocity.x *= this.resistance;
        this.velocity.y *= this.resistance;
        
        // Move particle
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Gravity effect
        this.velocity.y += this.gravity;
        
        // Rotate
        this.rotation += this.rotationSpeed;
        
        // Fade out (start fading later)
        if (this.y > height * 0.2) { // Start fading after falling a bit
          this.opacity -= 0.015;
        }
        
        // Remove if off screen or faded
        return this.y < height + this.radius * 2 && this.opacity > 0;
      }
    }
    
    function initConfetti() {
      if (!canvas || !ctx) return;
      
      const { width, height } = canvas;
      confetti = []; // Clear previous confetti
      
      // Generate more confetti particles from center top
      const centerX = width / 2;
      const startY = height * 0.1; // Start slightly lower than top
      for (let i = 0; i < 300; i++) { // Increased particle count
        confetti.push(new Particle(centerX, startY));
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