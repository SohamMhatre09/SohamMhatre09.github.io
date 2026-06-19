const fs = require('fs');
let code = fs.readFileSync('src/homepage.js', 'utf8');

const replacement = `
    function updateJourneyLayout() {
      if (!journeySection || !journeyTrack) return;
      const maxScroll = journeyTrack.scrollWidth - window.innerWidth;
      journeySection.style.height = \`\${maxScroll + window.innerHeight}px\`;
    }

    function updateJourneyScroll() {
      if (!journeySection || !journeyTrack) return;
      const secTop = journeySection.offsetTop;
      const secH = journeySection.offsetHeight;
      const scrollY = window.scrollY;

      if (scrollY >= secTop - window.innerHeight && scrollY <= secTop + secH) {
        let progress = (scrollY - secTop) / (secH - window.innerHeight);
        progress = Math.max(0, Math.min(1, progress));

        const maxScroll = journeyTrack.scrollWidth - window.innerWidth;
        if (maxScroll > 0) {
          const tx = progress * maxScroll;
          journeyTrack.style.transform = \`translate3d(-\${tx}px, 0, 0)\`;
        }
      }
    }

    window.addEventListener('resize', () => {
      heroH = hero.offsetHeight;
      vh = window.innerHeight;
      updateStackCards();
      updateJourneyLayout();
      updateJourneyScroll();
    });
`;

code = code.replace(/function updateJourneyScroll\(\) \{[\s\S]*?updateJourneyScroll\(\);/, replacement + '\n    updateJourneyLayout();\n    updateJourneyScroll();');

fs.writeFileSync('src/homepage.js', code);
