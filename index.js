/* ==========================================================================
   SealSkin website: the app marquee, the hero backdrop, the install tabs,
   the copy buttons, the catalog count, and the screenshot lightbox.
   Nothing here is inline, so the page's Content-Security-Policy holds.
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ apps */

function createAppCard(app) {
    const a = document.createElement('a');
    a.className = 'app-card';
    a.href = app.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const img = document.createElement('img');
    img.src = app.img;
    img.alt = '';
    img.width = 72;
    img.height = 72;
    img.loading = 'lazy';
    img.decoding = 'async';
    a.appendChild(img);

    const name = document.createElement('span');
    name.className = 'app-name';
    name.textContent = app.name;
    a.appendChild(name);

    if (app.note) {
        const note = document.createElement('span');
        note.className = 'app-note';
        note.textContent = app.note;
        a.appendChild(note);
    }
    return a;
}

function initAppMarquee(container, first, second) {
    const LAP_SECONDS = 70;
    const REDUCED_LAP_SECONDS = 210;
    const RESUME_DELAY_MS = 1500;

    let pos = 0;
    let lastFrame = null;
    let frame = null;
    let onScreen = false;
    let holdUntil = 0;
    let pointerDown = false;

    const period = () => second.offsetLeft - first.offsetLeft;

    function step(now) {
        frame = null;
        if (!onScreen) { lastFrame = null; return; }
        if (lastFrame !== null && !pointerDown && now >= holdUntil) {
            const dt = Math.min(now - lastFrame, 100) / 1000;
            const lap = period();
            if (lap > 0) {
                const lapSeconds = reduceMotion.matches ? REDUCED_LAP_SECONDS : LAP_SECONDS;
                pos += (lap / lapSeconds) * dt;
                if (pos >= lap) pos -= lap;
                container.scrollLeft = pos;
            }
        }
        lastFrame = now;
        frame = requestAnimationFrame(step);
    }

    function schedule() {
        if (frame === null && onScreen) frame = requestAnimationFrame(step);
    }

    function hold(ms) {
        holdUntil = Math.max(holdUntil, performance.now() + ms);
    }

    container.addEventListener('scroll', () => {
        const actual = container.scrollLeft;
        if (Math.abs(actual - pos) > 1) {
            const lap = period();
            pos = lap > 0 ? actual % lap : actual;
            hold(RESUME_DELAY_MS);
        }
    }, { passive: true });

    const press = () => { pointerDown = true; };
    const release = () => { pointerDown = false; hold(RESUME_DELAY_MS); };
    container.addEventListener('pointerdown', press);
    container.addEventListener('pointerup', release);
    container.addEventListener('pointercancel', release);
    container.addEventListener('touchstart', press, { passive: true });
    container.addEventListener('touchend', release, { passive: true });
    container.addEventListener('wheel', () => hold(RESUME_DELAY_MS), { passive: true });

    new IntersectionObserver((entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        schedule();
    }).observe(container);
}

function initHeroBackdrop(list) {
    const container = document.getElementById('hero-bg');
    if (!container) return;

    const colCount = window.innerWidth <= 768 ? 5 : 7;
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const sliceSize = 15;

    for (let i = 0; i < colCount; i++) {
        const col = document.createElement('div');
        col.className = 'hero-col';
        const track = document.createElement('div');
        track.className = 'hero-col-track';

        const start = (i * sliceSize) % shuffled.length;
        const colApps = shuffled.slice(start, start + sliceSize);
        if (colApps.length < sliceSize) colApps.push(...shuffled.slice(0, sliceSize - colApps.length));

        // Twice over, so the column scrolls seamlessly by half its height.
        for (let pass = 0; pass < 2; pass++) {
            colApps.forEach((app) => {
                const img = document.createElement('img');
                img.className = 'hero-icon-img';
                img.src = app.img;
                img.alt = '';
                img.width = 70;
                img.height = 70;
                img.decoding = 'async';
                track.appendChild(img);
            });
        }
        col.appendChild(track);
        container.appendChild(col);
    }

    new IntersectionObserver((entries) => {
        container.classList.toggle('is-paused', !entries.some((entry) => entry.isIntersecting));
    }).observe(container.parentElement);
}

if (typeof apps !== 'undefined') {
    const track = document.getElementById('appTrack');
    if (track) {
        const first = document.createElement('div');
        first.className = 'sliding-track';
        const second = document.createElement('div');
        second.className = 'sliding-track';
        second.setAttribute('aria-hidden', 'true');
        apps.forEach((app) => first.appendChild(createAppCard(app)));
        apps.forEach((app) => second.appendChild(createAppCard(app)));
        track.appendChild(first);
        track.appendChild(second);
        initAppMarquee(track, first, second);
    }
    initHeroBackdrop(apps);

    // The count rounds down to a tidy number so it stays true between syncs.
    const rounded = Math.floor(apps.length / 10) * 10;
    document.querySelectorAll('[data-app-count]').forEach((el) => { el.textContent = `${rounded}+`; });
}

/* ------------------------------------------------------------------ tabs */

document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const panes = buttons.map((b) => document.getElementById(b.getAttribute('aria-controls')));

    const select = (index, focus) => {
        buttons.forEach((b, i) => {
            const on = i === index;
            b.setAttribute('aria-selected', String(on));
            b.tabIndex = on ? 0 : -1;
            panes[i].hidden = !on;
        });
        if (focus) buttons[index].focus();
    };

    buttons.forEach((b, i) => {
        b.addEventListener('click', () => select(i, false));
        b.addEventListener('keydown', (event) => {
            const delta = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: buttons.length - 1 - i }[event.key];
            if (delta === undefined) return;
            event.preventDefault();
            select((i + delta + buttons.length) % buttons.length, true);
        });
    });
});

/* ------------------------------------------------------------------ copy */

function copyCode(btn) {
    const block = btn.parentElement;
    const clone = block.cloneNode(true);
    clone.querySelector('.copy-btn').remove();
    const text = clone.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = original; }, 2000);
    });
}

document.querySelectorAll('.copy-btn').forEach((btn) => btn.addEventListener('click', () => copyCode(btn)));

/* -------------------------------------------------------------- lightbox */

const lightbox = document.createElement('div');
lightbox.className = 'lightbox-overlay';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-label', 'Enlarged image');
const lightboxImg = document.createElement('img');
lightboxImg.alt = '';
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

const closeLightbox = () => { lightbox.classList.remove('open'); lightboxImg.src = ''; };

document.querySelectorAll('.tech-visual img, .browser-frame img').forEach((img) => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
    });
});
lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
