/*!
 * Particles - Lightweight Canvas Animation Library.
 * 
 * @package Particles JS
 * @version v1.0.0
 * @copyright 2026 JosebaMirena.com
 * @license MIT
 *          https://www.josebamirena.com/media/assets/particles/1.0.0/LICENSE
 * @author florin
 * 
 * MAIN FEATURES:
 * - Configurable particles container
 * - Ultra-lightweight minimized version (11.8 kB)
 * - Multiple particle types (visual styles):
 *    - `circle` – default smooth circles
 *    - `star` – 5-pointed stars with caching for performance
 *    - `confetti` – rectangles with random aspect ratio
 *    - `triangle` – equilateral triangles
 *    - `image` – uses one or multiple images (URL or array)
 *    - `emoji` – renders emoji characters (string or array)
 * - Three animation modes (behaviors):
 *    - `flow` (default) – floating, bouncing particles with mouse repulsion & optional connections
 *    - `rain` – continuous falling particles from top (smooth recycling, no bursts)
 *    - `firework` – occasional random bursts across the sky + click/touch explosions
 * - Performance optimizations:
 *    - Viewport culling (skips off-screen particles)
 *    - Star shape caching (offscreen canvas)
 *    - Trail drawing throttled (every 3rd frame)
 *    - Delayed particle creation when using images (no fallback flash)
 * - Other capabilities:
 *    - Mouse interaction (repulsion/gravity-like push)
 *    - Trails on bursts/fireworks
 *    - Rainbow colors or custom palette
 *    - Connect nearby particles with lines
 *    - Responsive (auto-resizes with window)
 * 
 * https://www.josebamirena.com/media/assets/particles/1.0.0/README
*/

const Particles = (function() {
    "use strict";

    let config = {};
    let container, canvas, ctx;
    let particles = []; // flow mode only
    let rainParticles = []; // rain mode only (recycled)
    let burstParticles = []; // bursts (click + firework auto)
    let mouse = { x: null, y: null, radius: 100 };
    let colorIndexCounter = 0;
    let imageObjects = [];
    let frameCounter = 0; // for staggered updates (trails, etc.)

    // Cache for pre-rendered star shapes (size + color -> canvas)
    const starCache = new Map();

    function getColor(index = 0) {
        if (config.useRainbow) {
            const effectiveIndex = index || colorIndexCounter++;
            const hue = (effectiveIndex * 137.508) % 360;
            const sat = 85 + Math.random() * 15;
            const lum = 55 + Math.random() * 20;
            return `hsl(${hue}, ${sat}%, ${lum}%)`;
        }
        if (config.colors && config.colors.length > 0) {
            return config.colors[Math.floor(Math.random() * config.colors.length)];
        }
        return '#8b5cf6';
    }

    function resize() {
        if (!container || !canvas) return;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        repositionParticles();
        if (config.mode === 'rain') initRainParticles();
        starCache.clear(); // clear cache on resize (sizes may change)
    }

    function repositionParticles() {
        particles.forEach(p => {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
        });
    }

    function initRainParticles() {
        rainParticles = [];
        for (let i = 0; i < config.count; i++) {
            rainParticles.push(createRainParticle());
        }
    }

    function createRainParticle() {
        const size = Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin;
        const p = {
            x: Math.random() * canvas.width,
            y: -50 - Math.random() * canvas.height * 2,
            vx: (Math.random() - 0.5) * 3,
            vy: 1.5 + Math.random() * 2.5,
            size: size,
            opacity: config.opacity * (0.6 + Math.random() * 0.4),
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * config.rotationSpeed * 0.08,
            color: getColor(),
            imageIndex: -1,
            emoji: null,
            width: 0,
            height: 0
        };

        if (config.type === 'image' && imageObjects.length > 0) {
            p.imageIndex = Math.floor(Math.random() * imageObjects.length);
        }
        if (config.type === 'emoji' && config.emoji) {
            const emojis = Array.isArray(config.emoji) ? config.emoji : [config.emoji];
            p.emoji = emojis[Math.floor(Math.random() * emojis.length)];
        }
        if (config.type === 'confetti') {
            p.width = size * (1 + Math.random() * 2);
            p.height = size * (0.4 + Math.random() * 1.2);
        }

        return p;
    }

    function updateMouse(e) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const cx = e.clientX || (e.touches && e.touches[0]?.clientX);
        const cy = e.clientY || (e.touches && e.touches[0]?.clientY);
        if (cx !== undefined) {
            mouse.x = cx - rect.left;
            mouse.y = cy - rect.top;
        }
    }

    function createBurst(x, y, isAuto = false) {
        const isFireworkMode = config.mode === 'firework';
        const count = isAuto ? 50 + Math.random() * 70 : 90 + Math.random() * 70;
        const speedBase = isFireworkMode ? 11 : 6;
        const maxLife = isFireworkMode ? 160 : 220;

        if (isAuto && config.mode === 'firework') {
            x = Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
            y = Math.random() * (canvas.height * 0.6) + canvas.height * 0.1;
        }

        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 2 * i / count + (Math.random() - 0.5) * 0.9;
            const speed = Math.random() * speedBase + 3;

            const particle = {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (isAuto ? 8 + Math.random() * 6 : 0),
                size: Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin,
                opacity: 1,
                life: 0,
                maxLife,
                color: getColor(i),
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * config.rotationSpeed * 1.8,
                trail: (isFireworkMode || isAuto) && config.trails ? [] : null,
                imageIndex: -1,
                emoji: null,
                width: 0,
                height: 0
            };

            if (config.type === 'image' && imageObjects.length > 0) {
                particle.imageIndex = Math.floor(Math.random() * imageObjects.length);
            }
            if (config.type === 'emoji' && config.emoji) {
                const emojis = Array.isArray(config.emoji) ? config.emoji : [config.emoji];
                particle.emoji = emojis[Math.floor(Math.random() * emojis.length)];
            }
            if (config.type === 'confetti') {
                particle.width = particle.size * (1 + Math.random() * 2);
                particle.height = particle.size * (0.4 + Math.random() * 1.2);
            }

            burstParticles.push(particle);
        }
    }

    function getStarCanvas(size, color) {
        const key = `star_${Math.round(size*10)}_${color}`;
        if (starCache.has(key)) return starCache.get(key);

        const off = document.createElement('canvas');
        const s = size * 3;
        off.width = s;
        off.height = s;
        const octx = off.getContext('2d');
        octx.fillStyle = color;
        octx.translate(s/2, s/2);

        const outer = size * 1.4;
        const inner = size * 0.5;
        octx.beginPath();
        for (let j = 0; j < 10; j++) {
            const r = j % 2 === 0 ? outer : inner;
            const ang = (Math.PI / 5) * j - Math.PI / 2;
            octx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        octx.closePath();
        octx.fill();

        starCache.set(key, off);
        return off;
    }

    function drawParticle(p) {
        // Skip drawing if particle is far outside visible area
        const margin = p.size * 3;
        if (p.x < -margin || p.x > canvas.width + margin ||
            p.y < -margin || p.y > canvas.height + margin) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity * (1 - (p.life / p.maxLife || 0) * 0.5);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const canUseImage = p.imageIndex >= 0 && imageObjects[p.imageIndex]?.complete && imageObjects[p.imageIndex].naturalWidth > 0;

        if (canUseImage) {
            const img = imageObjects[p.imageIndex];
            const sz = p.size * 2;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, -p.size, -p.size, sz, sz);
        } else if (p.emoji) {
            // Emoji rendering – centered
            ctx.font = `${Math.round(p.size * 2)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, 0, 0);
        } else {
            ctx.fillStyle = p.color;

            if (config.type === 'star') {
                const cached = getStarCanvas(p.size, p.color);
                ctx.drawImage(cached, -p.size * 1.5, -p.size * 1.5);
            } else if (config.type === 'triangle') {
                const h = p.size * Math.sqrt(3) / 2;
                ctx.beginPath();
                ctx.moveTo(0, -h);
                ctx.lineTo(p.size, h);
                ctx.lineTo(-p.size, h);
                ctx.closePath();
                ctx.fill();
            } else if (config.type === 'confetti') {
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            } else {
                // circle by default
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0.1, p.size), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    function drawTrails() {
        // Performance: only draw trails every 3rd frame 
        //   (less noticeable flicker, big CPU saving)
        if (frameCounter % 3 !== 0) return;

        for (const p of burstParticles) {
            if (!p.trail || p.trail.length < 2) continue;
            ctx.save();
            ctx.lineWidth = 2.8;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            for (let j = 1; j < p.trail.length; j++) {
                const alpha = (j / p.trail.length) * config.trailOpacity * (1 - (p.life / p.maxLife || 0));
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(p.trail[j-1].x, p.trail[j-1].y);
                ctx.lineTo(p.trail[j].x, p.trail[j].y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function animate() {
        frameCounter++;

        if (canvas.width === 0 || canvas.height === 0) {
            resize();
            return requestAnimationFrame(animate);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Firework auto bursts
        if (config.backgroundParticles && config.mode === 'firework' && Math.random() < config.spawnRate) {
            createBurst(0, 0, true);
        }

        // 1. Draw connections FIRST (so they are behind particles)
        if (config.connect && config.mode === 'flow') {  // only makes sense in flow mode
            connectParticles();
        }

        // 2. Flow mode background particles
        if (config.backgroundParticles && config.mode === 'flow') {
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy + config.gravity * 0.3;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - p.x, dy = mouse.y - p.y;
                    const d = Math.hypot(dx, dy);
                    if (d < mouse.radius) {
                        const f = (mouse.radius - d) / mouse.radius;
                        p.x -= dx * f * 0.1;
                        p.y -= dy * f * 0.1;
                    }
                }
                p.rotation += p.rotSpeed;
                drawParticle(p);
            });
        }

        // 3. Rain mode – continuous falling & recycling
        if (config.backgroundParticles && config.mode === 'rain') {
            rainParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy + config.gravity;
                p.rotation += p.rotSpeed;

                p.vx += (Math.random() - 0.5) * 0.06;

                if (p.y > canvas.height + p.size * 3) {
                    p.x = Math.random() * canvas.width;
                    p.y = -50 - Math.random() * 200;
                    p.vy = 1.5 + Math.random() * 2.5;
                    p.opacity = config.opacity * (0.6 + Math.random() * 0.4);
                    p.rotation = Math.random() * Math.PI * 2;
                }

                drawParticle(p);
            });
        }

        // 4. Bursts (click + firework auto) – drawn on top
        for (let i = burstParticles.length - 1; i >= 0; i--) {
            const p = burstParticles[i];
            if (p.trail) {
                p.trail.push({x: p.x, y: p.y});
                if (p.trail.length > config.trailLength) p.trail.shift();
            }

            p.x += p.vx;
            p.y += p.vy + config.gravity;
            p.vy += config.gravity * (config.mode === 'firework' ? 0.25 : 0.8);
            p.life++;
            p.opacity = 1 - (p.life / p.maxLife);
            p.rotation += p.rotSpeed || 0;

            drawParticle(p);

            if (p.life >= p.maxLife || p.opacity < 0.02 || p.y > canvas.height + 150) {
                burstParticles.splice(i, 1);
            }
        }

        if (config.trails) drawTrails();

        requestAnimationFrame(animate);
    }

    function connectParticles() {
        if (!config.connect || config.connectDistance <= 0 || particles.length < 2) return;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.hypot(dx, dy);
                if (dist < config.connectDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = `rgba(139,92,246,${config.connectOpacity * (1 - dist / config.connectDistance)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function init(userConfig = {}) {
        if (userConfig === false) return;

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

        config = Object.assign({}, defaults, userConfig);

        container = document.getElementById(config.container);
        if (!container) return console.error('[Particles] Container not found');

        canvas = document.createElement("canvas");
        container.appendChild(canvas);
        ctx = canvas.getContext("2d");

        resize();

        // Load images if type = 'image'
        if (config.type === 'image' && config.imageUrl) {
            const urls = Array.isArray(config.imageUrl) ? config.imageUrl : [config.imageUrl];
            let loaded = 0;

            const tryStartAnimation = () => {
                if (loaded === urls.length) {
                    // All images ready → now safe to create particles
                    if (config.backgroundParticles) {
                        if (config.mode === 'flow') {
                            createFlowParticles();
                        } else if (config.mode === 'rain') {
                            initRainParticles();
                        }
                    }
                    console.log('[Particles] All images loaded → animation started');
                }
            };

            urls.forEach((url, i) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = url;

                img.onload = () => {
                    loaded++;
                    console.log(`[Particles] Image ${i+1}/${urls.length} loaded`);
                    tryStartAnimation();
                };

                img.onerror = () => {
                    console.error('[Particles] Image failed to load:', url);
                    loaded++; // still count it so we don't wait forever
                    tryStartAnimation();
                };

                imageObjects.push(img);
            });

            // If no images or instant load → start immediately
            if (urls.length === 0) tryStartAnimation();
        } else {
            // No images → start normally
            if (config.backgroundParticles) {
                if (config.mode === 'flow') {
                    createFlowParticles();
                } else if (config.mode === 'rain') {
                    initRainParticles();
                }
            }
        }

        // Helper: create flow particles (delayed if images are loading)
        function createFlowParticles() {
            particles = [];
            class FlowParticle {
                constructor() { this.reset(); }
                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * config.speed * 1.5;
                    this.vy = (Math.random() - 0.5) * config.speed * 1.5;
                    this.size = Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin;
                    this.opacity = config.opacity;
                    this.rotation = Math.random() * Math.PI * 2;
                    this.rotSpeed = (Math.random() - 0.5) * config.rotationSpeed * 1.2;
                    this.color = getColor();
                    this.imageIndex = -1;
                    this.emoji = null;
                    this.width = 0;
                    this.height = 0;

                    if (config.type === 'image' && imageObjects.length > 0) {
                        this.imageIndex = Math.floor(Math.random() * imageObjects.length);
                    }
                    if (config.type === 'emoji' && config.emoji) {
                        const emojis = Array.isArray(config.emoji) ? config.emoji : [config.emoji];
                        this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
                    }
                    if (config.type === 'confetti') {
                        this.width = this.size * (1 + Math.random() * 2);
                        this.height = this.size * (0.4 + Math.random() * 1.2);
                    }
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy + config.gravity * 0.3;
                    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                    if (mouse.x && mouse.y) {
                        const dx = mouse.x - this.x, dy = mouse.y - this.y;
                        const d = Math.hypot(dx, dy);
                        if (d < mouse.radius) {
                            const f = (mouse.radius - d) / mouse.radius;
                            this.x -= dx * f * 0.1;
                            this.y -= dy * f * 0.1;
                        }
                    }
                    this.rotation += this.rotSpeed;
                }
                draw() { drawParticle(this); }
            }

            for (let i = 0; i < config.count; i++) {
                particles.push(new FlowParticle());
            }
        }

        window.addEventListener("resize", resize);
        container.addEventListener("mousemove", updateMouse);
        container.addEventListener("touchmove", updateMouse, { passive: true });
        container.addEventListener("mouseout", () => mouse.x = mouse.y = null);
        container.addEventListener("touchend", () => mouse.x = mouse.y = null);

        if (config.burst !== false) {
            const fireBurst = (e) => {
                e.preventDefault();
                const rect = container.getBoundingClientRect();
                const tx = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
                const ty = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
                createBurst(tx, ty);
            };
            container.addEventListener("click", fireBurst);
            container.addEventListener("touchend", fireBurst, { passive: false });
        }

        animate();
    }

    return { init };
})();