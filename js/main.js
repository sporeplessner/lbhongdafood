/**
 * lbhongdafood.com - Main JavaScript
 * Core interactions, navigation, forms, and rich UI behaviors
 */

(function() {
  'use strict';

  // ============== UTILITIES ==============
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  const debounce = (fn, wait = 100) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, limit = 100) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ============== HEADER ==============
  const initHeader = () => {
    const header = $('.site-header');
    if (!header) return;

    const onScroll = throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  // ============== MOBILE NAVIGATION ==============
  const initMobileNav = () => {
    const toggle = $('.menu-toggle');
    const nav = $('.mobile-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('active');
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = isActive ? '' : 'hidden';
    });

    // Close nav when clicking a link
    $$('a', nav).forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('active')) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  };

  // ============== SMOOTH SCROLL ==============
  const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        const target = $(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = $('.site-header')?.offsetHeight || 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  };

  // ============== SCROLL REVEAL ==============
  const initRevealOnScroll = () => {
    const elements = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
    if (!elements.length) return;

    // IMMEDIATE: Mark elements that are already in (or above) the viewport as visible.
    // This handles the case where the page loads with content already in view.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );

    elements.forEach(el => {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });

    // FALLBACK: after 800ms, force all reveal elements visible.
    // Guarantees content is reachable even if observer misses or page is short.
    setTimeout(() => {
      elements.forEach(el => el.classList.add('is-visible'));
    }, 800);
  };

  // ============== TILT EFFECT ==============
  const initTilt = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  // ============== ACCORDION ==============
  const initAccordion = () => {
    $$('.accordion-item').forEach(item => {
      const header = $('.accordion-header', item);
      if (!header) return;
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all others in the same accordion
        const parent = item.parentElement;
        if (parent) {
          $$('.accordion-item', parent).forEach(other => {
            if (other !== item) other.classList.remove('active');
          });
        }
        item.classList.toggle('active', !isActive);
      });
    });
  };

  // ============== TABS ==============
  const initTabs = () => {
    $$('.tabs').forEach(tabs => {
      const nav = $('.tabs-nav', tabs);
      const panels = $$('.tabs-panel', tabs);
      const buttons = $$('button', nav);

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          buttons.forEach(b => b.classList.toggle('active', b === btn));
          panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === target));
        });
      });
    });
  };

  // ============== MODAL ==============
  const initModals = () => {
    $$('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modalOpen;
        const modal = $(`#${modalId}`);
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    $$('[data-modal-close]').forEach(closer => {
      closer.addEventListener('click', () => {
        const modal = closer.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
    });
  };

  // ============== FORM HANDLING ==============
  const initForms = () => {
    $$('form[data-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const submitBtn = $('button[type="submit"]', form);
        const originalText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        // Simulate sending
        setTimeout(() => {
          showToast(form.dataset.successMessage || 'Message sent successfully!', 'success');
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }, 1200);
      });
    });
  };

  // ============== TOAST ==============
  const showToast = (message, type = 'info', duration = 4000) => {
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;font-size:1.25rem;line-height:1;opacity:0.6;padding:0;width:24px;height:24px;">&times;</button>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.4s ease-out forwards';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };

  // ============== COUNTER ANIMATION ==============
  const initCounters = () => {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count || '0');
      const duration = 2000;
      const start = performance.now();
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        let display;
        if (target % 1 === 0) {
          display = Math.floor(value).toLocaleString();
        } else {
          display = value.toFixed(1);
        }
        el.textContent = prefix + display + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target.toLocaleString() + suffix;
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      $$('[data-count]').forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    $$('[data-count]').forEach(el => observer.observe(el));
  };

  // ============== HEADER PARTICLES ==============
  const initHeroParticles = () => {
    const container = $('.hero-particles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 15 : 30;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 3 + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      container.appendChild(particle);
    }
  };

  // ============== TYPING EFFECT ==============
  const initTypewriter = () => {
    $$('[data-typewriter]').forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.display = 'inline-block';
      let i = 0;
      const speed = parseInt(el.dataset.typewriterSpeed || '50');
      const cursor = document.createElement('span');
      cursor.className = 'cursor-blink';
      el.appendChild(cursor);

      const type = () => {
        if (i < text.length) {
          el.insertBefore(document.createTextNode(text[i]), cursor);
          i++;
          setTimeout(type, speed);
        }
      };
      type();
    });
  };

  // ============== MARQUEE ==============
  const initMarquee = () => {
    $$('.marquee-track').forEach(track => {
      // Duplicate content for seamless loop
      const items = Array.from(track.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });
  };

  // ============== ACTIVE NAV LINK ==============
  const initActiveNav = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $$('.main-nav a, .mobile-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  };

  // ============== YEAR ==============
  const initYear = () => {
    $$('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  };

  // ============== KEYBOARD NAV ==============
  const initKeyboardNav = () => {
    document.addEventListener('keydown', (e) => {
      // Press '/' to focus search (if exists)
      if (e.key === '/' && !$('input:focus, textarea:focus')) {
        e.preventDefault();
        const search = $('input[type="search"]');
        if (search) search.focus();
      }
    });
  };

  // ============== LAZY IMAGES ==============
  const initLazyImages = () => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '100px' }
    );

    $$('img[data-src]').forEach(img => observer.observe(img));
  };

  // ============== INIT ==============
  onReady(() => {
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initRevealOnScroll();
    initTilt();
    initAccordion();
    initTabs();
    initModals();
    initForms();
    initCounters();
    initHeroParticles();
    initTypewriter();
    initMarquee();
    initActiveNav();
    initYear();
    initKeyboardNav();
    initLazyImages();
  });

  // Expose showToast globally
  window.showToast = showToast;
})();
