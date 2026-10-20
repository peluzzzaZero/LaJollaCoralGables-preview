(function () {
  'use strict';
  const placeId = 'ChIJWbeTzJu32YgRbGDUdwzI0W0';
  const copy = {
    en: { loading: 'Loading guest reviews…', empty: 'Read guest experiences on Google Maps.', unavailable: 'Reviews are unavailable here at the moment. You can read them on Google Maps.', selected: 'Selected five-star reviews, in Google Maps relevance order.', source: 'View original review' },
    es: { loading: 'Cargando reseñas…', empty: 'Lea las experiencias de nuestros invitados en Google Maps.', unavailable: 'Las reseñas no están disponibles aquí en este momento. Puede leerlas en Google Maps.', selected: 'Selección de reseñas de cinco estrellas, en el orden de relevancia de Google Maps.', source: 'Ver reseña original' }
  };
  const language = () => document.documentElement.lang === 'es' ? 'es' : 'en';
  const messages = () => copy[language()];
  function safeURL(value, image, provider) {
    try {
      const url = new URL(value);
      const host = url.hostname;
      const allowed = provider || (image ? host.endsWith('.googleusercontent.com') : ['www.google.com', 'google.com', 'maps.google.com'].includes(host));
      return url.protocol === 'https:' && !url.username && !url.password && allowed ? url.href : null;
    } catch (_) { return null; }
  }
  function link(text, href) {
    const node = document.createElement('a');
    node.textContent = text; node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer';
    return node;
  }
  let library;
  function loadPlaces(key) {
    if (!library) library = new Promise((resolve, reject) => {
      if (window.google?.maps?.importLibrary) { resolve(); return; }
      const script = document.createElement('script');
      const timeout = setTimeout(() => { script.remove(); reject(new Error('Maps unavailable')); }, 12000);
      window.__lajollaMapsReady = function () { clearTimeout(timeout); resolve(); };
      script.onerror = function () { clearTimeout(timeout); reject(new Error('Maps unavailable')); };
      const url = new URL('https://maps.googleapis.com/maps/api/js');
      for (const [name, value] of Object.entries({ key, loading: 'async', callback: '__lajollaMapsReady', libraries: 'places', v: 'quarterly', language: language(), region: 'US' })) url.searchParams.set(name, value);
      script.src = url.href; script.async = true; document.head.append(script);
    }).then(() => window.google.maps.importLibrary('places'));
    return library;
  }
  // The planner several reviews name belongs to the previous team (owner, 20 October 2026); those reviews are not shown.
  const formerTeam = /\bra[uú]l\b/i;
  function renderReviews(container, place) {
    container.replaceChildren();
    const reviews = (place.reviews || []).filter(review => review.rating === 5 &&
      (review.originalText || review.text)?.trim() && review.authorAttribution?.displayName &&
      !formerTeam.test(`${review.originalText || ''} ${review.text || ''}`) &&
      safeURL(review.googleMapsURI) && safeURL(review.authorAttribution.uri) &&
      review.publishTime instanceof Date && !Number.isNaN(review.publishTime.getTime()));
    if (!reviews.length) return false;
    const attribution = document.createElement('p');
    attribution.className = 'GMP-attribution'; attribution.textContent = 'Google Maps'; attribution.setAttribute('translate', 'no');
    container.append(attribution);
    const notice = document.createElement('p'); notice.className = 'reviews-selection'; notice.textContent = messages().selected; container.append(notice);
    for (const review of reviews) {
      const card = document.createElement('article'); card.className = 'guest-review';
      const author = document.createElement('div'); author.className = 'review-author';
      const photo = safeURL(review.authorAttribution.photoURI, true);
      if (photo) { const image = document.createElement('img'); image.src = photo; image.alt = ''; image.width = 36; image.height = 36; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer'; author.append(image); }
      author.append(link(review.authorAttribution.displayName, safeURL(review.authorAttribution.uri)));
      const date = document.createElement('time'); date.dateTime = review.publishTime.toISOString(); date.textContent = new Intl.DateTimeFormat(language(), { dateStyle: 'medium' }).format(review.publishTime);
      const rating = document.createElement('span'); rating.className = 'review-rating'; rating.textContent = '5 / 5';
      const stars = document.createElement('span'); stars.className = 'review-stars'; stars.setAttribute('aria-hidden', 'true'); stars.textContent = '★★★★★'; rating.prepend(stars);
      const quote = document.createElement('blockquote'); quote.textContent = review.originalText || review.text; quote.lang = review.originalTextLanguageCode || review.textLanguageCode || 'en';
      card.append(author, date, rating, quote, link(messages().source, safeURL(review.googleMapsURI))); container.append(card);
    }
    for (const provider of place.attributions || []) {
      const href = safeURL(provider.providerURI, false, true);
      const credit = document.createElement('p'); credit.className = 'review-provider';
      if (href) credit.append(link(provider.provider || 'Google Maps', href));
      else credit.textContent = provider.provider || 'Google Maps';
      container.append(credit);
    }
    return true;
  }
  // The map is visible from the start; only its labels follow the page language.
  function syncMap() {
    document.querySelectorAll('[data-location-map] iframe').forEach(function (frame) {
      const url = new URL(frame.src);
      if (url.searchParams.get('hl') === language()) return;
      url.searchParams.set('hl', language()); frame.src = url.href;
    });
  }
  // The written excerpts move as whole cards with their own controls (the native scrollbar is hidden only once this script runs).
  function rail(list) {
    const controls = list.parentElement.querySelector('[data-review-rail-controls]');
    if (!controls) return;
    const prev = controls.querySelector('[data-review-rail="prev"]'), next = controls.querySelector('[data-review-rail="next"]');
    const bar = controls.querySelector('.review-rail-progress');
    // Steps from the card the row is heading to, so quick repeated clicks are never lost mid-animation.
    let target = null, idle;
    function settle(delay) { clearTimeout(idle); idle = setTimeout(function () { target = null; update(); }, delay); }
    function update() {
      const max = list.scrollWidth - list.clientWidth;
      controls.hidden = max <= 1;
      bar.style.setProperty('--start', (list.scrollLeft / list.scrollWidth * 100) + '%');
      bar.style.setProperty('--size', (list.clientWidth / list.scrollWidth * 100) + '%');
      if (target !== null) return;
      prev.setAttribute('aria-disabled', String(list.scrollLeft <= 1));
      next.setAttribute('aria-disabled', String(list.scrollLeft >= max - 1));
    }
    function stepWidth() {
      const card = list.querySelector('.review-quote');
      return card ? card.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0) : list.clientWidth;
    }
    function move(direction) {
      const step = stepWidth(), max = list.scrollWidth - list.clientWidth;
      const from = target === null ? Math.round(list.scrollLeft / step) : target;
      target = Math.max(0, Math.min(Math.round(max / step), from + direction));
      list.scrollTo({ left: Math.min(max, target * step), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      prev.setAttribute('aria-disabled', String(target <= 0));
      next.setAttribute('aria-disabled', String(target >= Math.round(max / step)));
      settle(900);
    }
    prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') move(-1); });
    next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') move(1); });
    list.addEventListener('pointerdown', function () { target = null; update(); }, { passive: true });
    list.addEventListener('scroll', function () { update(); settle(300); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(list); else window.addEventListener('resize', update);
    list.classList.add('review-rail');
    update();
  }
  document.addEventListener('DOMContentLoaded', function () {
    syncMap();
    document.querySelectorAll('[data-review-quotes]').forEach(rail);
    window.addEventListener('lajolla-language', syncMap);
    const key = document.querySelector('meta[name="google-maps-browser-key"]')?.content || '';
    if (!/^[A-Za-z0-9_-]{20,120}$/.test(key)) return;
    document.querySelectorAll('[data-guest-reviews]').forEach(function (section) {
      const status = section.querySelector('.reviews-status'), results = section.querySelector('.reviews-results');
      let place;
      // Reviews appear on their own as the visitor approaches them; nothing from Google loads before.
      async function load() {
        status.hidden = false; status.dataset.state = 'loading'; status.textContent = messages().loading;
        try {
          const { Place } = await loadPlaces(key);
          place = new Place({ id: placeId });
          await place.fetchFields({ fields: ['reviews', 'attributions'] });
          const hasReviews = renderReviews(results, place);
          // Google's own selection replaces the written excerpts once it loads.
          if (hasReviews) section.querySelector('[data-review-quotes]')?.setAttribute('hidden', '');
          status.dataset.state = hasReviews ? 'ready' : 'empty';
          status.hidden = hasReviews; status.textContent = hasReviews ? '' : messages().empty;
        } catch (_) {
          // The written excerpts stay; only say Google is unavailable when nothing else is shown.
          status.dataset.state = 'unavailable'; status.textContent = messages().unavailable;
          status.hidden = !!section.querySelector('[data-review-quotes]:not([hidden])');
        }
      }
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
          if (!entries.some(entry => entry.isIntersecting)) return;
          observer.disconnect(); load();
        }, { rootMargin: '400px 0px' });
        observer.observe(section);
      }
      window.addEventListener('lajolla-language', function () {
        if (place) renderReviews(results, place);
        if (!status.hidden) status.textContent = messages()[status.dataset.state] || '';
      });
    });
  });
})();
