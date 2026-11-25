(() => {
    "use strict";
    const root = document.querySelector("[data-advent-root]");
    if (!root) return;
    const locationDialog = root.querySelector("[data-location-dialog]");
    const scene = root.querySelector("[data-advent-scene]");
    let seed = 91317;
    function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    const surfaces = [
        { canvas: root.querySelector("[data-map-snow]"), map: true },
        { canvas: root.querySelector("[data-scene-snow]"), map: false }
    ].map((surface) => ({ ...surface, context: surface.canvas.getContext("2d"), width: 0, height: 0, particles: [] }));
    function resize(surface) {
        const box = surface.canvas.getBoundingClientRect();
        if (box.width < 1 || box.height < 1) return;
        const width = Math.round(box.width), height = Math.round(box.height);
        if (width === surface.width && height === surface.height) return;
        surface.width = width; surface.height = height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        surface.canvas.width = Math.ceil(width * dpr); surface.canvas.height = Math.ceil(height * dpr);
        surface.context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(52, Math.min(158, Math.round(width * height / 5800)));
        surface.particles = Array.from({ length: count }, (_, index) => {
            const near = index % 7 === 0, far = index % 3 === 0;
            return { x: random() * width, y: random() * height, radius: near ? 3.2 + random() * 1.8 : far ? .8 + random() * .9 : 1.5 + random() * 1.5,
                speed: (near ? 75 : far ? 22 : 42) + random() * 36 + height * .025,
                opacity: near ? .8 : far ? .34 : .62, phase: random() * Math.PI * 2 };
        });
    }
    const observer = new ResizeObserver(() => { surfaces.forEach(resize); start(); });
    surfaces.forEach((surface) => observer.observe(surface.canvas));
    function clipExterior(context, width, height, profile) {
        if (profile === "window") {
            context.beginPath(); context.rect(0, 0, width, height);
            // The warm room, elf and cookies remain indoors.
            context.rect(width * .34, 0, width * .44, height * .74);
            context.clip("evenodd");
        } else if (profile === "apartment") {
            // Snow is visible through the upper arch, above the tree and elf.
            context.beginPath(); context.moveTo(width * .34, height * .27);
            context.lineTo(width * .34, height * .14);
            context.bezierCurveTo(width * .34, -height * .025, width * .60, -height * .025, width * .60, height * .14);
            context.lineTo(width * .60, height * .27); context.closePath(); context.clip();
        }
    }
    function drawSteam(context, width, height, seconds) {
        for (let index = 0; index < 3; index++) {
            const progress = (seconds / 3.8 + index / 3) % 1;
            const x = width * (.56 + index * .035), y = height * (.657 - progress * .07);
            context.globalAlpha = Math.sin(progress * Math.PI) * .45;
            context.strokeStyle = "#fff3d1"; context.lineWidth = Math.max(1.3, width * .0017); context.lineCap = "round";
            context.beginPath(); context.moveTo(x, y);
            context.bezierCurveTo(x - width * .012, y - height * .025, x + width * .01, y - height * .04, x, y - height * .075);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
    function draw(surface, delta, seconds) {
        resize(surface);
        const { context, width, height } = surface;
        if (!width || !height) return;
        context.clearRect(0, 0, width, height);
        const profile = surface.map ? "city" : scene.dataset.scene;
        const weather = root.dataset.weather || "quiet";
        const gust = weather === "gust" ? 76 : weather === "flurries" ? 31 : 9;
        const wind = gust + Math.sin(seconds * .67) * 17 + Math.sin(seconds * 1.1) * 8;
        context.save(); clipExterior(context, width, height, profile);
        context.fillStyle = "#fff8e8";
        for (const particle of surface.particles) {
            particle.x += (wind + Math.sin(seconds + particle.phase) * 12) * delta;
            particle.y += particle.speed * (weather === "gust" ? 1.18 : 1) * delta;
            if (particle.y > height + 8) { particle.y = -8; particle.x = random() * width; }
            if (particle.x > width + 10) particle.x = -10;
            if (particle.x < -10) particle.x = width + 10;
            context.globalAlpha = particle.opacity;
            context.beginPath(); context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); context.fill();
        }
        context.restore(); context.globalAlpha = 1;
        if (profile === "window") drawSteam(context, width, height, seconds);
    }
    let animation = 0, lastTime = 0, frames = 0;
    function active() { return !root.hidden && !document.hidden && root.dataset.motion === "on" && document.body.classList.contains("site-entered"); }
    function frame(time) {
        animation = 0;
        if (!active()) return;
        const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
        lastTime = time;
        for (const surface of surfaces) if (surface.map || locationDialog.open) draw(surface, delta, time / 1000);
        frames++;
        if (frames % 12 === 0) root.dataset.snowFrames = String(frames);
        animation = window.requestAnimationFrame(frame);
    }
    function start() {
        if (!active()) { if (animation) window.cancelAnimationFrame(animation); animation = 0; lastTime = 0; return; }
        if (!animation) { lastTime = 0; animation = window.requestAnimationFrame(frame); }
    }
    ["advent:motion", "advent:scene", "advent:render"].forEach((event) => root.addEventListener(event, start));
    document.addEventListener("maypage:entered", start);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("pageshow", start);
    window.addEventListener("pagehide", () => { if (animation) cancelAnimationFrame(animation); animation = 0; lastTime = 0; });
    surfaces.forEach(resize); start();
})();
