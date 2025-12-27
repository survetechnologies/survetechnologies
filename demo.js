// Demo Script for Invoice Processing Workflow

let currentStep = 0;
const totalSteps = 4;
let demoInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const demoModal = document.getElementById('demoModal');
  const startDemoBtn = document.getElementById('startDemo');
  const resetDemoBtn = document.getElementById('resetDemo');
  const nextStepBtn = document.getElementById('nextStep');
  const closeDemoBtn = document.getElementById('closeDemo');
  const uploadArea = document.getElementById('uploadArea');
  const invoiceFile = document.getElementById('invoiceFile');

  // Open demo modal when "Watch Demo" is clicked
  const watchDemoButtons = document.querySelectorAll('[data-demo]');
  watchDemoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openDemo();
    });
  });

  // If demo.html is opened directly, show modal
  if (window.location.pathname.includes('demo.html') || !watchDemoButtons.length) {
    setTimeout(() => {
      openDemo();
    }, 100);
  }

  // Start demo button
  if (startDemoBtn) {
    startDemoBtn.addEventListener('click', () => {
      startDemo();
    });
  }

  // Reset demo button
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      resetDemo();
    });
  }

  // Next step button
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      nextStep();
    });
  }

  // Close demo button
  if (closeDemoBtn) {
    closeDemoBtn.addEventListener('click', () => {
      closeDemo();
    });
  }

  // Close on outside click
  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        closeDemo();
      }
    });
  }

  // Upload area click
  if (uploadArea && invoiceFile) {
    uploadArea.addEventListener('click', () => {
      invoiceFile.click();
    });

    invoiceFile.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (demoModal && demoModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeDemo();
      }
    }
  });
});

function openDemo() {
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    demoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetDemo();
  }
}

function closeDemo() {
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    demoModal.classList.remove('active');
    document.body.style.overflow = '';
    resetDemo();
  }
}

function resetDemo() {
  currentStep = 0;
  
  // Reset all steps
  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step${i}`);
    if (step) {
      step.classList.remove('active');
    }
  }

  // Show step 1
  const step1 = document.getElementById('step1');
  if (step1) {
    step1.classList.add('active');
  }

  // Reset upload
  const uploadedFile = document.getElementById('uploadedFile');
  const uploadArea = document.getElementById('uploadArea');
  if (uploadedFile) uploadedFile.style.display = 'none';
  if (uploadArea) uploadArea.style.display = 'block';

  // Reset extraction
  const extractedData = document.getElementById('extractedData');
  if (extractedData) extractedData.style.display = 'none';

  // Reset approval
  const approvalResult = document.getElementById('approvalResult');
  if (approvalResult) approvalResult.style.display = 'none';

  // Reset payment
  const paymentSuccess = document.getElementById('paymentSuccess');
  if (paymentSuccess) paymentSuccess.style.display = 'none';

  // Reset buttons
  const startBtn = document.getElementById('startDemo');
  const nextBtn = document.getElementById('nextStep');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (nextBtn) nextBtn.style.display = 'none';

  // Clear any intervals
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
}

function startDemo() {
  const startBtn = document.getElementById('startDemo');
  const nextBtn = document.getElementById('nextStep');
  
  if (startBtn) startBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

  // Auto-upload file
  handleFileUpload(null);
  
  // Auto-advance through steps
  setTimeout(() => {
    nextStep();
  }, 2000);
}

function handleFileUpload(file) {
  const uploadArea = document.getElementById('uploadArea');
  const uploadedFile = document.getElementById('uploadedFile');
  
  if (uploadArea) {
    uploadArea.style.display = 'none';
  }
  
  if (uploadedFile) {
    uploadedFile.style.display = 'flex';
    uploadedFile.style.animation = 'fadeInUp 0.5s ease';
  }

  // Auto-advance to next step after upload
  setTimeout(() => {
    if (currentStep === 0) {
      nextStep();
    }
  }, 1500);
}

function nextStep() {
  // Hide current step
  const currentStepEl = document.getElementById(`step${currentStep + 1}`);
  if (currentStepEl) {
    currentStepEl.classList.remove('active');
  }

  currentStep++;

  if (currentStep > totalSteps) {
    // Demo complete, restart
    setTimeout(() => {
      resetDemo();
      const startBtn = document.getElementById('startDemo');
      if (startBtn) startBtn.style.display = 'inline-block';
    }, 3000);
    return;
  }

  // Show next step
  const nextStepEl = document.getElementById(`step${currentStep}`);
  if (nextStepEl) {
    nextStepEl.classList.add('active');
    
    // Scroll to step
    nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Handle step-specific animations
  switch (currentStep) {
    case 2:
      // Extraction step
      setTimeout(() => {
        showExtractedData();
      }, 3000);
      break;
    case 3:
      // Approval step
      setTimeout(() => {
        showApprovalResult();
      }, 2500);
      break;
    case 4:
      // Payment step
      setTimeout(() => {
        showPaymentSuccess();
      }, 3000);
      break;
  }
}

function showExtractedData() {
  const extractedData = document.getElementById('extractedData');
  if (extractedData) {
    extractedData.style.display = 'block';
    extractedData.style.animation = 'fadeIn 0.5s ease';
    
    // Auto-advance after showing data
    setTimeout(() => {
      nextStep();
    }, 2000);
  }
}

function showApprovalResult() {
  const approvalResult = document.getElementById('approvalResult');
  if (approvalResult) {
    approvalResult.style.display = 'block';
    approvalResult.style.animation = 'fadeIn 0.5s ease';
    
    // Auto-advance after approval
    setTimeout(() => {
      nextStep();
    }, 2000);
  }
}

function showPaymentSuccess() {
  const paymentSuccess = document.getElementById('paymentSuccess');
  if (paymentSuccess) {
    paymentSuccess.style.display = 'block';
    paymentSuccess.style.animation = 'fadeIn 0.5s ease';
    
    // Show restart option after completion
    setTimeout(() => {
      const startBtn = document.getElementById('startDemo');
      if (startBtn) {
        startBtn.textContent = 'Restart Demo';
        startBtn.style.display = 'inline-block';
      }
    }, 2000);
  }
}

// Make functions available globally
window.openDemo = openDemo;
window.closeDemo = closeDemo;

