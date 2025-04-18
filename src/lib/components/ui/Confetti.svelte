<!-- src/lib/components/ui/Confetti.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    export let duration = 6000; // Increased duration to 6 seconds
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    let confetti: Particle[] = [];
    let animationId: number;

    // List of available sound files
    const soundFiles = [
        'yay.mp3',

    ];
    let lastSoundIndex = -1; // Keep track of the last played sound
    
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
      
      constructor(x: number, y: number, canvasWidth: number) { // Added canvasWidth
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 6 + 2; // Slightly larger particles
        this.color = this.getRandomColor();
        // Wider horizontal velocity based on canvas width
        const maxHorizontalVelocity = Math.max(15, canvasWidth * 0.02); // Scale with width, min 15
        this.velocity = {
          x: (Math.random() - 0.5) * maxHorizontalVelocity * 2, // Wider range
          y: Math.random() * -20 - 10 // Stronger initial upward velocity
        };
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 12 - 6; // Slightly faster rotation
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
        this.opacity = 1;
        this.gravity = 0.35; // Slightly stronger gravity
        this.resistance = 0.97; // Slightly less resistance
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
        
        // Fade out (start fading a bit lower)
        if (this.y > height * 0.3) { // Start fading lower down
          this.opacity -= 0.01; // Fade slightly slower
        }
        
        // Remove if off screen (allow going slightly off sides) or faded
        return this.y < height + this.radius * 2 && this.x > -this.radius * 2 && this.x < width + this.radius * 2 && this.opacity > 0;
      }
    }
    
    function initConfetti() {
      if (!canvas || !ctx) return;
      
      const { width, height } = canvas;
      confetti = []; // Clear previous confetti
      
      // Generate more confetti particles from across the top edge
      const startY = -10; // Start slightly above the screen
      const particleCount = 300; // Increased from 150
      for (let i = 0; i < particleCount; i++) { // Increased and scaled particle count
        const startX = Math.random() * width; // Random start X across the width
        confetti.push(new Particle(startX, startY, width)); // Pass width to constructor
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
      // Play a random sound effect, avoiding repetition
      try {
        let soundIndex;
        do {
          soundIndex = Math.floor(Math.random() * soundFiles.length);
        } while (soundFiles.length > 1 && soundIndex === lastSoundIndex);

        lastSoundIndex = soundIndex;
        const soundPath = `/sounds/${soundFiles[soundIndex]}`;
        const audio = new Audio(soundPath);
        audio.volume = 0.7; // Set volume to 70%
        audio.play();
      } catch (error) {
        console.error('Failed to play confetti sound:', error);
      }

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