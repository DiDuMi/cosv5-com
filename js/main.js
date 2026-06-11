/**
 * Main JS - Particle animation, data loading, card rendering
 */

/* ===== Particle Animation ===== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0, mouseY = 0;
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
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
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
      ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
      ctx.fill();
    }
  }

  const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      // mouse connection
      const dx = particles[i].x - mouseX;
      const dy = particles[i].y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(108, 92, 231, ${0.12 * (1 - dist / 200)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
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

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Expose cleanup
  window.__particlesCleanup = () => cancelAnimationFrame(animId);
})();

/* ===== Mobile Menu ===== */
(function() {
  const btn = document.getElementById('mobile-menu-btn');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }
})();

/* ===== Data Loading & Card Rendering ===== */
async function loadData(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}

function renderCard(item, isPremium = false) {
  const date = new Date(item.date).toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const title = currentLang === 'zh' ? item.title_cn : item.title_en;
  const desc = currentLang === 'zh' ? item.description_cn : item.description_en;
  const category = currentLang === 'zh' ? item.category_cn : item.category_en;

  return `
    <div class="card">
      <div class="card-body">
        <div class="card-category ${isPremium ? 'premium-category' : ''}">${category}</div>
        <h3 class="card-title">${title}</h3>
        <p class="card-desc">${desc}</p>
        <div class="card-footer">
          <span class="card-date">${date}</span>
          <a href="${item.link || '#'}" class="card-link" target="_blank" rel="noopener">${t('card.view')} →</a>
        </div>
      </div>
    </div>
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
      if (emptyState) emptyState.style.display = 'block';
      if (showMoreWrapper) showMoreWrapper.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Render all cards
    container.innerHTML = items.map(item => renderCard(item, isPremium)).join('');

    // Update count
    if (countEl) {
      countEl.textContent = t(currentLang === 'zh' ? 'section.releases.count' : 'section.releases.count',
        items.length > 0
          ? (isPremium
            ? t('section.premium.count', { count: items.length })
            : t('section.releases.count', { count: items.length }))
          : ''
      );
    }

    // Handle show more
    if (showMoreBtn && items.length > 10) {
      // Initially show only first 10
      const initialCount = 10;
      const hiddenCount = items.length - initialCount;
      container.classList.add('initial-only');

      showMoreWrapper.style.display = '';
      showMoreBtn.innerHTML = `${t('show_more')} <span class="count-badge">+${hiddenCount} ${t('show_more.count', { count: hiddenCount })}</span>`;

      let expanded = false;
      showMoreBtn.onclick = () => {
        expanded = !expanded;
        container.classList.toggle('initial-only', !expanded);
        showMoreBtn.textContent = expanded ? t('show_less') : `${t('show_more')} <span class="count-badge">+${hiddenCount} ${t('show_more.count', { count: hiddenCount })}</span>`;
        showMoreBtn.innerHTML = showMoreBtn.textContent;
      };
    } else if (showMoreWrapper) {
      showMoreWrapper.style.display = 'none';
    }
  } catch (err) {
    console.error('Failed to load section:', err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>${t('error.load')}</h3>
        <p><button class="btn btn-outline" onclick="location.reload()">${t('error.retry')}</button></p>
      </div>
    `;
  }
}
