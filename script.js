/* ═══════════════════════════════════════
   KCSE VAULT — MASTER SCRIPT
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── PRELOADER ── */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 1600);
    });
  }

  /* ── NAVBAR SCROLL ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── HAMBURGER MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL ANIMATIONS ── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('visible');
          observer.unobserve(el.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  }

  /* ── COUNTER ANIMATION ── */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const duration = 1800;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = target >= 1000
              ? Math.floor(current).toLocaleString() + '+'
              : Math.floor(current) + '+';
            if (current >= target) clearInterval(timer);
          }, 16);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ══════════════════════════════
     SHOP PAGE FUNCTIONALITY
  ══════════════════════════════ */

  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return; // Only run on shop page

  const cards = [...productsGrid.querySelectorAll('.product-card')];
  const filterPills = document.querySelectorAll('.pill[data-filter]');
  const sidebarSubjects = document.querySelectorAll('.sidebar-subject[data-filter]');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const productCount = document.getElementById('productCount');
  const gridViewBtn = document.getElementById('gridView');
  const listViewBtn = document.getElementById('listView');

  let activeFilter = 'all';
  let activeSearch = '';
  let activeSort = 'popular';

  /* ── Filter Cards ── */
  function filterAndSort() {
    let visible = cards.filter(card => {
      const subject = card.dataset.subject || '';
      const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const matchFilter = activeFilter === 'all' || subject === activeFilter;
      const matchSearch = !activeSearch || title.includes(activeSearch) || desc.includes(activeSearch);
      return matchFilter && matchSearch;
    });

    // Sort
    visible.sort((a, b) => {
      if (activeSort === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      if (activeSort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      if (activeSort === 'popular') return parseInt(b.dataset.downloads) - parseInt(a.dataset.downloads);
      if (activeSort === 'newest') return 0;
      return 0;
    });

    // Re-render
    cards.forEach(c => c.classList.add('hidden'));
    visible.forEach((c, i) => {
      c.classList.remove('hidden');
      productsGrid.appendChild(c);
      c.style.animationDelay = `${i * 0.05}s`;
    });

    if (productCount) productCount.textContent = visible.length;
  }

  /* ── Pill Filters ── */
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      sidebarSubjects.forEach(s => s.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      const matchSidebar = [...sidebarSubjects].find(s => s.dataset.filter === activeFilter);
      if (matchSidebar) matchSidebar.classList.add('active');
      filterAndSort();
    });
  });

  /* ── Sidebar Filters ── */
  sidebarSubjects.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      sidebarSubjects.forEach(s => s.classList.remove('active'));
      filterPills.forEach(p => p.classList.remove('active'));
      link.classList.add('active');
      activeFilter = link.dataset.filter;
      const matchPill = [...filterPills].find(p => p.dataset.filter === activeFilter);
      if (matchPill) matchPill.classList.add('active');
      filterAndSort();
    });
  });

  /* ── Search ── */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeSearch = searchInput.value.trim().toLowerCase();
      filterAndSort();
    });
  }

  /* ── Sort ── */
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      activeSort = sortSelect.value;
      filterAndSort();
    });
  }

  /* ── View Toggle ── */
  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      productsGrid.classList.remove('list-view');
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
    });
    listViewBtn.addEventListener('click', () => {
      productsGrid.classList.add('list-view');
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
    });
  }

});
