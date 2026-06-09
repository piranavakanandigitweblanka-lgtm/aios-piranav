// ============================================
// HOMEPAGE SECTION TRACKER (UK ONLY - SRI LANKA EXCLUDED)
// ============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJVszsnBofXfG0H28yocTRdmnoBPyWji7vsG8HC4gxIFZDXnDK-I_cZ5-JihTN-vV2/exec';
const GEOLOCATION_API = 'https://ipapi.co/json/';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Your section IDs
const SECTIONS = [
 'shopify-section-template--24751306899842__lookbook_JdFQNt',
'shopifyChatV1Widget.js:2 shopify-section-template--24751306899842__collection_meta_filters_3j6DXw'
];

// Only run on homepage
if (window.location.pathname === 'collections/conduit-accessories') {
  console.log('Homepage tracker initializing...');

  // ---- GEOLOCATION CHECK WITH PROPER CACHING ----
  async function getCountryCode() {
    try {
      // Check if country is cached AND cache hasn't expired
      const cachedCountry = localStorage.getItem('user_country_cache');
      const cacheTime = localStorage.getItem('user_country_cache_time');
      
      if (cachedCountry && cacheTime) {
        const timePassed = Date.now() - parseInt(cacheTime);
        
        // ✅ FIX: Check if cache is still valid
        if (timePassed < CACHE_DURATION) {
          console.log(`✅ Using cached country: ${cachedCountry} (${Math.floor(timePassed / 1000)}s old)`);
          return cachedCountry;
        } else {
          console.log('Cache expired - fetching fresh geolocation...');
          // Clear expired cache
          localStorage.removeItem('user_country_cache');
          localStorage.removeItem('user_country_cache_time');
        }
      }

      console.log('🌐 Fetching geolocation from IP API...');
      const response = await fetch(GEOLOCATION_API, { timeout: 5000 });
      
      if (!response.ok) {
        console.error('❌ Geolocation API error:', response.status);
        return null;
      }

      const data = await response.json();
      const countryCode = data.country_code;
      
      console.log(`✅ Geolocation successful - Country code: ${countryCode}`);
      
      // Cache for 24 hours
      localStorage.setItem('user_country_cache', countryCode);
      localStorage.setItem('user_country_cache_time', Date.now());
      
      return countryCode;
    } catch (error) {
      console.error('❌ Geolocation check failed:', error);
      return null;
    }
  }

  // ---- CHECK COUNTRY BEFORE TRACKING ----
  getCountryCode().then(countryCode => {
    // Block if no country detected
    if (!countryCode) {
      console.warn('⚠️ Country detection failed - tracker disabled');
      return;
    }

    // ====== BLOCK SRI LANKA ======
    if (countryCode === 'LK') {
      console.log('🚫 Sri Lanka (LK) detected - tracker BLOCKED');
      console.log('Data will NOT be sent to Google Sheets');
      return;
    }

    // ====== ONLY ALLOW UK ======
    if (countryCode !== 'GB') {
      console.log(`❌ Non-UK user (${countryCode}) - tracker disabled`);
      return;
    }

    console.log('✅ UK user (GB) detected - starting tracker');
    initializeTracker();
  });

  // ---- TRACKER INITIALIZATION ----
  function initializeTracker() {
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
      console.log('📤 Sending event to Google Sheets:', payload);
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(error => {
        console.error('Failed to send event:', error);
      });
    }

    // ---- IMPRESSION TRACKING ----
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          console.log(`📊 Impression: ${sectionId}`);
          sendEvent({
            event: 'impression',
            section_id: sectionId,
            date: today,
            uk_time: getUKDateTime()
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // ---- CLICK TRACKING ----
    SECTIONS.forEach(sectionId => {
      const el = document.getElementById(sectionId);
      if (el) {
        // Start observing for impressions
        observer.observe(el);

        // Add click listener
        el.addEventListener('click', (event) => {
          console.log(`🖱️ Click on: ${sectionId}`);
          
          // Store in cookie for reference
          document.cookie = `last_clicked_section=${sectionId}; path=/; max-age=3600`;
          
          // Send to Google Sheets
          sendEvent({
            event: 'click',
            section_id: sectionId,
            date: today,
            uk_time: getUKDateTime()
          });
        });
      }
    });

    console.log(`✅ Tracker initialized. Monitoring ${SECTIONS.length} sections.`);
  }
}
