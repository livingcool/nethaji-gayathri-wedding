const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const reveals = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');reveals.unobserve(e.target)}}), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(e=>reveals.observe(e));
}

const lane = document.querySelector('.car-lane');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) lane.classList.add('arrived'); }), {threshold:.35}).observe(lane);
} else {
  lane.classList.add('arrived');
}

const templeTrack = document.querySelector('.temple-scroll');
const templeFacade = document.getElementById('temple-facade');
const templeBg = document.getElementById('temple-layer-bg');
const pillarLeft = document.getElementById('pillar-left-wrap');
const pillarRight = document.getElementById('pillar-right-wrap');
const templeUI = document.getElementById('temple-ui');

const sanctuaryStage = document.getElementById('invitation');
const sanctuaryGanesha = document.getElementById('sanctuary-ganesha');
const sanctuaryMandala = document.getElementById('sanctuary-mandala');
const sanctuaryCopy = document.getElementById('sanctuary-copy');

let desiredP = 0, actualP = 0, templeRaf = 0;

function renderTempleWalkthrough() {
  actualP += (desiredP - actualP) * 0.085;
  const p = Math.max(0, Math.min(1, actualP));

  // =========================================================================
  // STAGE 1: The two pillars pave the way (p = 0.00 -> 0.32)
  // Left and Right pillars slide outward off-screen, revealing the full temple
  // =========================================================================
  const walkP = Math.min(1, p / 0.30);

  // Left Pillar slides outward left & scales slightly past viewer
  if (pillarLeft) {
    const leftSlide = (-walkP * 125).toFixed(2);
    const leftScale = (1 + walkP * 0.35).toFixed(3);
    pillarLeft.style.transform = `translate3d(${leftSlide}%, 0, 0) scale(${leftScale})`;
    // Fades out cleanly as it exits the screen
    const leftAlpha = p >= 0.20 ? Math.max(0, 1 - (p - 0.20) / 0.10) : 1;
    pillarLeft.style.opacity = leftAlpha.toFixed(3);
  }

  // Right Pillar slides outward right & scales slightly past viewer
  if (pillarRight) {
    const rightSlide = (walkP * 125).toFixed(2);
    const rightScale = (1 + walkP * 0.35).toFixed(3);
    pillarRight.style.transform = `translate3d(${rightSlide}%, 0, 0) scale(${rightScale})`;
    // Fades out cleanly as it exits the screen
    const rightAlpha = p >= 0.20 ? Math.max(0, 1 - (p - 0.20) / 0.10) : 1;
    pillarRight.style.opacity = rightAlpha.toFixed(3);
  }

  // Central Gopuram steps forward smoothly while anchored to the floor
  if (templeBg) {
    const bgScale = (1 + walkP * 0.12).toFixed(3);
    templeBg.style.transform = `scale(${bgScale})`;
  }

  // Walkthrough hint & captions fade out early on scroll
  if (templeUI) {
    templeUI.style.opacity = Math.max(0, 1 - p * 7.0).toFixed(3);
    templeUI.style.transform = `translate3d(0, ${(-p * 60).toFixed(1)}px, 0)`;
  }

  // =========================================================================
  // STAGE 2 & 3: Full temple is there (p = 0.30 -> 0.55),
  // then upon scrolling, temple disappears (p = 0.55 -> 0.72)
  // =========================================================================
  if (templeFacade) {
    let facadeOpacity = 1;
    if (p > 0.55) {
      // Temple disappears smoothly between p = 0.55 and 0.72
      facadeOpacity = Math.max(0, 1 - (p - 0.55) / 0.17);
    }
    templeFacade.style.opacity = facadeOpacity.toFixed(3);
    templeFacade.style.visibility = facadeOpacity <= 0 ? 'hidden' : 'visible';
  }

  // =========================================================================
  // STAGE 4: Lord Vinayagar (Ganesha) appears from behind (p = 0.68 -> 0.92)
  // Only begins after the temple has started disappearing!
  // =========================================================================
  const sancP = Math.max(0, Math.min(1, (p - 0.68) / 0.24));

  if (sanctuaryStage) {
    sanctuaryStage.style.opacity = sancP.toFixed(3);
    sanctuaryStage.style.visibility = sancP <= 0 ? 'hidden' : 'visible';
    sanctuaryStage.style.pointerEvents = sancP >= 0.85 ? 'auto' : 'none';
  }

  // Lord Vinayagar rises into focus from the inner sanctum
  if (sanctuaryGanesha) {
    const ganeshaY = (35 * (1 - sancP)).toFixed(2);
    const ganeshaScale = (0.84 + sancP * 0.16).toFixed(3);
    sanctuaryGanesha.style.transform = `translate3d(0, ${ganeshaY}px, 0) scale(${ganeshaScale})`;
  }

  // Ornate Golden Mandala expands & gently rotates behind Lord Vinayagar
  if (sanctuaryMandala) {
    const mandalaScale = (0.75 + sancP * 0.25).toFixed(3);
    const mandalaRot = (sancP * 40).toFixed(1);
    sanctuaryMandala.style.transform = `translate(-50%, -50%) scale(${mandalaScale}) rotate(${mandalaRot}deg)`;
    sanctuaryMandala.style.opacity = (sancP * 0.95).toFixed(3);
  }

  // Sacred Invitation copy fades in gracefully as Vinayagar settles
  if (sanctuaryCopy) {
    const copyP = Math.max(0, Math.min(1, (sancP - 0.20) / 0.80));
    sanctuaryCopy.style.opacity = copyP.toFixed(3);
    sanctuaryCopy.style.transform = `translate3d(0, ${(20 * (1 - copyP)).toFixed(2)}px, 0)`;
  }

  if (Math.abs(desiredP - actualP) > 0.0008) {
    templeRaf = requestAnimationFrame(renderTempleWalkthrough);
  } else {
    templeRaf = 0;
  }
}

function updateTempleProgress() {
  if (reduced || !templeTrack) return;
  const rect = templeTrack.getBoundingClientRect();
  const scrollRange = Math.max(1, templeTrack.offsetHeight - window.innerHeight);
  desiredP = Math.min(1, Math.max(0, -rect.top / scrollRange));
  if (!templeRaf) templeRaf = requestAnimationFrame(renderTempleWalkthrough);
}

if (!reduced && templeTrack) {
  window.addEventListener('scroll', updateTempleProgress, { passive: true });
  window.addEventListener('resize', updateTempleProgress);
  updateTempleProgress();
}

// Smooth scroll to Vinayagar blessing when clicking "Invitation" in nav
document.querySelectorAll('a[href="#invitation"]').forEach(link => {
  link.addEventListener('click', e => {
    if (templeTrack) {
      e.preventDefault();
      const scrollRange = Math.max(1, templeTrack.offsetHeight - window.innerHeight);
      const targetTop = templeTrack.offsetTop + scrollRange * 0.85;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});

const target = new Date('2026-10-25T06:00:00+05:30').getTime();
function countdown() {
  let diff = Math.max(0, target - Date.now());
  const vals = [
    Math.floor(diff / 86400000),
    Math.floor(diff / 3600000) % 24,
    Math.floor(diff / 60000) % 60,
    Math.floor(diff / 1000) % 60
  ];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => {
    document.getElementById(id).textContent = String(vals[i]).padStart(2, '0');
  });
  if (Date.now() >= target) {
    document.getElementById('countdown-label').textContent = 'Celebrating our forever';
  }
}
countdown();
setInterval(countdown, 1000);

// Ensure page always starts at the beginning
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Background Audio: Vaa Kannamma (Violin Version) — Instant auto-play without touching
const bgAudio = document.getElementById('wedding-audio');
let wasPlayingBeforeVideo = false;

function playBgAudio() {
  if (!bgAudio) return;
  if (!bgAudio.paused && !bgAudio.muted) return;
  bgAudio.volume = 1.0;
  bgAudio.muted = false;
  const p = bgAudio.play();
  if (p !== undefined) {
    p.then(() => {
      cleanupGestureListeners();
    }).catch(() => {
      // Background unmuted blocked: start muted immediately, then unmute
      bgAudio.muted = true;
      bgAudio.play().then(() => {
        setTimeout(() => {
          bgAudio.muted = false;
        }, 100);
      }).catch(() => {});
    });
  }
}

// Immediate start without touching
playBgAudio();
[50, 150, 300, 600, 1000, 1500, 2000].forEach(t => setTimeout(playBgAudio, t));

const gestureEvents = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown', 'scroll'];

function onFirstGesture() {
  if (bgAudio) {
    bgAudio.muted = false;
  }
  playBgAudio();
  if (bgAudio && !bgAudio.paused && !bgAudio.muted) {
    cleanupGestureListeners();
  }
}

function cleanupGestureListeners() {
  gestureEvents.forEach(e => {
    window.removeEventListener(e, onFirstGesture, true);
    document.removeEventListener(e, onFirstGesture, true);
  });
}

gestureEvents.forEach(e => {
  window.addEventListener(e, onFirstGesture, { capture: true, passive: true });
  document.addEventListener(e, onFirstGesture, { capture: true, passive: true });
});

// Also try on lifecycle events
window.addEventListener('load', playBgAudio, { once: true });
window.addEventListener('pageshow', playBgAudio, { once: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    playBgAudio();
  }
});

// Loop forever
if (bgAudio) {
  bgAudio.addEventListener('ended', () => {
    bgAudio.currentTime = 0;
    playBgAudio();
  });
}

// "Back to the beginning" button — smooth scroll to top + resume audio
const backBtn = document.getElementById('back-to-beginning');
if (backBtn) {
  backBtn.addEventListener('click', e => {
    e.preventDefault();
    playBgAudio();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Dialogs & Lightbox
const reelDialog = document.getElementById('reel-dialog');
const photoDialog = document.getElementById('photo-dialog');
const reel = document.getElementById('full-reel');

function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

document.querySelectorAll('[data-watch]').forEach(b => b.addEventListener('click', () => {
  if (bgAudio && !bgAudio.paused) {
    wasPlayingBeforeVideo = true;
    bgAudio.pause();
  }
  openDialog(reelDialog);
  reel.play().catch(() => {});
}));

document.querySelectorAll('[data-photo]').forEach(b => b.addEventListener('click', () => {
  document.getElementById('lightbox-image').src = b.dataset.photo;
  document.getElementById('lightbox-image').alt = b.dataset.caption;
  document.getElementById('lightbox-caption').textContent = b.dataset.caption;
  openDialog(photoDialog);
}));

document.querySelectorAll('dialog').forEach(d => {
  d.querySelector('.close-dialog').addEventListener('click', () => d.close());
  d.addEventListener('click', e => {
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      d.close();
    }
  });
  d.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (d === reelDialog) {
      reel.pause();
      if (wasPlayingBeforeVideo) {
        playBgAudio();
        wasPlayingBeforeVideo = false;
      }
    }
  });
});

const address = 'Thuluva Vellalar Marriage Hall, Chitoor-Vellore Highway (SH-9), Suthanthira Ponvizha Nagar, Gandhi Nagar, Vellore, Tamil Nadu 632006';
document.getElementById('copy-address').addEventListener('click', async () => {
  const feedback = document.getElementById('copy-feedback');
  try {
    await navigator.clipboard.writeText(address);
    feedback.textContent = 'Address copied.';
  } catch {
    feedback.textContent = address;
  }
  setTimeout(() => feedback.textContent = '', 6000);
});
