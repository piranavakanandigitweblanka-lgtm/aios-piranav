(function() {
  var scriptsLoaded = false;
  function loadThirdPartyScripts() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;
    
    console.log('Loading third-party scripts on interaction...');

    // TikTok Pixel Code
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      (ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent',
      ]),
        (ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        });
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      (ttq.instance = function (t) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      }),
        (ttq.load = function (e, n) {
          var r = 'https://analytics.tiktok.com/i18n/pixel/events.js',
            o = n && n.partner;
          (ttq._i = ttq._i || {}),
            (ttq._i[e] = []),
            (ttq._i[e]._u = r),
            (ttq._t = ttq._t || {}),
            (ttq._t[e] = +new Date()),
            (ttq._o = ttq._o || {}),
            (ttq._o[e] = n || {});
          n = document.createElement('script');
          (n.type = 'text/javascript'), (n.async = !0), (n.src = r + '?sdkid=' + e + '&lib=' + t);
          e = document.getElementsByTagName('script')[0];
          e.parentNode.insertBefore(n, e);
        });

      ttq.load('CQOSBMRC77U65T3JCO2G');
      ttq.page();
    })(window, document, 'ttq');

    // Microsoft Clarity Code
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', 'ld9y8d60j4');

   // ============================================
    // HOMEPAGE SECTION TRACKER (Merged)
    // ============================================
    if (document.body.classList.contains('template-index')) {
      // Sri Lanka check - disable tracking
      let isSriLanka = false;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz === 'Asia/Colombo') {
          isSriLanka = true;
        }
      } catch (e) {}
      if (new Date().getTimezoneOffset() === -330) {
        isSriLanka = true;
      }
      if (isSriLanka) {
        console.log('Homepage tracking is disabled for Sri Lanka.');
        return;
      }

      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_fIlvyvDJJ5ANb0bbDP0526NZx1vXErx3h64iRVEw-a223huDi8zxN0bWHalOBbZR/exec';
      const SECTIONS = [
        'shopify-section-announcement', 'shopify-section-top-bar', 'shopify-section-horizontal-menu',
        'shopify-section-category-navigation', 'shopify-section-template--24751308046722__e7f8d580-b9df-4f1d-a91a-52fff5161a83',
        'shopify-section-template--24751308046722__banner_gallery_XrY4jL', 'shopify-section-template--24751308046722__collection_list_xdfwYG',
        'shopify-section-template--24751308046722__product_collection_showcase_tpXJiY', 'shopify-section-template--24751308046722__daily_promotion_K8iAn4',
        'shopify-section-template--24751308046722__product_super_deal_dQbdb8', 'shopify-section-template--24751308046722__banner_image_DqwAL4',
        'shopify-section-template--24751308046722__wholesale_trendy_discovery_frMkB7', 'shopify-section-template--24751308046722__collection_list_M6kfnQ',
        'shopify-section-template--24751308046722__category_grid_zXkc3t', 'shopify-section-template--24751308046722__blog_posts_37McWG',
        'shopify-section-template--24751308046722__custom_html_emLeV9', 'shopify-section-template--24751308046722__a33b07e7-4bfe-49be-b75c-f5ca36b7975d',
        'shopify-section-order-tracking', 'shopify-section-footer-2', 'shopify-section-mobile-stickybar', 'shopify-section-custom-colors'
      ];

      const today = new Date().toISOString().split('T')[0];
      function getUKDateTime() {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).formatToParts(new Date());
        const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
        return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
      }

      function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
          return 'tablet';
        }
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
          return 'mobile';
        }
        return 'desktop';
      }

      function sendEvent(payload) {
        const fullPayload = {
          ...payload,
          device: getDeviceType()
        };
        fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload) });
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            sendEvent({ event: 'impression', section_id: entry.target.id, date: today, uk_time: getUKDateTime() });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      SECTIONS.forEach(sectionId => {
        const el = document.getElementById(sectionId);
        if (el) {
          observer.observe(el);
          el.addEventListener('click', () => {
            document.cookie = `last_clicked_section=${sectionId}; path=/; max-age=3600`;
            sendEvent({ event: 'click', section_id: sectionId, date: today, uk_time: getUKDateTime() });
          });
        }
      });
      console.log('Homepage tracker initialized (via interaction).');
    }
  }

  // Trigger on interaction
  ['mouseover', 'keydown', 'touchstart', 'scroll'].forEach(function(event) {
    window.addEventListener(event, loadThirdPartyScripts, { once: true, passive: true });
  });

  // Fallback delay
  setTimeout(loadThirdPartyScripts, 5000);
})();
