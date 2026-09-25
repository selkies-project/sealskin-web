const track = document.getElementById('appTrack');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const baseImgUrl = "https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/";

function createAppCard(app) {
    const a = document.createElement('a');
    a.className = 'app-card';
    a.href = app.url;
    a.target = "_blank";
    
    const img = document.createElement('img');
    if (app.img.startsWith('http')) {
        img.src = app.img;
    } else {
        img.src = baseImgUrl + app.img;
    }
    img.alt = app.name;
    img.loading = "eager";
    img.decoding = "async";
    const span = document.createElement('span');
    span.textContent = app.name;
    a.appendChild(img);
    a.appendChild(span);
    return a;
}

if (typeof apps !== 'undefined') {
    const track1 = document.createElement('div');
    track1.className = 'sliding-track';
    const track2 = document.createElement('div');
    track2.className = 'sliding-track';
    track2.setAttribute('aria-hidden', 'true'); 
    apps.forEach(app => track1.appendChild(createAppCard(app)));
    apps.forEach(app => track2.appendChild(createAppCard(app)));
    track.appendChild(track1);
    track.appendChild(track2);
    initAppMarquee(track, track1, track2);
    initHeroAnimation();
}

function initAppMarquee(container, first, second) {
    const LAP_SECONDS = 60;
    const REDUCED_LAP_SECONDS = 180;
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

    const observer = new IntersectionObserver(entries => {
        onScreen = entries.some(entry => entry.isIntersecting);
        schedule();
    });
    observer.observe(container);
}

function initHeroAnimation() {
    const container = document.getElementById('hero-bg');
    if (!container) return;

    const colCount = window.innerWidth <= 768 ? 5 : 7;
    const shuffledApps = [...apps].sort(() => 0.5 - Math.random());

    for (let i = 0; i < colCount; i++) {
        const col = document.createElement('div');
        col.className = 'hero-col';
        
        const track = document.createElement('div');
        track.className = 'hero-col-track';

        const sliceSize = 15;
        const start = (i * sliceSize) % shuffledApps.length;
        const colApps = shuffledApps.slice(start, start + sliceSize);
        
        if (colApps.length < sliceSize) {
            colApps.push(...shuffledApps.slice(0, sliceSize - colApps.length));
        }

        const renderImages = () => {
            colApps.forEach(app => {
                const img = document.createElement('img');
                img.className = 'hero-icon-img';
                img.src = app.img.startsWith('http') ? app.img : baseImgUrl + app.img;
                img.alt = '';
                img.decoding = "async";
                track.appendChild(img);
            });
        };

        renderImages();
        renderImages();

        col.appendChild(track);
        container.appendChild(col);
    }

    new IntersectionObserver(entries => {
        container.classList.toggle('is-paused', !entries.some(entry => entry.isIntersecting));
    }).observe(container.parentElement);
}

function copyCode(btn) {
    const codeBlock = btn.parentElement;
    const clone = codeBlock.cloneNode(true);
    clone.querySelector('.copy-btn').remove();
    const codeText = clone.innerText.trim();
    navigator.clipboard.writeText(codeText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    });
}

document.querySelectorAll('.copy-btn').forEach((btn) => btn.addEventListener('click', () => copyCode(btn)));

const lightbox = document.createElement('div');
lightbox.className = 'lightbox-overlay';
const lbImg = document.createElement('img');
lightbox.appendChild(lbImg);
document.body.appendChild(lightbox);

document.querySelectorAll('.tech-visual img').forEach(img => {
    img.addEventListener('click', () => {
        lbImg.src = img.src;
        lightbox.style.display = 'flex';
    });
});

lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
});
