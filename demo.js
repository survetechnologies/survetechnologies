// Demo Script for Invoice Processing Workflow

let currentStep = 0;
const totalSteps = 4;
let demoInterval = null;
let isPlaying = false;
let autoPlayInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const demoModal = document.getElementById('demoModal');
  const startDemoBtn = document.getElementById('startDemo');
  const resetDemoBtn = document.getElementById('resetDemo');
  const pauseDemoBtn = document.getElementById('pauseDemo');
  const nextStepNav = document.getElementById('nextStepNav');
  const prevStepNav = document.getElementById('prevStep');
  const closeDemoBtn = document.getElementById('closeDemo');
  const uploadArea = document.getElementById('uploadArea');
  const timelineDots = document.querySelectorAll('.timeline-dot');

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

  // Navigation arrows
  if (nextStepNav) {
    nextStepNav.addEventListener('click', () => {
      if (!isPlaying) {
        nextStep();
      }
    });
  }

  if (prevStepNav) {
    prevStepNav.addEventListener('click', () => {
      if (!isPlaying) {
        prevStep();
      }
    });
  }

  // Timeline dots
  timelineDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (!isPlaying) {
        goToStep(index + 1);
      }
    });
  });

  // Pause button
  if (pauseDemoBtn) {
    pauseDemoBtn.addEventListener('click', () => {
      pauseDemo();
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

  // Upload area is read-only for demo - no file input needed

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (demoModal && demoModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeDemo();
      } else if (e.key === 'ArrowRight' && !isPlaying) {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft' && !isPlaying) {
        e.preventDefault();
        prevStep();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (isPlaying) {
          pauseDemo();
        } else {
          startDemo();
        }
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
  pauseDemo();
  currentStep = 0;
  
  // Reset all steps
  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step${i}`);
    if (step) {
      step.classList.remove('active', 'prev');
    }
  }

  // Show step 1
  goToStep(1);

  // Reset upload
  const uploadedFile = document.getElementById('uploadedFile');
  const uploadArea = document.getElementById('uploadArea');
  if (uploadedFile) {
    uploadedFile.style.display = 'none';
  }
  if (uploadArea) {
    uploadArea.style.display = 'block';
    uploadArea.style.opacity = '1';
    uploadArea.style.pointerEvents = 'none';
    uploadArea.classList.remove('uploading');
    const uploadText = uploadArea.querySelector('.upload-text');
    const uploadHint = uploadArea.querySelector('.upload-hint');
    if (uploadText) uploadText.textContent = 'Invoice Upload';
    if (uploadHint) uploadHint.textContent = 'Demo Mode - Simulated Upload';
  }

  // Reset extraction
  const extractedData = document.getElementById('extractedData');
  if (extractedData) extractedData.style.display = 'none';
  
  // Reset extraction items
  const extractionItems = document.querySelectorAll('.extraction-item');
  extractionItems.forEach(item => {
    const icon = item.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-spinner fa-spin';
      icon.style.color = '';
    }
  });

  // Reset approval
  const approvalResult = document.getElementById('approvalResult');
  if (approvalResult) approvalResult.style.display = 'none';

  // Reset payment
  const paymentSuccess = document.getElementById('paymentSuccess');
  if (paymentSuccess) paymentSuccess.style.display = 'none';

  // Reset buttons
  const startBtn = document.getElementById('startDemo');
  const pauseBtn = document.getElementById('pauseDemo');
  if (startBtn) {
    startBtn.style.display = 'inline-block';
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Demo';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';

  // Update timeline and progress
  updateTimeline();
  updateProgressBar();
  updateNavigation();
}

function startDemo() {
  const startBtn = document.getElementById('startDemo');
  const pauseBtn = document.getElementById('pauseDemo');
  
  // If already at step 1, start from beginning
  if (currentStep === 0 || currentStep === 1) {
    goToStep(1);
    handleFileUpload(null);
  }
  
  isPlaying = true;
  
  if (startBtn) {
    startBtn.style.display = 'none';
    startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
  }
  if (pauseBtn) pauseBtn.style.display = 'inline-block';

  // Auto-advance through all steps like a video
  autoPlayInterval = setInterval(() => {
    if (currentStep < totalSteps) {
      nextStep();
    } else {
      // Demo complete
      pauseDemo();
      const startBtn = document.getElementById('startDemo');
      if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart Demo';
        startBtn.style.display = 'inline-block';
      }
    }
  }, 5000); // 5 seconds per step for better viewing
}

function handleFileUpload(file) {
  const uploadArea = document.getElementById('uploadArea');
  const uploadedFile = document.getElementById('uploadedFile');
  const uploadProgress = document.getElementById('uploadProgress');
  
  // Simulate upload animation (read-only demo)
  if (uploadArea) {
    uploadArea.classList.add('uploading');
    
    // Show uploading state
    const uploadText = uploadArea.querySelector('.upload-text');
    const uploadHint = uploadArea.querySelector('.upload-hint');
    if (uploadText) uploadText.textContent = 'Uploading invoice...';
    if (uploadHint) uploadHint.textContent = 'Processing file...';
    
    // Show progress bar
    if (uploadProgress) {
      uploadProgress.style.display = 'block';
    }
  }
  
  // Show uploaded file after delay
  setTimeout(() => {
    if (uploadProgress) {
      uploadProgress.style.display = 'none';
    }
    if (uploadArea) {
      uploadArea.style.display = 'none';
    }
    
    if (uploadedFile) {
      uploadedFile.style.display = 'flex';
      uploadedFile.style.animation = 'fadeInUp 0.5s ease';
    }
  }, 2000);
}

function pauseDemo() {
  isPlaying = false;
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
  
  const startBtn = document.getElementById('startDemo');
  const pauseBtn = document.getElementById('pauseDemo');
  
  if (startBtn) {
    startBtn.style.display = 'inline-block';
    startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  
  // Hide all steps
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`step${i}`);
    if (stepEl) {
      stepEl.classList.remove('active', 'prev');
      if (i < step) {
        stepEl.classList.add('prev');
      }
    }
  }
  
  currentStep = step;
  
  // Show current step
  const currentStepEl = document.getElementById(`step${currentStep}`);
  if (currentStepEl) {
    currentStepEl.classList.add('active');
  }
  
  // Update timeline
  updateTimeline();
  
  // Update progress bar
  updateProgressBar();
  
  // Update navigation arrows
  updateNavigation();
  
  // Handle step-specific animations
  handleStepAnimations(step);
}

function nextStep() {
  if (currentStep < totalSteps) {
    goToStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

function updateTimeline() {
  const timelineDots = document.querySelectorAll('.timeline-dot');
  timelineDots.forEach((dot, index) => {
    const stepNum = index + 1;
    dot.classList.remove('active', 'completed');
    
    if (stepNum === currentStep) {
      dot.classList.add('active');
    } else if (stepNum < currentStep) {
      dot.classList.add('completed');
    }
  });
}

function updateProgressBar() {
  const progressBar = document.getElementById('demoProgressBar');
  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

function updateNavigation() {
  const prevBtn = document.getElementById('prevStep');
  const nextBtn = document.getElementById('nextStepNav');
  
  if (prevBtn) {
    prevBtn.disabled = currentStep === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentStep === totalSteps;
  }
}

function handleStepAnimations(step) {
  switch (step) {
    case 1:
      // Upload step - already handled by handleFileUpload
      break;
    case 2:
      // Extraction step - animate document fields and progress
      setTimeout(() => {
        const docFields = document.querySelectorAll('.doc-field');
        const extractionItems = document.querySelectorAll('.extraction-item');
        const extractionProgress = document.getElementById('extractionProgress');
        let progress = 0;
        
        // Animate progress bar
        const progressInterval = setInterval(() => {
          progress += 2;
          if (extractionProgress) {
            extractionProgress.style.width = `${progress}%`;
          }
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 50);
        
        // Animate each field extraction
        docFields.forEach((field, index) => {
          setTimeout(() => {
            field.classList.add('extracting');
            const item = document.querySelector(`.extraction-item[data-item="${field.dataset.field}"]`);
            if (item) {
              item.classList.add('processing');
              const status = item.querySelector('.item-status');
              if (status) {
                status.textContent = 'Processing...';
              }
            }
            
            setTimeout(() => {
              field.classList.remove('extracting');
              field.classList.add('extracted');
              if (item) {
                item.classList.remove('processing');
                item.classList.add('completed');
                const icon = item.querySelector('i');
                const status = item.querySelector('.item-status');
                if (icon) {
                  icon.className = 'fas fa-check-circle';
                }
                if (status) {
                  status.textContent = 'Extracted';
                }
              }
            }, 1000);
          }, index * 800);
        });
        
        // Show extracted data after all items are checked
        setTimeout(() => {
          showExtractedData();
        }, 4000);
      }, 500);
      break;
    case 3:
      // Approval step - animate checks sequentially
      setTimeout(() => {
        const approvalChecks = document.querySelectorAll('.approval-check');
        approvalChecks.forEach((check, index) => {
          setTimeout(() => {
            check.classList.add('processing');
            const icon = check.querySelector('i');
            const status = check.querySelector('.check-status');
            if (icon) {
              icon.className = 'fas fa-spinner fa-spin';
            }
            if (status) {
              status.textContent = 'Processing...';
            }
            
            // Animate progress bar
            const progressFill = check.querySelector('.check-progress-fill');
            if (progressFill) {
              setTimeout(() => {
                progressFill.style.width = '100%';
              }, 100);
            }
            
            setTimeout(() => {
              check.classList.remove('processing');
              check.classList.add('completed');
              if (icon) {
                icon.className = 'fas fa-check-circle';
              }
              if (status) {
                status.textContent = 'Verified';
              }
            }, 1200);
          }, index * 600);
        });
        
        setTimeout(() => {
          showApprovalResult();
        }, 3000);
      }, 500);
      break;
    case 4:
      // Payment step - animate flow
      setTimeout(() => {
        const paymentSteps = document.querySelectorAll('.payment-step');
        paymentSteps.forEach((step, index) => {
          setTimeout(() => {
            step.classList.add('active');
            const subtitle = step.querySelector('.step-subtitle');
            if (subtitle) {
              subtitle.textContent = subtitle.textContent.replace('...', '...');
            }
            
            setTimeout(() => {
              step.classList.remove('active');
              step.classList.add('completed');
              const icon = step.querySelector('.step-icon');
              if (icon) {
                icon.style.background = 'var(--success)';
                icon.style.color = 'white';
                icon.style.borderColor = 'var(--success)';
              }
              const subtitle = step.querySelector('.step-subtitle');
              if (subtitle) {
                subtitle.textContent = 'Completed';
                subtitle.style.color = 'var(--success)';
              }
            }, 2000);
          }, index * 1500);
        });
        
        setTimeout(() => {
          showPaymentSuccess();
        }, 6500);
      }, 500);
      break;
  }
}

function showExtractedData() {
  const extractedData = document.getElementById('extractedData');
  if (extractedData) {
    extractedData.style.display = 'block';
    extractedData.style.animation = 'fadeIn 0.5s ease';
  }
}

function showApprovalResult() {
  const approvalResult = document.getElementById('approvalResult');
  if (approvalResult) {
    approvalResult.style.display = 'block';
    approvalResult.style.animation = 'fadeIn 0.5s ease';
  }
}

function showPaymentSuccess() {
  const paymentSuccess = document.getElementById('paymentSuccess');
  const paymentVisual = document.querySelector('.payment-visual');
  
  // Hide payment flow and show success
  if (paymentVisual) {
    paymentVisual.style.display = 'none';
  }
  
  if (paymentSuccess) {
    paymentSuccess.style.display = 'block';
    paymentSuccess.style.animation = 'fadeIn 0.5s ease';
  }
  
  // Update all payment steps to show completed status
  const paymentSteps = document.querySelectorAll('.payment-step');
  paymentSteps.forEach((step) => {
    step.classList.add('completed');
    const subtitle = step.querySelector('.step-subtitle');
    if (subtitle) {
      subtitle.textContent = 'Completed';
      subtitle.style.color = 'var(--success)';
    }
  });
}

// Make functions available globally
window.openDemo = openDemo;
window.closeDemo = closeDemo;

