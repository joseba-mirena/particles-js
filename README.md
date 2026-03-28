# Particles ✨

*Lightweight Canvas Animation Library.*


* **Package:** Particles JS\
* **Version:** v1.0.0\
* **Copyright:** 2026 [`JosebaMirena.com`](https://www.josebamirena.com)\
* **License:** [`MIT License`](./LICENSE)\
* **Author:** Joseba Mirena ([@joseba-mirena](https://github.com/joseba-mirena))

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/joseba-mirena/particles-js)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Size](https://img.shields.io/badge/size-11.7%20kB-lightgrey)](https://github.com/joseba-mirena/particles-js)
[![Live Demo](https://img.shields.io/badge/Live_Demo-View-ff2c6e)](https://www.josebamirena.com/freebies-tools-resources/particles-javascript)

A simple, customizable particle system for web backgrounds, effects, and interactions.

## Features

### Particle Types
- `circle` – default smooth circles
- `star` – 5-pointed stars with caching for performance
- `confetti` – rectangles with random aspect ratio
- `triangle` – equilateral triangles
- `image` – uses one or multiple images (URL or array)
- `emoji` – renders emoji characters (string or array)

### Animation Modes
- `flow` – floating, bouncing particles with mouse repulsion & optional connections
- `rain` – continuous falling particles from top (smooth recycling)
- `firework` – occasional random bursts across the sky + click/touch explosions

### Performance Optimizations
- Viewport culling (skips off-screen particles)
- Star shape caching (offscreen canvas)
- Trail drawing throttled (every 3rd frame)
- Delayed particle creation when using images (no fallback flash)

### Other Capabilities
- Mouse interaction (repulsion/gravity-like push)
- Trails on bursts/fireworks
- Rainbow colors or custom palette
- Connect nearby particles with lines
- Responsive (auto-resizes with window)

---

## Installation

Add the minified version before the closing `</body>` tag:

```html
<script 
    src="https://opensource.josebamirena.com/particles/1.0.0/dist/particles.min.js" 
    integrity="sha384-ovQETGtGwaVATmqCOoMNIo1bur9NDv5+pG2BzxOqa5/M7BvYh3XhYjG607gXu/7D" 
    crossorigin="anonymous">
</script>
```

```html
    <div id="particles-container" aria-hidden="true"></div>
```

```html
// CSS
#particles-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

#particles-container canvas {
  /* clicks reach canvas */
  pointer-events: auto;
  display: block;
  width: 100%;
  height: 100%;
}
```


## Particles defaults

```html
    <script>
        const defaults = {
            container: 'particles-container', // Particles renderization background ID
            type: 'circle', // 'circle', 'star', 'confetti', 'triangle', 'image', 'emoji'
            mode: 'flow', // 'flow', 'rain', 'firework'
            imageUrl: null, // string or array (mandatory for type image)
            emoji: null, // string or array (mandatory for type emoji)
            count: 80,
            colors: ['#ff006e', '#8338ec', '#3a86ff', '#ffbe0b', '#fb5607'],
            useRainbow: false,
            burst: false,
            sizeMin: 5,
            sizeMax: 12,
            speed: 1.0,
            connect: false,
            connectDistance: 120,
            connectOpacity: 0.6,
            grabRadius: 100,
            opacity: 0.85,
            backgroundParticles: true,
            gravity: 0.08,
            rotationSpeed: 0.03,
            spawnRate: 0.005,
            trails: false,
            trailLength: 16,
            trailOpacity: 0.6,
        };
    </script>
```

## Particles Basic Usage

```html
<script>
    Particles.init({
        container: 'my-html-container-id', // particles-container by default
        type: 'circle',
        mode: 'flow',
        count: 120,
        sizeMin: 4,
        sizeMax: 12,
        opacity: 0.8,
        gravity: 0.05,
        backgroundParticles: true,
        trails: false,
    });
</script>
```


## Particles examples


### Stars fireworks

```html
<script>
    Particles.init({ 
        type: 'star', 
        mode: 'firework', 
        spawnRate: 0.025, 
        trails: true 
    });
</script>
```

### Colorful ADN circles

```html
<script>
    Particles.init({ 
        type: 'circle', 
        burst: false, 
        connect: true, 
        connectOpacity: 0.90, 
        connectDistance: 130 
    });
</script>
```

### Floating colorful stars

```html
<script>
    Particles.init({
        type: 'star',
        mode: 'flow',
        count: 140,
        sizeMin: 5,
        sizeMax: 14,
        colors: ['#ffffff', '#ffe066', '#ff99cc'],
        opacity: 0.9,
        connect: true,
        connectDistance: 140,
        connectOpacity: 0.25,
    });
</script>
```

### Smooth falling confetti rain

```html
<script>
    Particles.init({
        type: 'confetti',
        mode: 'rain',
        count: 180,
        sizeMin: 6,
        sizeMax: 18,
        gravity: 0.18,
        rotationSpeed: 0.05,
        opacity: 0.92,
    });
</script>
```

### Rocket emoji floating around

```html
<script>
    Particles.init({
        type: 'emoji',
        emoji: '🚀',
        mode: 'flow',
        count: 80,
        sizeMin: 18,
        sizeMax: 38,
        opacity: 0.95,
        gravity: 0.02,
        rotationSpeed: 0.04,
    });
</script>
```

### Mixed emoji rain

```html
<script>
    Particles.init({
        type: 'emoji',
        emoji: ['🎉', '✨', '💥', '🌈', '🔥'],
        mode: 'rain',
        count: 150,
        sizeMin: 20,
        sizeMax: 45,
        gravity: 0.12,
        rotationSpeed: 0.06,
    });
</script>
```


## 🎯 Live Demo

Try Particles JS live on my website:  
👉 [Particles JS Demo](https://www.josebamirena.com/freebies-tools-resources/particles-javascript)

See floating stars, confetti rain, rocket emojis, and fireworks in action.