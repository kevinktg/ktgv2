(() => {
  //console.log('🔥 Ad script initialized');

  // 1. Load sponsor CSS with cache busting
  const cssHref = `https://tympanus.net/codrops/adpacks/cda_sponsor.css?${Date.now()}`;
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  cssLink.href = cssHref;
  document.head.appendChild(cssLink);
  //console.log('🎨 Sponsor CSS appended:', cssHref);

  // 2. Sponsor definitions
  const sponsors = {
    ad1: {
      link: 'https://droip.com?affiliate=Manoela_Ilic',
      text: 'Droip: The Next Big Revolution in WordPress',
    },
    ad2: {
      link: 'https://www.creativecodingclub.com/bundles/creative-coding-club?ref=0d0431',
      text: 'Become a GSAP master with 300+ exclusive lessons and lifetime access →',
    },
    ad3: {
      link: 'https://www.creativecodingclub.com/courses/FreeGSAP3Express?ref=0d0431',
      text: 'Learn GSAP for free in 34 video lessons →',
    },
    ad4: {
      link: 'https://www.elegantthemes.com/affiliates/idevaffiliate.php?id=17972&url=87433',
      text: 'Power Your Freelance Web Business With Divi',
    },
  };

  // 🔧 Define which ads are allowed to show
  const cdaSpots = ['ad2']; // 👈 Edit this to control the selection
  const validKeys = cdaSpots.filter((key) => sponsors.hasOwnProperty(key));

  if (validKeys.length === 0) {
    console.warn('🚫 No valid sponsor keys found in cdaSpots');
    return;
  }

  const selectedKey = validKeys[Math.floor(Math.random() * validKeys.length)];
  const { link, text } = sponsors[selectedKey];
  //console.log(`🎯 Selected sponsor: ${selectedKey}`);

  // 3. Build the sponsor DOM element
  const cda = document.createElement('div');
  cda.id = 'cdawrap';
  cda.className = 'cdawrap';
  cda.innerHTML = `
    <a href="${link}" class="cda-sponsor-link" target="_blank" rel="nofollow noopener">
      ${text}
    </a>
  `;
  //console.log('📦 Sponsor element prepared');

  // 4. Detect .frame using MutationObserver
  const insertCda = () => {
    const frame = document.querySelector('.frame');
    if (frame) {
      console.log('✅ .frame element found, injecting ad');
      frame.appendChild(cda);
      return true;
    } else {
      console.log('⏳ Waiting for .frame element...');
      return false;
    }
  };

  if (!insertCda()) {
    const observer = new MutationObserver(() => {
      if (insertCda()) {
        observer.disconnect();
        console.log('🔌 Observer disconnected');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      console.warn('❌ Frame element never appeared. Giving up.');
    }, 5000);
  }
})();
