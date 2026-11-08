/**
 * Progressive enhancement for the whole site. Every section works without JS;
 * this adds motion, interactivity and form handling.
 */

import { initMotion, lenis } from './motion';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ------------------------------------------------------------------ Header */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = header.classList.contains('menu-open') || !!$('.has-menu.is-open', header);
    if (!menuOpen) {
      if (y > 480 && y > lastY + 6) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 480) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  // Reveal the header whenever keyboard focus lands inside it
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}

/* ---------------------------------------------------------- Services menu */
function initDropdown() {
  $$('[data-menu]').forEach((item) => {
    const btn = $<HTMLButtonElement>('[data-menu-toggle]', item)!;
    let timer: number | undefined;
    let hoverOpenedAt = 0;
    const set = (open: boolean) => {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      // Hovering the chevron already opened the menu: a click right after shouldn't close it
      if (open && Date.now() - hoverOpenedAt < 800) return;
      set(!open);
    });

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    item.addEventListener('mouseenter', () => {
      if (!canHover.matches) return;
      clearTimeout(timer);
      if (!item.classList.contains('is-open')) hoverOpenedAt = Date.now();
      set(true);
    });
    item.addEventListener('mouseleave', () => {
      if (!canHover.matches) return;
      timer = window.setTimeout(() => set(false), 160);
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget as Node)) set(false);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        set(false);
        btn.focus();
      }
    });
    $$('a', $('[data-menu-panel]', item)!).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target as Node)) set(false);
    });
  });
}

/* ------------------------------------------------------------ Mobile nav */
function initMobileNav() {
  const header = $('[data-header]');
  const burger = $<HTMLButtonElement>('[data-burger]');
  const panel = $('[data-mobile-nav]');
  const label = $('[data-burger-label]');
  if (!header || !burger || !panel) return;

  const set = (open: boolean) => {
    burger.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    panel.hidden = !open;
    header.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) lenis?.stop();
    else lenis?.start();
    if (open) header.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
  $$('[data-mobile-link]', panel).forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      set(false);
      burger.focus();
    }
  });
  // Keep focus inside the open menu (header + panel)
  header.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || panel.hidden) return;
    const focusables = [burger, ...$$<HTMLElement>('a, button', panel)];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 1080px)').addEventListener('change', (m) => m.matches && set(false));
}

/* ---------------------------------------------------------- Scroll reveal */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    // Fire as soon as an element enters the view (just above the bottom edge), so content
    // peeking in at the fold never sits there invisible waiting for a scroll.
    { threshold: 0, rootMargin: '0px 0px -2% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/* --------------------------------------------------- Footer wordmark rise */
function initFooter() {
  const footer = $('[data-footer]');
  if (!footer) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    footer.classList.add('is-in');
    return;
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      footer.classList.add('is-in');
      io.disconnect();
    },
    { threshold: 0.35 },
  );
  io.observe($('.footer__giant', footer) || footer);
}

/* ------------------------------------------------------ Hero lens visual */
function initIntel() {
  const root = $('[data-intel]');
  if (!root) return;
  const tabs = $$<HTMLButtonElement>('[role="tab"]', root);
  const panels = $$('[data-panel]', root);
  let current = 0;
  let userTookOver = false;

  const select = (index: number, focus = false) => {
    current = index;
    const id = tabs[index].dataset.lens;
    tabs.forEach((t, i) => {
      const on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== id));
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      userTookOver = true;
      select(i);
    });
    tab.addEventListener('keydown', (e) => {
      const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        userTookOver = true;
        select((i + keys[e.key] + tabs.length) % tabs.length, true);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        userTookOver = true;
        select(e.key === 'Home' ? 0 : tabs.length - 1, true);
      }
    });
  });
  select(0);

  if (reduceMotion) return;
  // Gentle autoplay while visible and not being interacted with
  let inView = false;
  let paused = false;
  root.addEventListener('pointerenter', () => (paused = true));
  root.addEventListener('pointerleave', () => (paused = false));
  root.addEventListener('focusin', () => (paused = true));
  root.addEventListener('focusout', () => (paused = false));
  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.4 }).observe(root);
  window.setInterval(() => {
    if (userTookOver || paused || !inView || document.hidden) return;
    select((current + 1) % tabs.length);
  }, 5200);
}

/* ------------------------------------------------- Outcomes before/after */
function initOutcomes() {
  const root = $('[data-outcomes]');
  if (!root) return;
  const btns = $$<HTMLButtonElement>('[data-state-btn]', root);
  let touched = false;
  const set = (state: string) => {
    root.dataset.state = state;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stateBtn === state)));
  };
  btns.forEach((b) =>
    b.addEventListener('click', () => {
      touched = true;
      set(b.dataset.stateBtn!);
    }),
  );
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  // Start at "before" and play the transformation once when the cards come into view
  set('before');
  const cards = $('.outcomes__cards', root)!;
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      window.setTimeout(() => !touched && set('after'), 1400);
    },
    { threshold: 0.35 },
  );
  io.observe(cards);
}

/* --------------------------------------------------------- Process line */
function initProcess() {
  const list = $('[data-process]');
  if (!list) return;
  const steps = $$('[data-step]', list);
  let ticking = false;
  const update = () => {
    const r = list.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(r.height, vh * 0.45)));
    list.style.setProperty('--p', p.toFixed(3));
    let currentIdx = -1;
    steps.forEach((s, i) => {
      const active = p >= i / (steps.length - 1) - 0.04;
      s.classList.toggle('is-active', active);
      if (active) currentIdx = i;
    });
    steps.forEach((s, i) => s.classList.toggle('is-current', i === currentIdx));
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  update();
}

/* ------------------------------------------------------------ Enquiry form */
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function initForm() {
  const form = $<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;
  const card = form.parentElement!;
  const done = $('[data-done]', card)!;
  const status = $('[data-status]', form)!;
  const submit = $<HTMLButtonElement>('[data-submit]', form)!;
  const submitLabel = $('[data-submit-label]', form)!;
  const defaultLabel = submitLabel.textContent;
  const mode = form.dataset.mode;
  const endpoint = form.dataset.endpoint;
  const email = form.dataset.email!;
  const whatsapp = form.dataset.whatsapp!;
  const fields = {
    name: form.elements.namedItem('name') as HTMLInputElement,
    email: form.elements.namedItem('email') as HTMLInputElement,
    company: form.elements.namedItem('company') as HTMLInputElement,
    service: form.elements.namedItem('service') as HTMLSelectElement,
    message: form.elements.namedItem('message') as HTMLTextAreaElement,
  };
  const honeypot = form.elements.namedItem('_gotcha') as HTMLInputElement;
  const counter = $('[data-count]', form);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const validators: Partial<Record<keyof typeof fields, (v: string) => string>> = {
    name: (v) => (v.length < 2 ? 'Please enter your name.' : ''),
    email: (v) =>
      !v ? 'Please enter your email address.' : !EMAIL_RE.test(v) ? 'Please enter a valid email, like name@company.co.uk.' : '',
    service: (v) => (!v ? 'Please choose the area you need support with.' : ''),
    message: (v) =>
      v.length < 15 ? 'Please add a little more detail (at least 15 characters) so we can help.' : '',
  };
  const touched = new Set<string>();

  const showError = (key: keyof typeof fields, msg: string) => {
    const el = fields[key];
    const err = $(`#${el.id}-err`, form);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) {
      err.textContent = msg;
      err.hidden = !msg;
    }
  };
  const validate = (key: keyof typeof fields) => {
    const fn = validators[key];
    if (!fn) return true;
    const msg = fn(fields[key].value.trim());
    showError(key, msg);
    return !msg;
  };
  const validateAll = () => {
    const keys = Object.keys(validators) as (keyof typeof fields)[];
    const bad = keys.filter((k) => !validate(k));
    keys.forEach((k) => touched.add(k));
    if (bad.length) fields[bad[0]].focus();
    return bad.length === 0;
  };

  (Object.keys(validators) as (keyof typeof fields)[]).forEach((key) => {
    const el: Field = fields[key];
    el.addEventListener('blur', () => {
      if (el.value.trim()) touched.add(key);
      if (touched.has(key)) validate(key);
    });
    el.addEventListener(key === 'service' ? 'change' : 'input', () => {
      if (touched.has(key) || key === 'service') validate(key);
    });
  });
  fields.message.addEventListener('input', () => {
    if (counter) counter.textContent = String(fields.message.value.length);
  });

  const serviceLabel = () => fields.service.selectedOptions[0]?.textContent?.trim() || '';
  const composeText = () => {
    const company = fields.company.value.trim();
    const details = [
      `Name: ${fields.name.value.trim()}`,
      ...(company ? [`Company: ${company}`] : []),
      `Email: ${fields.email.value.trim()}`,
      `Area of support: ${serviceLabel()}`,
    ];
    return `${details.join('\n')}\n\n${fields.message.value.trim()}`;
  };
  const subject = () =>
    `Enquiry: ${serviceLabel()}${fields.company.value.trim() ? ` (${fields.company.value.trim()})` : ''}`;
  const mailtoHref = () =>
    `mailto:${email}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(composeText())}`;
  const whatsappHref = () =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello 247CREATIVEHUB,\n\n${composeText()}`)}`;

  const setStatus = (html: string, tone: 'error' | 'info' | '' = '') => {
    status.innerHTML = html;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  };
  const setLoading = (on: boolean) => {
    submit.disabled = on;
    submit.classList.toggle('is-loading', on);
    submitLabel.textContent = on ? 'Sending…' : defaultLabel;
  };

  const showDone = (title: string, text: string, actions: string) => {
    $('[data-done-title]', done)!.textContent = title;
    $('[data-done-text]', done)!.textContent = text;
    $('[data-done-actions]', done)!.innerHTML = actions;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    bindCopy();
  };
  const bindCopy = () => {
    const btn = $<HTMLButtonElement>('[data-copy]', done);
    btn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`${subject()}\n\n${composeText()}`);
        btn.textContent = 'Copied';
      } catch {
        btn.textContent = 'Copy failed: please select the text manually';
      }
    });
  };

  $('[data-reset]', done)?.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    setStatus('');
    fields.name.focus();
  });

  $('[data-whatsapp-send]', form)?.addEventListener('click', () => {
    setStatus('');
    if (!validateAll()) return;
    window.open(whatsappHref(), '_blank', 'noopener');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validateAll()) {
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }
    // Bots fill the hidden field; humans never see it
    if (honeypot.value) return;

    const first = fields.name.value.trim().split(/\s+/)[0];

    if (mode === 'endpoint' && endpoint) {
      setLoading(true);
      const ctrl = new AbortController();
      const timeout = window.setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            company: fields.company.value.trim(),
            service: serviceLabel(),
            message: fields.message.value.trim(),
            _subject: subject(),
          }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const replyTo = fields.email.value.trim();
        form.reset();
        if (counter) counter.textContent = '0';
        showDone(
          `Thank you, ${first}.`,
          `Your enquiry has been sent to 247CREATIVEHUB. We’ll reply to ${replyTo}.`,
          '',
        );
      } catch {
        setStatus(
          `Sorry, your enquiry couldn’t be sent just now. Please try again, or send it <a href="${mailtoHref()}">by email</a> or <a href="${whatsappHref()}" target="_blank" rel="noopener">via WhatsApp</a>. Your message has been kept.`,
          'error',
        );
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
      return;
    }

    // No endpoint configured: hand over to the visitor's email app, honestly.
    window.location.href = mailtoHref();
    showDone(
      `Nearly there, ${first}.`,
      'Your email app should now be open with your enquiry ready to go. Nothing has been sent yet: please press Send in your email app. If it didn’t open, use one of the options below.',
      `<a class="btn btn--navy" href="${mailtoHref()}">Open email again</a>
       <a class="btn btn--ghost" href="${whatsappHref()}" target="_blank" rel="noopener">Send via WhatsApp</a>
       <button type="button" class="btn btn--ghost" data-copy>Copy enquiry text</button>`,
    );
  });

  // "Discuss this service" buttons pre-select the matching option
  $$<HTMLAnchorElement>('[data-service-link]').forEach((a) =>
    a.addEventListener('click', () => {
      fields.service.value = a.dataset.serviceLink!;
      validate('service');
      const wrap = fields.service.closest('.select');
      wrap?.classList.remove('is-flash');
      void (wrap as HTMLElement | null)?.offsetWidth;
      wrap?.classList.add('is-flash');
    }),
  );
}

initMotion();
initHeader();
initDropdown();
initMobileNav();
initReveal();
initFooter();
initIntel();
initOutcomes();
initProcess();
initForm();
