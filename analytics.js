(() => {
  const ATTRIBUTION_KEY = 'lidforma_attribution_v1';
  const ONCE_PREFIX = 'lidforma_event_once_';
  const TRACKED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

  const safeStorage = {
    get(key) {
      try { return window.sessionStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { window.sessionStorage.setItem(key, value); } catch { /* Storage can be blocked. */ }
    }
  };

  const clean = value => String(value ?? '').trim().slice(0, 160);
  const current = new URLSearchParams(window.location.search);
  let saved = {};
  try { saved = JSON.parse(safeStorage.get(ATTRIBUTION_KEY) || '{}'); } catch { saved = {}; }

  const attribution = { ...saved };
  TRACKED_PARAMS.forEach(key => {
    const value = current.get(key);
    if (value) attribution[key] = clean(value);
  });
  if (!attribution.landing_page) attribution.landing_page = clean(`${location.origin}${location.pathname}`);
  if (!attribution.referrer && document.referrer && !document.referrer.startsWith(location.origin)) {
    attribution.referrer = clean(document.referrer);
  }
  attribution.first_seen_at = attribution.first_seen_at || new Date().toISOString();
  safeStorage.set(ATTRIBUTION_KEY, JSON.stringify(attribution));

  const publicAttribution = () => ({
    utmSource: attribution.utm_source || '',
    utmMedium: attribution.utm_medium || '',
    utmCampaign: attribution.utm_campaign || '',
    utmContent: attribution.utm_content || '',
    utmTerm: attribution.utm_term || '',
    fbclid: attribution.fbclid || '',
    landingPage: attribution.landing_page || '',
    referrer: attribution.referrer || ''
  });

  function normalizeParams(params = {}) {
    return Object.fromEntries(Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, typeof value === 'number' ? value : clean(value)]));
  }

  function dispatch(eventName, params = {}, standard = false) {
    const payload = normalizeParams(params);
    if (typeof window.fbq === 'function') window.fbq(standard ? 'track' : 'trackCustom', eventName, payload);
    if (typeof window.gtag === 'function') window.gtag('event', eventName, payload);
    if (typeof window.clarity === 'function') window.clarity('event', eventName);
  }

  function once(key, callback) {
    const storageKey = `${ONCE_PREFIX}${key}`;
    if (safeStorage.get(storageKey)) return false;
    safeStorage.set(storageKey, '1');
    callback();
    return true;
  }

  const campaign = attribution.utm_campaign || '';
  const isAuditCampaign = /test_03_3_changes|3_changes|audit/i.test(campaign) || current.get('offer') === 'audit';
  const campaignContext = () => normalizeParams({
    utm_source: attribution.utm_source,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content
  });

  window.LidformaAnalytics = {
    getAttribution: publicAttribution,
    getCampaignContext: campaignContext,
    isAuditCampaign: () => isAuditCampaign,
    trackCustom: (name, params) => dispatch(name, { ...campaignContext(), ...params }, false),
    trackStandard: (name, params) => dispatch(name, { ...campaignContext(), ...params }, true),
    once
  };

  if (TRACKED_PARAMS.some(key => attribution[key])) {
    once(`ad_landing_${campaign || 'unknown'}`, () => dispatch('AdLandingView', campaignContext(), false));
  }
})();
