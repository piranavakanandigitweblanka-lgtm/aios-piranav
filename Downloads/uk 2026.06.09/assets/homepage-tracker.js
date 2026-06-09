// ============================================
// HOMEPAGE SECTION TRACKER
// ============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuV-OEGuOubXM0xrjd-y6Pnx8neGgUvVVaDWWoJ6nSr9h9P-NDiVGLBehSmQNKYkNB/exec';

// Your section IDs
const SECTIONS = [
  'shopify-section-announcement',
  'shopify-section-top-bar',
  'shopify-section-horizontal-menu',
  'shopify-section-category-navigation',
  'shopify-section-template--24751308046722__e7f8d580-b9df-4f1d-a91a-52fff5161a83',
  'shopify-section-template--24751308046722__banner_gallery_XrY4jL',
  'shopify-section-template--24751308046722__collection_list_xdfwYG',
  'shopify-section-template--24751308046722__product_collection_showcase_tpXJiY',
  'shopify-section-template--24751308046722__daily_promotion_K8iAn4',
  'shopify-section-template--24751308046722__product_super_deal_dQbdb8',
  'shopify-section-template--24751308046722__banner_image_DqwAL4',
  'shopify-section-template--24751308046722__wholesale_trendy_discovery_frMkB7',
  'shopify-section-template--24751308046722__collection_list_M6kfnQ',
  'shopify-section-template--24751308046722__category_grid_zXkc3t',
  'shopify-section-template--24751308046722__blog_posts_37McWG',
  'shopify-section-template--24751308046722__custom_html_emLeV9',
  'shopify-section-template--24751308046722__a33b07e7-4bfe-49be-b75c-f5ca36b7975d',
  'shopify-section-order-tracking',
  'shopify-section-footer-2',
  'shopify-section-mobile-stickybar',
  'shopify-section-custom-colors'
];

// Only run on homepage
if (window.location.pathname === '/') {
  console.log('Homepage tracker running');

  const today = new Date().toISOString().split('T')[0];

  function getUKDateTime() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
  }

  function sendEvent(payload) {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  // ---- IMPRESSION TRACKING ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log(`Impression for section: ${entry.target.id}`);
        sendEvent({
          event: 'impression',
          section_id: entry.target.id,
          date: today,
          uk_time: getUKDateTime()
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 }); // 30% of section must be visible

  // ---- CLICK TRACKING ----
  SECTIONS.forEach(sectionId => {
    const el = document.getElementById(sectionId);
    if (el) {
      console.log(`Tracking section: ${sectionId}`);
      observer.observe(el);

      el.addEventListener('click', () => {
        console.log(`Click on section: ${sectionId}`);
        document.cookie = `last_clicked_section=${sectionId}; path=/; max-age=3600`; // 1 hour
        sendEvent({
          event: 'click',
          section_id: sectionId,
          date: today,
          uk_time: getUKDateTime()
        });
      });
    }
  });
}