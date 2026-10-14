(function () {
  'use strict';
  const placeId = 'ChIJWbeTzJu32YgRbGDUdwzI0W0';
  const copy = {
    en: { loading: 'Loading guest reviews…', empty: 'Read guest experiences on Google Maps.', unavailable: 'Reviews are unavailable here at the moment. You can read them on Google Maps.', selected: 'Selected five-star reviews, in Google Maps relevance order.', source: 'View original review', map: 'Map of La Jolla, 301 Alcazar Avenue, Coral Gables' },
    es: { loading: 'Cargando reseñas…', empty: 'Lea las experiencias de nuestros invitados en Google Maps.', unavailable: 'Las reseñas no están disponibles aquí en este momento. Puede leerlas en Google Maps.', selected: 'Selección de reseñas de cinco estrellas, en el orden de relevancia de Google Maps.', source: 'Ver reseña original', map: 'Mapa de La Jolla, 301 Alcazar Avenue, Coral Gables' }
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
  function renderReviews(container, place) {
    container.replaceChildren();
    const reviews = (place.reviews || []).filter(review => review.rating === 5 &&
      (review.originalText || review.text)?.trim() && review.authorAttribution?.displayName &&
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
  // The Google map is a keyless embed that loads only after the visitor asks
  // for it; until then the section shows the house and plain map links.
  function initMap(container) {
    const button = container.querySelector('.location-map-load');
    if (!button) return;
    button.addEventListener('click', function open(event) {
      // Without this script the link simply opens Google Maps in a new tab;
      // modified clicks keep that behavior.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      button.removeEventListener('click', open);
      event.preventDefault();
      const frame = document.createElement('iframe');
      const url = new URL('https://www.google.com/maps');
      url.searchParams.set('q', 'La Jolla, 301 Alcazar Avenue, Coral Gables, FL');
      url.searchParams.set('output', 'embed');
      const show = () => {
        frame.title = messages().map;
        if (url.searchParams.get('hl') === language()) return;
        url.searchParams.set('hl', language()); frame.src = url.href;
      };
      frame.loading = 'lazy'; show();
      frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.allowFullscreen = true;
      container.append(frame); container.classList.add('is-open'); frame.focus();
      window.addEventListener('lajolla-language', show);
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-location-map]').forEach(initMap);
    const key = document.querySelector('meta[name="google-maps-browser-key"]')?.content || '';
    if (!/^[A-Za-z0-9_-]{20,120}$/.test(key)) return;
    document.querySelectorAll('[data-guest-reviews]').forEach(function (section) {
      const button = section.querySelector('.reviews-load'), status = section.querySelector('.reviews-status'), results = section.querySelector('.reviews-results');
      let place;
      button.hidden = false;
      button.addEventListener('click', async function () {
        button.disabled = true; status.hidden = false; status.dataset.state = 'loading'; status.textContent = messages().loading;
        try {
          const { Place } = await loadPlaces(key);
          place = new Place({ id: placeId });
          await place.fetchFields({ fields: ['reviews', 'attributions'] });
          const hasReviews = renderReviews(results, place);
          status.dataset.state = hasReviews ? 'ready' : 'empty';
          status.hidden = hasReviews; status.textContent = hasReviews ? '' : messages().empty;
        } catch (_) { status.dataset.state = 'unavailable'; status.textContent = messages().unavailable; }
        button.hidden = true;
      });
      window.addEventListener('lajolla-language', function () {
        if (place) renderReviews(results, place);
        if (!status.hidden) status.textContent = messages()[status.dataset.state] || '';
      });
    });
  });
})();
