/**
 * i18n - Chinese/English Internationalization
 */
const I18N = {
  zh: {
    /* Nav */
    'nav.home': '首页',
    'nav.releases': '近期流出',
    'nav.premium': '高级精选',
    'nav.about': '关于',
    'lang.switch': 'English',

    /* Hero */
    'hero.title': 'COSV5 社群资源站',
    'hero.subtitle': '汇聚精选资源，社群成员专属。每周更新最新流出与高级精选内容。',
    'hero.cta.releases': '浏览近期流出',
    'hero.cta.premium': '查看高级精选',

    /* Releases Section */
    'section.releases.title': '近期流出',
    'section.releases.new': '更新',
    'section.releases.desc': '社群成员分享的最新资源流出，持续更新中。',
    'section.releases.view_all': '查看全部流出',
    'section.releases.empty': '暂无近期流出内容',
    'section.releases.count': '共 {count} 条',

    /* Premium Section */
    'section.premium.title': '高级精选',
    'section.premium.new': 'VIP',
    'section.premium.desc': '高级会员专享的精选资源，品质保证。',
    'section.premium.view_all': '查看全部精选',
    'section.premium.empty': '暂无高级精选内容',
    'section.premium.count': '共 {count} 条',

    /* Card */
    'card.view': '查看详情',
    'card.more_info': '更多信息',

    /* Show More */
    'show_more': '显示更多历史内容',
    'show_less': '收起',
    'show_more.count': '+{count}',

    /* Page */
    'page.releases.title': '近期流出 — COSV5 社群资源站',
    'page.releases.heading': '近期流出资源',
    'page.premium.title': '高级精选 — COSV5 社群资源站',
    'page.premium.heading': '高级精选资源',
    'page.about.title': '关于 — COSV5 社群资源站',
    'page.about.heading': '关于 COSV5',
    'page.about.content': 'COSV5 是专注于高品质资源分享的社群，汇聚全球精选内容。我们持续为社群成员提供最新的流出资源和高级精选内容。',

    /* Footer */
    'footer.text': '© 2026 COSV5. 本站内容仅供社群内部参考。',
    'footer.powered': 'Powered by COSV5 Community',

    /* Errors */
    'error.load': '加载失败，请稍后重试',
    'error.retry': '重试',
  },

  en: {
    /* Nav */
    'nav.home': 'Home',
    'nav.releases': 'Releases',
    'nav.premium': 'Premium',
    'nav.about': 'About',
    'lang.switch': '中文',

    /* Hero */
    'hero.title': 'COSV5 Community Hub',
    'hero.subtitle': 'Curated premium resources for community members. Weekly updates on latest releases and exclusive content.',
    'hero.cta.releases': 'Browse Releases',
    'hero.cta.premium': 'View Premium',

    /* Releases Section */
    'section.releases.title': 'Recent Releases',
    'section.releases.new': 'New',
    'section.releases.desc': 'Latest resource releases shared by community members, updated regularly.',
    'section.releases.view_all': 'View All Releases',
    'section.releases.empty': 'No recent releases available',
    'section.releases.count': '{count} items',

    /* Premium Section */
    'section.premium.title': 'Premium Selection',
    'section.premium.new': 'VIP',
    'section.premium.desc': 'Exclusive premium resources for VIP members, quality guaranteed.',
    'section.premium.view_all': 'View All Premium',
    'section.premium.empty': 'No premium content available',
    'section.premium.count': '{count} items',

    /* Card */
    'card.view': 'View Details',
    'card.more_info': 'More Info',

    /* Show More */
    'show_more': 'Show More History',
    'show_less': 'Collapse',
    'show_more.count': '+{count}',

    /* Page */
    'page.releases.title': 'Releases — COSV5 Community Hub',
    'page.releases.heading': 'Recent Releases',
    'page.premium.title': 'Premium — COSV5 Community Hub',
    'page.premium.heading': 'Premium Resources',
    'page.about.title': 'About — COSV5 Community Hub',
    'page.about.heading': 'About COSV5',
    'page.about.content': 'COSV5 is a community dedicated to high-quality resource sharing, bringing curated global content. We continuously provide the latest releases and premium content for our members.',

    /* Footer */
    'footer.text': '© 2026 COSV5. Content for community reference only.',
    'footer.powered': 'Powered by COSV5 Community',

    /* Errors */
    'error.load': 'Failed to load. Please try again later.',
    'error.retry': 'Retry',
  }
};

let currentLang = 'zh';

function getLang() {
  // Check URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get('lang') === 'en') return 'en';
  // Check localStorage
  const stored = localStorage.getItem('cosv5-lang');
  if (stored === 'en' || stored === 'zh') return stored;
  // Check browser
  if (navigator.language && navigator.language.startsWith('en')) return 'en';
  return 'zh';
}

function t(key, ...args) {
  const lang = currentLang;
  let text = I18N[lang]?.[key] || I18N.zh[key] || key;
  if (args.length) {
    text = text.replace(/\{(\w+)\}/g, (match, name) => args[0][name] ?? match);
  }
  return text;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('cosv5-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'META') {
      el.setAttribute('content', text);
    } else {
      el.textContent = text;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  // Update lang toggle button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = t('lang.switch');

  // Update page title
  const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
  if (titleKey) document.title = t(titleKey);

  // Update URL param
  const url = new URL(window.location);
  if (lang === 'en') url.searchParams.set('lang', 'en');
  else url.searchParams.delete('lang');
  window.history.replaceState({}, '', url);
}

function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  currentLang = getLang();
  setLang(currentLang);
});
