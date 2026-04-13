/* ============================================================
   常緑ラボ — script.js
   Map Pan/Zoom + Scroll Reveal + Header Shrink
   ============================================================ */

(function () {
    'use strict';

    // ── 1. Load Map Fragment ──
    const target = document.getElementById('map-canvas');
    if (target) {
        fetch('map_fragment.html')
            .then(r => r.text())
            .then(html => {
                target.innerHTML = html;
                // Auto-fit: scale to show the full canvas within the wrapper
                const vp = target.querySelector('.canvas-viewport');
                if (vp) {
                    const wrapper = document.getElementById('map-container');
                    const vpW = parseFloat(vp.style.width) || 4400;
                    const vpH = parseFloat(vp.style.height) || 2700;
                    const wW = wrapper.offsetWidth;
                    const wH = wrapper.offsetHeight;
                    // Fit the entire canvas within the wrapper
                    scale = Math.min(wW / vpW, wH / vpH) * 0.92;
                    // Center it
                    panX = (wW - vpW * scale) / 2;
                    panY = (wH - vpH * scale) / 2;
                    applyTransform();
                }
            })
            .catch(() => {
                target.innerHTML = '<p style="padding:40px;color:#999">Map data could not be loaded.</p>';
            });
    }

    // ── 2. Pan & Zoom ──
    let scale = 0.22;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let startX, startY;

    const wrapper = document.getElementById('map-container');
    const canvas = document.getElementById('map-canvas');

    function applyTransform() {
        if (canvas) {
            canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        }
    }
    applyTransform();

    if (wrapper) {
        // Mouse drag
        wrapper.addEventListener('mousedown', e => {
            isPanning = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            wrapper.style.cursor = 'grabbing';
        });
        window.addEventListener('mousemove', e => {
            if (!isPanning) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyTransform();
        });
        window.addEventListener('mouseup', () => {
            isPanning = false;
            if (wrapper) wrapper.style.cursor = 'grab';
        });

        // Touch drag
        wrapper.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                isPanning = true;
                startX = e.touches[0].clientX - panX;
                startY = e.touches[0].clientY - panY;
            }
        }, { passive: true });
        wrapper.addEventListener('touchmove', e => {
            if (!isPanning || e.touches.length !== 1) return;
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            applyTransform();
        }, { passive: true });
        wrapper.addEventListener('touchend', () => { isPanning = false; });

        // Wheel zoom
        wrapper.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.03 : 0.03;
            scale = Math.min(1.5, Math.max(0.08, scale + delta));
            applyTransform();
        }, { passive: false });

        // Pinch zoom
        let lastPinchDist = 0;
        wrapper.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                isPanning = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastPinchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });
        wrapper.addEventListener('touchmove', e => {
            if (e.touches.length !== 2) return;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diff = dist - lastPinchDist;
            scale = Math.min(1.5, Math.max(0.08, scale + diff * 0.002));
            lastPinchDist = dist;
            applyTransform();
        }, { passive: true });
    }

    // Zoom buttons
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');
    if (zoomIn) zoomIn.addEventListener('click', () => { scale = Math.min(1.5, scale + 0.05); applyTransform(); });
    if (zoomOut) zoomOut.addEventListener('click', () => { scale = Math.max(0.08, scale - 0.05); applyTransform(); });
    if (zoomReset) zoomReset.addEventListener('click', () => { scale = 0.22; panX = 0; panY = 0; applyTransform(); });

    // ── 3. Header Scroll Effect ──
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    // ── 4. Reveal Animations ──
    // Hero elements: trigger immediately
    document.querySelectorAll('.js-reveal').forEach(el => {
        setTimeout(() => el.classList.add('is-visible'), 150);
    });

    // Scroll-triggered elements
    const faders = document.querySelectorAll('.js-fade');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        faders.forEach(el => io.observe(el));
    } else {
        faders.forEach(el => el.classList.add('is-visible'));
    }

})();
