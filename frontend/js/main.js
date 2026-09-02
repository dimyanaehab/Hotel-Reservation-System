/* ================================================================
   LuxeStay Hotel & Resort — Main JavaScript
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------------
     1. NAVBAR — scroll behaviour
     ---------------------------------------------------------------- */
  const navbar = document.getElementById('mainNavbar');
  const handleNavbarScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ----------------------------------------------------------------
     2. HERO SLIDER
     ---------------------------------------------------------------- */
  const slides    = document.querySelectorAll('.hero-slide');
  const dotsWrap  = document.getElementById('slideDots');
  let currentSlide = 0;
  let sliderTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  const dots = () => dotsWrap.querySelectorAll('.slide-dot');

  function goToSlide(idx) {
    slides[currentSlide].classList.remove('active');
    dots()[currentSlide].classList.remove('active');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots()[currentSlide].classList.add('active');
    resetTimer();
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function resetTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(nextSlide, 6000);
  }

  document.getElementById('nextSlide').addEventListener('click', nextSlide);
  document.getElementById('prevSlide').addEventListener('click', prevSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft')  prevSlide();
  });

  // Touch / swipe support
  let touchStartX = 0;
  const heroSection = document.querySelector('.hero-section');
  heroSection.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  heroSection.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  }, { passive: true });

  resetTimer();

  /* ----------------------------------------------------------------
     3. BOOKING FORM — date validation & submission
     ---------------------------------------------------------------- */
  const checkIn  = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut');
  const today    = new Date().toISOString().split('T')[0];

  checkIn.min  = today;
  checkOut.min = today;

  checkIn.addEventListener('change', () => {
    checkOut.min = checkIn.value;
    if (checkOut.value && checkOut.value <= checkIn.value) {
      // Auto-advance checkout to next day
      const next = new Date(checkIn.value);
      next.setDate(next.getDate() + 1);
      checkOut.value = next.toISOString().split('T')[0];
    }
  });

  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nights = calcNights(checkIn.value, checkOut.value);
    const msg = nights > 0
      ? `Searching availability for ${nights} night${nights > 1 ? 's' : ''}… Redirecting to booking.`
      : 'Please select valid check-in and check-out dates.';
    showToast(msg);
  });

  function calcNights(inDate, outDate) {
    if (!inDate || !outDate) return 0;
    return Math.round((new Date(outDate) - new Date(inDate)) / 86400000);
  }

  /* ----------------------------------------------------------------
     4. ROOM FILTER
     ---------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const roomItems  = document.querySelectorAll('.room-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      roomItems.forEach((item, i) => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
          item.style.animationDelay = `${i * 0.06}s`;
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ----------------------------------------------------------------
     5. GALLERY LIGHTBOX
     ---------------------------------------------------------------- */
  const lightbox     = document.getElementById('lightboxModal');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  /* ----------------------------------------------------------------
     6. SCROLL REVEAL
     ---------------------------------------------------------------- */
  const revealElements = document.querySelectorAll(
    '.room-card, .amenity-card, .testimonial-card, .about-feature, ' +
    '.gallery-item, .offer-card, .contact-info-item, .stat-item'
  );

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  });

  // Also add directional reveals for bigger layout blocks
  document.querySelectorAll('.about-images').forEach(el => el.classList.add('reveal-left'));
  document.querySelectorAll('.contact-form').forEach(el => el.classList.add('reveal-right'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------------
     7. COUNTER ANIMATION (Stats)
     ---------------------------------------------------------------- */
  const counters = document.querySelectorAll('.stat-number');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        counters.forEach(counter => animateCounter(counter));
        countObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) countObserver.observe(statsSection);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = target / (duration / 16);
    let current    = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------------
     8. ACTIVE NAV LINK on scroll (section spy)
     ---------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');
  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ----------------------------------------------------------------
     9. BACK TO TOP
     ---------------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------------
     10. CONTACT FORM submission
     ---------------------------------------------------------------- */
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Message Sent!';
      showToast('Your message has been sent. We\'ll be in touch shortly!');
      e.target.reset();
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3000);
    }, 1600);
  });

  /* ----------------------------------------------------------------
     11. NEWSLETTER FORM
     ---------------------------------------------------------------- */
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('You\'re subscribed! Exclusive offers are on their way.');
    e.target.reset();
  });

  /* ----------------------------------------------------------------
     12. SMOOTH SCROLL for anchor links
     ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile nav if open
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse.classList.contains('show')) {
        navCollapse.classList.remove('show');
      }
    });
  });

  /* ----------------------------------------------------------------
     13. TOAST HELPER
     ---------------------------------------------------------------- */
  function showToast(message, duration = 3800) {
    const toast = document.getElementById('toastNotif');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

});