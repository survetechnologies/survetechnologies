// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navActions.classList.toggle('active');
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Agent category filtering
const categoryButtons = document.querySelectorAll('.category-btn');
const agentCards = document.querySelectorAll('.agent-card');

categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    // Add active class to clicked button
    button.classList.add('active');
    
    const category = button.getAttribute('data-category');
    
    // Filter agent cards
    agentCards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = 'block';
        card.classList.remove('hidden');
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });
  });
});

// Modal functionality
const modal = document.getElementById('hireModal');
const hireButtons = document.querySelectorAll('.agent-hire-btn');
const closeModal = document.querySelector('.close');
const cancelButton = document.getElementById('cancelHire');
const hireForm = document.getElementById('hireForm');
const modalAgentInfo = document.getElementById('modalAgentInfo');

// Open modal when hire button is clicked
hireButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const agentCard = e.target.closest('.agent-card');
    const agentTitle = agentCard.querySelector('.agent-title').textContent;
    const agentPrice = agentCard.querySelector('.price').textContent;
    const agentPriceUnit = agentCard.querySelector('.price-unit').textContent;
    
    // Update modal with agent info
    modalAgentInfo.innerHTML = `
      <div class="modal-agent-info">
        <h3>${agentTitle}</h3>
        <p class="modal-pricing">
          <span class="modal-price">${agentPrice}</span>
          <span class="modal-price-unit">${agentPriceUnit}</span>
        </p>
      </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });
});

// Close modal
function closeHireModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  hireForm.reset();
}

closeModal.addEventListener('click', closeHireModal);
cancelButton.addEventListener('click', closeHireModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeHireModal();
  }
});

// Handle form submission
hireForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(hireForm);
  const projectName = formData.get('projectName') || document.getElementById('projectName').value;
  const projectDescription = formData.get('projectDescription') || document.getElementById('projectDescription').value;
  const budget = formData.get('budget') || document.getElementById('budget').value;
  const timeline = formData.get('timeline') || document.getElementById('timeline').value;
  
  // Simulate form submission
  const submitButton = hireForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Processing...';
  submitButton.disabled = true;
  
  setTimeout(() => {
    alert('Thank you! Your request has been submitted. We will contact you within 24 hours to discuss your project.');
    closeHireModal();
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }, 2000);
});

// Navbar scroll effect
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down
    header.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up
    header.style.transform = 'translateY(0)';
  }
  
  lastScrollTop = scrollTop;
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .agent-card, .step, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Counter animation for hero stats
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('%') ? '%' : '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('%') ? '%' : '');
    }
  }, 16);
}

// Animate counters when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        const text = stat.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        stat.textContent = '0' + (text.includes('+') ? '+' : '') + (text.includes('%') ? '%' : '');
        animateCounter(stat, number);
      });
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  heroObserver.observe(heroStats);
}

// Navigation is now handled via links in HTML
// No need for JavaScript redirect handlers

// Search functionality (if needed)
function searchAgents(query) {
  const searchTerm = query.toLowerCase();
  agentCards.forEach(card => {
    const title = card.querySelector('.agent-title').textContent.toLowerCase();
    const description = card.querySelector('.agent-description').textContent.toLowerCase();
    const features = Array.from(card.querySelectorAll('.feature-tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
    
    if (title.includes(searchTerm) || description.includes(searchTerm) || features.includes(searchTerm)) {
      card.style.display = 'block';
      card.classList.remove('hidden');
    } else {
      card.style.display = 'none';
      card.classList.add('hidden');
    }
  });
}

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'block') {
    closeHireModal();
  }
});

// Add focus management for modal
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const focusableElements = modal.querySelectorAll('input, textarea, select, button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
});

// Performance optimization: Lazy load images if any
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Add CSS for modal agent info
const modalStyles = `
  .modal-agent-info {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #6366f1;
  }
  
  .modal-agent-info h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
  }
  
  .modal-pricing {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
  }
  
  .modal-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #6366f1;
  }
  
  .modal-price-unit {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

console.log('RentAIAgent.ai website loaded successfully!');
