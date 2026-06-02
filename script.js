// ===== ZHANGJIAJIE LOCAL EATS - Main Script =====
// Free content + voluntary support via PayPal payment link

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initNavProgress();
  initTipJar();
  initPhraseSpeaker();
});

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

// ===== NAV PROGRESS DOTS =====
function initNavProgress() {
  const nav = document.querySelector('.nav-progress');
  if (!nav) return;

  const sections = document.querySelectorAll('[data-section]');
  const dots = nav.querySelectorAll('.nav-dot');

  let heroHeight = document.querySelector('.hero')?.offsetHeight || 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > heroHeight * 0.6) {
      nav.classList.add('visible');
    } else {
      nav.classList.remove('visible');
    }

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 4) {
        dots.forEach((d) => d.classList.remove('active'));
        if (dots[i]) dots[i].classList.add('active');
      }
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.querySelector(dot.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== TIP JAR =====
function initTipJar() {
  const tipBtn = document.getElementById('tip-btn');
  const modal = document.getElementById('tip-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const supportBtn = document.getElementById('modal-support-btn');

  if (!tipBtn || !modal) return;

  // Open modal
  tipBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  btnCancel?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // When user clicks the support button (opens PayPal link)
  // Show thank you message after a short delay
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      // Close modal after a brief moment
      setTimeout(() => {
        closeModal();
      }, 800);
    });
  }
}

// ===== PHRASE SPEAKER (Chinese TTS) =====
function initPhraseSpeaker() {
  const cards = document.querySelectorAll('.phrase-card[data-speak]');
  if (!cards.length || !('speechSynthesis' in window)) return;

  // Cache the Chinese voice once available
  let zhVoice = null;

  function findChineseVoice() {
    const voices = speechSynthesis.getVoices();
    // Prefer zh-CN voices, fallback to any zh voice
    zhVoice = voices.find(v => v.lang === 'zh-CN')
           || voices.find(v => v.lang.startsWith('zh'))
           || null;
  }

  // Voices load asynchronously in some browsers
  findChineseVoice();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = findChineseVoice;
  }

  function speakChinese(text, card) {
    // Stop any current speech
    speechSynthesis.cancel();

    // Remove speaking state from all cards
    cards.forEach(c => c.classList.remove('speaking'));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.75;  // Slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    // Visual feedback
    card.classList.add('speaking');

    utterance.onend = () => {
      card.classList.remove('speaking');
    };

    utterance.onerror = () => {
      card.classList.remove('speaking');
    };

    speechSynthesis.speak(utterance);
  }

  cards.forEach(card => {
    const text = card.dataset.speak;

    // Click anywhere on the card to play
    card.addEventListener('click', (e) => {
      e.preventDefault();
      speakChinese(text, card);
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        speakChinese(text, card);
      }
    });
  });
}

// ===== SMOOTH PARALLAX FOR HERO =====
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-bg img');
  if (hero) {
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;
    if (scrollY < maxScroll) {
      hero.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
    }
  }
});
