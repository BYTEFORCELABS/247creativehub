/**
 * Motion layer: smooth scroll (Lenis), split-text headings, magnetic buttons,
 * cursor spotlights and a velocity-reactive marquee. Uses the browser's
 * native Web Animations API; the hero parallax is a CSS scroll-driven animation.
 * Everything is skipped when the visitor prefers reduced motion.
 */
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export let lenis: Lenis | null = null;

/* ---------------------------------------------------------- Smooth scroll */
function initLenis() {
  if (reduce) return;
  // On the home page, "/#section" links are in-page anchors: let Lenis animate them
  if (location.pathname === '/') {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="/#"]').forEach((a) => {
      a.setAttribute('href', a.getAttribute('href')!.slice(1));
    });
  }
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    anchors: { offset: -(headerH + 12) },
  });
}

/* --------------------------------------------------- Split-text headings */
function splitWords(el: HTMLElement) {
  const wrap = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent || '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'w';
          const inner = document.createElement('span');
          inner.className = 'w-i';
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrap(child);
      }
    });
  };
  wrap(el);
  return Array.from(el.querySelectorAll<HTMLElement>('.w-i'));
}

function initSplitHeadings() {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('main h2[data-reveal]').forEach((h) => {
    h.removeAttribute('data-reveal'); // this heading animates per word instead
    h.classList.add('is-split');
    const words = splitWords(h);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        words.forEach((w, i) =>
          w.animate(
            [
              { transform: 'translateY(110%) rotate(3deg)' },
              { transform: 'translateY(0) rotate(0deg)' },
            ],
            { duration: 1000, delay: i * 50, easing: EASE, fill: 'both' },
          ),
        );
      },
      { threshold: 0.4 },
    );
    io.observe(h);
  });
}

/* -------------------------------------------------------- Magnetic buttons */
function initMagnetic() {
  if (reduce || !finePointer) return;
  // Buttons drift towards the cursor; the springy return is a CSS transition on `translate`
  document.querySelectorAll<HTMLElement>('.btn--primary, .btn--navy').forEach((btn) => {
    btn.classList.add('is-magnetic');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      btn.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    btn.addEventListener('pointerleave', () => (btn.style.translate = ''));
  });
}

/* --------------------------------------------------------- Card spotlight */
function initSpotlight() {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>('.svc, .challenge, .oc, .step__card, .ph-card').forEach((card) => {
    card.classList.add('spot');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* ------------------------------------------------ Velocity-reactive marquee */
function initMarquee() {
  const track = document.querySelector<HTMLElement>('[data-marquee] .marquee__track');
  if (!track || reduce) return;
  const anim = track.getAnimations()[0];
  if (!anim) return;
  let rate = 1;
  let target = 1;
  let base = 1; // cruising speed; slower while hovered
  const tick = () => {
    rate += (target - rate) * 0.08;
    anim.playbackRate = rate;
    target += (base - target) * 0.05; // ease back towards cruising speed
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (lenis) {
    lenis.on('scroll', ({ velocity }: { velocity: number }) => {
      target = base + Math.min(Math.abs(velocity) * 0.35, 6);
    });
  }
  const marquee = track.parentElement!;
  marquee.addEventListener('pointerenter', () => (base = 0.2));
  marquee.addEventListener('pointerleave', () => (base = 1));
}

export function initMotion() {
  initLenis();
  initSplitHeadings();
  initMagnetic();
  initSpotlight();
  initMarquee();
}
