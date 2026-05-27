// ===== ZHANGJIAJIE LOCAL EATS - Main Script =====
// Free content + voluntary tip via PayPal JS SDK

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initNavProgress();
  initTipJar();
  initPayPalButtons();
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
let selectedTipAmount = 3; // Default tip amount

function initTipJar() {
  const tipBtn = document.getElementById('tip-btn');
  const modal = document.getElementById('tip-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const amountBtns = document.querySelectorAll('.tip-amount-btn');

  if (!tipBtn || !modal) return;

  // Amount selection buttons
  amountBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      amountBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTipAmount = parseFloat(btn.dataset.amount);

      // Update display
      const displayEl = document.getElementById('tip-display-amount');
      if (displayEl) displayEl.textContent = '$' + selectedTipAmount;
    });
  });

  // Open modal
  tipBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    hidePaymentError();
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
}

// ===== PAYPAL JS SDK INTEGRATION (TIP MODE) =====
function initPayPalButtons() {
  if (typeof paypal === 'undefined') {
    const maxRetries = 20;
    let retries = 0;

    const interval = setInterval(() => {
      retries++;
      if (typeof paypal !== 'undefined') {
        clearInterval(interval);
        renderPayPalButtons();
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        showPayPalLoadError();
      }
    }, 500);
    return;
  }

  renderPayPalButtons();
}

function renderPayPalButtons() {
  const container = document.getElementById('paypal-button-container');
  const loading = document.getElementById('paypal-loading');

  if (!container) return;

  if (loading) loading.style.display = 'none';

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'pay',
      height: 45
    },

    createOrder: function(data, actions) {
      showPaymentProcessing(false);
      return actions.order.create({
        purchase_units: [{
          description: 'Zhangjiajie Local Eats - Tip',
          amount: {
            value: selectedTipAmount.toFixed(2),
            currency_code: 'USD'
          }
        }],
        application_context: {
          brand_name: 'Zhangjiajie Local Eats',
          shipping_preference: 'NO_SHIPPING'
        }
      });
    },

    onApprove: function(data, actions) {
      showPaymentProcessing(true);

      return actions.order.capture().then(function(details) {
        const transactionId = details.id || data.orderID;
        console.log('Tip received:', transactionId);

        // Close modal
        const modal = document.getElementById('tip-modal');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }

        hidePaymentProcessing();
        showTipSuccess();
      }).catch(function(err) {
        console.error('Capture error:', err);
        hidePaymentProcessing();
        showPaymentError('Tip could not be processed. Please try again.');
      });
    },

    onCancel: function(data) {
      hidePaymentProcessing();
      showPaymentError('Payment was cancelled. You can try again anytime.');
    },

    onError: function(err) {
      console.error('PayPal error:', err);
      hidePaymentProcessing();
      showPaymentError('Something went wrong. Please try again later.');
    }

  }).render('#paypal-button-container').then(function() {
    if (loading) loading.style.display = 'none';
  }).catch(function(err) {
    console.error('PayPal render error:', err);
    showPayPalLoadError();
  });
}

// ===== PAYMENT STATUS UI =====
function showPaymentProcessing(show) {
  const el = document.getElementById('payment-processing');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function hidePaymentProcessing() {
  showPaymentProcessing(false);
}

function showPaymentError(message) {
  const el = document.getElementById('payment-error');
  if (el) {
    const textEl = el.querySelector('.error-text');
    if (textEl && message) textEl.textContent = message;
    el.style.display = 'flex';
  }
}

function hidePaymentError() {
  const el = document.getElementById('payment-error');
  if (el) el.style.display = 'none';
}

function showPayPalLoadError() {
  const loading = document.getElementById('paypal-loading');
  if (loading) {
    loading.innerHTML = '<span class="error-icon">⚠️</span><span>Could not load payment. Please refresh the page.</span>';
    loading.style.display = 'flex';
    loading.style.color = 'var(--coral)';
  }
}

// ===== TIP SUCCESS =====
function showTipSuccess() {
  const toast = document.getElementById('tip-success-toast');
  if (toast) {
    toast.classList.add('show');
    createConfetti();

    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#f0c653', '#4ecca3', '#ff6b6b', '#a78bfa', '#fce38a', '#38b28a'];
  const shapes = ['square', 'circle'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    if (shapes[Math.floor(Math.random() * shapes.length)] === 'circle') {
      piece.style.borderRadius = '50%';
    } else {
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    }

    piece.style.width = (Math.random() * 8 + 4) + 'px';
    piece.style.height = piece.style.width;

    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 5000);
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
