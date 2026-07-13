/**
 * lbhongdafood.com - Animations JavaScript
 * Advanced visual effects, parallax, canvas, and rich interactions
 */

(function() {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============== PARALLAX SCROLL ==============
  const initParallax = () => {
    if (prefersReducedMotion) return;

    const elements = $$('[data-parallax]');
    if (!elements.length) return;

    const update = () => {
      const scrollY = window.scrollY;
      elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY - window.innerHeight) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    update();
  };

  // ============== CURSOR GLOW ==============
  const initCursorGlow = () => {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return; // desktop only

    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.style.cssText = `
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      will-change: transform;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animate = () => {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      cursor.style.left = glowX + 'px';
      cursor.style.top = glowY + 'px';
      requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
  };

  // ============== CANVAS NETWORK BACKGROUND ==============
  const initNetworkCanvas = () => {
    if (prefersReducedMotion) return;

    const canvas = $('[data-network-canvas]');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60;
    const maxDistance = 150;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticle = () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.5
    });

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, createParticle);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / maxDistance) * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);
  };

  // ============== MAGNETIC BUTTONS ==============
  const initMagneticButtons = () => {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return;

    $$('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  };

  // ============== TEXT SCRAMBLE ==============
  const initTextScramble = () => {
    const chars = '!<>-_\/[]{}—=+*^?#________';
    $$('[data-scramble]').forEach(el => {
      const text = el.dataset.scramble || el.textContent;
      let frame = 0;
      const totalFrames = 12;
      const queue = [];
      for (let i = 0; i < text.length; i++) {
        queue.push({ from: '', to: text[i], start: Math.floor(Math.random() * 6), end: totalFrames - 1 });
      }

      el.textContent = '';

      const update = () => {
        let output = '';
        let complete = 0;
        queue.forEach((item, i) => {
          if (frame >= item.end) {
            complete++;
            output += item.to;
          } else if (frame >= item.start) {
            output += chars[Math.floor(Math.random() * chars.length)];
          } else {
            output += '';
          }
        });
        el.textContent = output;
        if (complete < queue.length) {
          frame++;
          setTimeout(update, 30);
        }
      };
      update();
    });
  };

  // ============== STICKY SCROLL ELEMENTS ==============
  const initSticky = () => {
    $$('[data-sticky]').forEach(el => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          el.classList.toggle('is-sticky', entry.intersectionRatio < 1);
        },
        { threshold: [1] }
      );
      observer.observe(el);
    });
  };

  // ============== SECTION DIVIDER ==============
  const initSectionDividers = () => {
    $$('.section').forEach((section, i) => {
      if (i === 0) return;
      const divider = document.createElement('div');
      divider.className = 'section-divider';
      divider.innerHTML = `
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:60px;display:block;">
          <path d="M0,30 Q300,0 600,30 T1200,30" stroke="rgba(0,212,255,0.1)" stroke-width="1" fill="none"/>
        </svg>
      `;
      section.insertBefore(divider, section.firstChild);
    });
  };

  // ============== GLITCH ON HOVER ==============
  const initGlitchHover = () => {
    $$('[data-glitch-hover]').forEach(el => {
      el.setAttribute('data-text', el.textContent);
      el.classList.add('glitch');
    });
  };

  // ============== SCROLL PROGRESS BAR ==============
  const initScrollProgress = () => {
    const bar = $('[data-scroll-progress]');
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      bar.style.width = progress + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  // ============== RIPPLE EFFECT ==============
  const initRipple = () => {
    $$('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          width: ${size}px;
          height: ${size}px;
          left: ${e.clientX - rect.left - size / 2}px;
          top: ${e.clientY - rect.top - size / 2}px;
          pointer-events: none;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple keyframe if not exists
    if (!$('#ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple {
          to { transform: scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ============== EYES FOLLOW CURSOR ==============
  const initEyesFollow = () => {
    $$('[data-eyes]').forEach(el => {
      const pupils = $$('.pupil', el);
      if (!pupils.length) return;
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dist = 6;
        pupils.forEach(p => {
          p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
        });
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', () => {
        pupils.forEach(p => p.style.transform = '');
      });
    });
  };

  // ============== CARD SPOTLIGHT ==============
  const initCardSpotlight = () => {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return;

    $$('.card-spotlight').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--spotlight-x', x + '%');
        card.style.setProperty('--spotlight-y', y + '%');
      });
    });
  };

  // ============== PAGE TRANSITION ==============
  const initPageTransition = () => {
    if (prefersReducedMotion) return;

    $$('a[href$=".html"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

        e.preventDefault();
        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  };

  // ============== INFINITE SCROLL MARQUEE ==============
  const initInfiniteMarquee = () => {
    $$('[data-marquee]').forEach(marquee => {
      const track = $('.marquee-track', marquee);
      if (!track) return;
      const items = Array.from(track.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });
  };

  // ============== INIT ==============
  onReady(() => {
    initParallax();
    initCursorGlow();
    initNetworkCanvas();
    initMagneticButtons();
    initTextScramble();
    initSticky();
    initSectionDividers();
    initGlitchHover();
    initScrollProgress();
    initRipple();
    initEyesFollow();
    initCardSpotlight();
    initPageTransition();
    initInfiniteMarquee();
  });
})();
