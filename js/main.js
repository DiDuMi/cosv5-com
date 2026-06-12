/**
 * Main JS - Particle animation, data loading, enhanced interactions
 */

/* ===== Particle Animation ===== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.05;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 58, 237, ${this.opacity})`;
      ctx.fill();
    }
  }

  const count = Math.min(60, Math.floor(canvas.width * canvas.height / 20000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animId = requestAnimationFrame(animate);
  }

  animate();
  window.__particlesCleanup = () => cancelAnimationFrame(animId);
})();

/* ===== Progress Bar ===== */
(function() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = `scaleX(${Math.min(progress, 1)})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ===== Scroll Reveal ===== */
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

/* ===== Back to Top ===== */
(function() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ===== Mobile Menu ===== */
(function() {
  const btn = document.getElementById('mobile-menu-btn');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }
})();

/* ===== Nav Hide on Scroll Down ===== */
(function() {
  const header = document.getElementById('header');
  if (!header) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 80) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScroll = current;
  }, { passive: true });
})();

/* ===== Data Loading & List Rendering ===== */
async function loadData(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

function renderItem(item, isPremium = false) {
  const date = formatDate(item.date);
  const title = currentLang === 'zh' ? item.title_cn : item.title_en;
  const displayText = item.author
    ? `${item.author} — ${title}`
    : title;
  const typeClass = isPremium ? 'premium' : 'releases';
  const typeLabel = isPremium ? 'VIP' : '流出';

  return `
    <li class="resource-item ${typeClass}">
      <span class="date-tag">${date}</span>
      <span class="item-type">${typeLabel}</span>
      <a href="${item.link || '#'}" class="item-link" target="_blank" rel="noopener">${displayText}</a>
      ${item.info ? `<span class="item-info">${item.info}</span>` : ''}
    </li>
  `;
}

async function loadSection(containerId, dataUrl, isPremium = false) {
  const container = document.getElementById(containerId);
  const wrapper = container?.closest('.section');
  if (!container) return;

  const countEl = wrapper?.querySelector('[data-i18n-dynamic]');
  const showMoreWrapper = wrapper?.querySelector('.show-more-wrapper');
  const showMoreBtn = showMoreWrapper?.querySelector('.btn-show-more');
  const emptyState = wrapper?.querySelector('.empty-state');

  try {
    const items = await loadData(dataUrl);

    if (!items || items.length === 0) {
      if (emptyState) emptyState.style.display = '';
      if (showMoreWrapper) showMoreWrapper.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Render all items
    container.innerHTML = items.map(item => renderItem(item, isPremium)).join('');

    // Update count
    if (countEl) {
      const key = isPremium ? 'section.premium.count' : 'section.releases.count';
      countEl.textContent = t(key, { count: items.length });
    }

    // Update stats
    const statId = isPremium ? 'stat-premium' : 'stat-releases';
    const statEl = document.getElementById(statId);
    if (statEl) statEl.textContent = items.length;

    // Handle show more
    if (showMoreBtn && items.length > 10) {
      const hiddenCount = items.length - 10;
      container.classList.add('initial-only');
      showMoreWrapper.style.display = '';

      let expanded = false;
      const updateBtn = () => {
        if (expanded) {
          showMoreBtn.textContent = t('show_less');
        } else {
          showMoreBtn.innerHTML = `${t('show_more')} <span class="count-badge">(+${hiddenCount})</span>`;
        }
      };
      updateBtn();

      showMoreBtn.onclick = () => {
        expanded = !expanded;
        container.classList.toggle('initial-only', !expanded);
        updateBtn();
      };
    } else if (showMoreWrapper) {
      showMoreWrapper.style.display = 'none';
    }
  } catch (err) {
    console.error('Failed to load section:', err);
    container.innerHTML = `
      <div class="empty-state">
        <p>${t('error.load')} <button class="btn btn-outline" onclick="location.reload()" style="padding:4px 12px;font-size:0.8rem;margin-left:8px">${t('error.retry')}</button></p>
      </div>
    `;
  }
}
