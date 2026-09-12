import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Easing presets
export const EASINGS = {
  smoothEntrance: 'power3.out',
  playfulPop: 'back.out(1.2)',
  settleGentle: 'back.out(1.05)',
  editorialReveal: 'power4.out',
  tactilePress: 'power2.out',
  bezier: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

/**
 * 1. Hero Entrance Sequence (Staggered on initial mount)
 */
export function initHeroEntrance(container: HTMLElement | null) {
  if (!container) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const tl = gsap.timeline({ defaults: { ease: EASINGS.smoothEntrance } });

  const mascot = container.querySelector('[data-anim="hero-mascot"]');
  const badge = container.querySelector('[data-anim="hero-badge"]');
  const title = container.querySelector('[data-anim="hero-title"]');
  const subtitle = container.querySelector('[data-anim="hero-subtitle"]');
  const actions = container.querySelector('[data-anim="hero-actions"]');

  if (mascot) {
    tl.fromTo(
      mascot,
      { opacity: 0, scale: 0.8, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: EASINGS.playfulPop }
    );
  }

  if (badge) {
    tl.fromTo(
      badge,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45 },
      '-=0.35'
    );
  }

  if (title) {
    tl.fromTo(
      title,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: EASINGS.editorialReveal },
      '-=0.3'
    );
  }

  if (subtitle) {
    tl.fromTo(
      subtitle,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.4'
    );
  }

  if (actions) {
    tl.fromTo(
      actions,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45 },
      '-=0.35'
    );
  }
}

/**
 * 2. Hero -> Phone Showcase Scroll Transition (Scrubbed with depth parallax)
 */
export function initPhoneScrollShowcase(section: HTMLElement | null) {
  if (!section) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const leftPhone = section.querySelector('[data-anim="phone-left"]');
  const centerPhone = section.querySelector('[data-anim="phone-center"]');
  const rightPhone = section.querySelector('[data-anim="phone-right"]');
  const backdrop = section.querySelector('[data-anim="phone-backdrop"]');

  if (centerPhone) {
    gsap.fromTo(
      centerPhone,
      { y: 160, scale: 0.93, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 35%',
          scrub: 1.1,
        },
      }
    );
  }

  if (leftPhone) {
    gsap.fromTo(
      leftPhone,
      { y: 210, rotation: 3, scale: 0.9, opacity: 0 },
      {
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1.3,
        },
      }
    );
  }

  if (rightPhone) {
    gsap.fromTo(
      rightPhone,
      { y: 190, rotation: -3, scale: 0.9, opacity: 0 },
      {
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 32%',
          scrub: 1.2,
        },
      }
    );
  }

  if (backdrop) {
    gsap.fromTo(
      backdrop,
      { scaleX: 0.88, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 1,
        },
      }
    );
  }
}

/**
 * 3. Layer Stack Separation Animation
 */
export function initLayerStackSeparation(container: HTMLElement | null) {
  if (!container) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const cards = container.querySelectorAll('[data-anim="layer-card"]');
  if (cards.length === 0) return;

  gsap.fromTo(
    cards,
    { y: (i) => 30 + i * 15, scale: 0.96, opacity: 0.6 },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      stagger: 0.1,
      ease: EASINGS.settleGentle,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'top 30%',
        scrub: 1.2,
      },
    }
  );
}

/**
 * 4. Large Red CTA Phone Rise
 */
export function initCTAPhoneRise(section: HTMLElement | null) {
  if (!section) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const phoneGroup = section.querySelector('[data-anim="cta-phones"]');
  if (phoneGroup) {
    gsap.fromTo(
      phoneGroup,
      { y: 220, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'bottom 85%',
          scrub: 1.2,
        },
      }
    );
  }
}

/**
 * 5. General Editorial Reveal Trigger for Headings and Content
 */
export function initEditorialReveals(scope: HTMLElement | null = document.body) {
  if (!scope) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const sections = scope.querySelectorAll('[data-anim-section]');
  sections.forEach((sec) => {
    const badge = sec.querySelector('[data-anim-badge]');
    const heading = sec.querySelector('[data-anim-heading]');
    const paragraph = sec.querySelector('[data-anim-paragraph]');
    const cards = sec.querySelectorAll('[data-anim-card]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    if (badge) tl.fromTo(badge, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: EASINGS.smoothEntrance });
    if (heading) tl.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: EASINGS.editorialReveal }, '-=0.25');
    if (paragraph) tl.fromTo(paragraph, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: EASINGS.smoothEntrance }, '-=0.3');
    if (cards.length > 0) {
      tl.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.09, ease: EASINGS.settleGentle },
        '-=0.2'
      );
    }
  });
}
