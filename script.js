// Global Variables
let hadithData = {};  // Will be populated from data/data.json
let currentStep = 1;
let totalSteps = 0;
let currentCategory = '';
let arabicFontSize = 1.8; // Default size in rem
let englishFontSize = 1.0; // Default size in rem
let useSwipeNavigation = true; // Default navigation mode

// Fetch the hadith data from the JSON file
function loadHadithData() {
  fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
      hadithData = data;
      setupTopicCards();
    })
    .catch(err => console.error("Error loading hadith data:", err));
}

// Set up click events for topic cards
function setupTopicCards() {
  document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', function() {
      currentCategory = this.dataset.category;
      if (hadithData[currentCategory]) {
        showHadithOptions(currentCategory);
      }
    });
  });
}

// Set up swipe gestures for navigating steps
function setupSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let initialX = 0;
  let initialY = 0;
  const swipeThreshold = 50;
  const stepsContainer = document.getElementById('steps-container');
  let currentSwipeElement = null;
  let swipeInProgress = false;

  const swipeHandler = function(e) {
    // Don't handle swipes if swipe navigation is disabled
    if (!useSwipeNavigation) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentSwipeElement = document.querySelector(`.wudhu-step[data-step="${currentStep}"]`);
    initialX = 0;
    swipeInProgress = true;
    
    // Add transition class for smooth movements during swipe
    if (currentSwipeElement) {
      currentSwipeElement.classList.add('swiping');
    }
    
    // Prevent default to avoid scrolling while swiping
    e.preventDefault();
  };

  const touchMoveHandler = function(e) {
    if (!useSwipeNavigation || !swipeInProgress || !currentSwipeElement) return;
    
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    
    // Only apply horizontal transform during swipe
    // Limit the swipe distance for better control
    const maxSwipe = window.innerWidth * 0.4; // 40% of screen width
    const limitedDelta = Math.max(Math.min(deltaX, maxSwipe), -maxSwipe);
    
    // Apply the transform to create a visual feedback during swipe
    currentSwipeElement.style.transform = `translateX(${limitedDelta}px)`;
    
    // Determine which other element to show (next or previous)
    if (deltaX < -20 && currentStep < totalSteps) {
      // Show a peek of the next element when swiping left
      const nextElement = document.querySelector(`.wudhu-step[data-step="${currentStep + 1}"]`);
      if (nextElement) {
        nextElement.classList.add('peek-next');
        nextElement.style.transform = `translateX(${window.innerWidth + limitedDelta}px)`;
      }
    } else if (deltaX > 20 && currentStep > 1) {
      // Show a peek of the previous element when swiping right
      const prevElement = document.querySelector(`.wudhu-step[data-step="${currentStep - 1}"]`);
      if (prevElement) {
        prevElement.classList.add('peek-prev');
        prevElement.style.transform = `translateX(${limitedDelta - window.innerWidth}px)`;
      }
    }
    
    // Prevent default to avoid scrolling during swipe
    e.preventDefault();
  };

  const touchEndHandler = function(e) {
    if (!useSwipeNavigation || !swipeInProgress || !currentSwipeElement) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    // Clean up any elements we were animating
    document.querySelectorAll('.peek-next, .peek-prev').forEach(el => {
      el.classList.remove('peek-next', 'peek-prev');
      el.style.transform = '';
    });
    
    // Reset the current element's transform
    currentSwipeElement.style.transform = '';
    currentSwipeElement.classList.remove('swiping');
    
    // If swipe is significant enough, navigate
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && currentStep > 1) {
        previousStep();
      } else if (deltaX < 0 && currentStep < totalSteps) {
        nextStep();
      }
    }
    
    swipeInProgress = false;
  };

  // Attach event handlers
  stepsContainer.addEventListener('touchstart', swipeHandler, { passive: false });
  stepsContainer.addEventListener('touchmove', touchMoveHandler, { passive: false });
  stepsContainer.addEventListener('touchend', touchEndHandler);
}

// Add visual indicators for swipe functionality
function addSwipeIndicators() {
  const detailSection = document.getElementById('hadith-detail');
  
  // Create swipe indicators container
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'swipe-indicators';
  
  // Left indicator
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'swipe-indicator left';
  leftIndicator.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>';
  
  // Right indicator
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'swipe-indicator right';
  rightIndicator.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';
  
  // Add indicators to container
  indicatorsContainer.appendChild(leftIndicator);
  indicatorsContainer.appendChild(rightIndicator);
  
  // Insert before navigation controls
  const navControls = detailSection.querySelector('.navigation-controls');
  detailSection.insertBefore(indicatorsContainer, navControls);
  
  // Update indicator states when step changes
  function updateIndicators() {
    leftIndicator.classList.toggle('disabled', currentStep <= 1);
    rightIndicator.classList.toggle('disabled', currentStep >= totalSteps);
  }
  
  // Initial update
  updateIndicators();
  
  // Add listeners to navigation events
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (mutation.target.classList.contains('active')) {
          updateIndicators();
        }
      }
    });
  });
  
  // Observe all step elements
  document.querySelectorAll('.wudhu-step').forEach(step => {
    observer.observe(step, { attributes: true });
  });
}

// Set up navigation mode toggle
function setupNavigationToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const navButtons = document.querySelector('.navigation-controls');
  const swipeIndicators = document.querySelector('.swipe-indicators');
  
  // Load saved preference
  const savedNavMode = localStorage.getItem('useSwipeNavigation');
  if (savedNavMode !== null) {
    useSwipeNavigation = savedNavMode === 'true';
    navToggle.checked = useSwipeNavigation;
  }
  
  // Update UI based on current setting
  updateNavigationMode();
  
  // Listen for changes
  navToggle.addEventListener('change', function() {
    useSwipeNavigation = this.checked;
    updateNavigationMode();
    localStorage.setItem('useSwipeNavigation', useSwipeNavigation);
    vibrate();
  });
  
  function updateNavigationMode() {
    if (useSwipeNavigation) {
      navButtons.classList.add('hidden');
      if (swipeIndicators) swipeIndicators.classList.remove('hidden');
    } else {
      navButtons.classList.remove('hidden');
      if (swipeIndicators) swipeIndicators.classList.add('hidden');
    }
  }
}

// Set up settings panel
function setupSettingsPanel() {
  const settingsBtn = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const closeBtn = document.getElementById('settings-close');
  const arabicSizeDisplay = document.getElementById('arabic-size-display');
  const englishSizeDisplay = document.getElementById('english-size-display');
  
  // Update size displays
  function updateSizeDisplays() {
    arabicSizeDisplay.textContent = arabicFontSize.toFixed(1);
    englishSizeDisplay.textContent = englishFontSize.toFixed(1);
  }
  
  // Initial update
  updateSizeDisplays();
  
  // Toggle settings panel
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
    updateSizeDisplays();
    vibrate();
  });
  
  // Close settings panel
  closeBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
    vibrate();
  });
  
  // Update displays when sizes change
  document.getElementById('arabic-increase').addEventListener('click', updateSizeDisplays);
  document.getElementById('arabic-decrease').addEventListener('click', updateSizeDisplays);
  document.getElementById('english-increase').addEventListener('click', updateSizeDisplays);
  document.getElementById('english-decrease').addEventListener('click', updateSizeDisplays);
  
  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
      settingsPanel.classList.remove('active');
    }
  });
}

// Show the main topics page
function showMainPage() {
  document.querySelector('.topics-grid').classList.remove('hidden');
  document.getElementById('hadith-options').classList.add('hidden');
  document.getElementById('hadith-detail').classList.add('hidden');
}

// Show the options page for a selected category
function showHadithOptions(category) {
  const optionsGrid = document.querySelector('.hadith-options-grid');
  const optionsTitle = document.getElementById('options-title');

  optionsGrid.innerHTML = '';
  optionsTitle.textContent = category === 'wudhu'
    ? 'Select a Wudhu Narration'
    : 'Select a Supplication';

  Object.entries(hadithData[category]).forEach(([id, data]) => {
    const card = document.createElement('div');
    card.className = 'hadith-option-card';
    card.onclick = () => loadHadithDetail(id, category);
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.summary ? `<p>${data.summary}</p>` : ''}</p>
    `;
    optionsGrid.appendChild(card);
  });

  document.querySelector('.topics-grid').classList.add('hidden');
  document.getElementById('hadith-options').classList.remove('hidden');
  document.getElementById('hadith-detail').classList.add('hidden');
}

// Load and display the detailed view of a hadith/supplication
function loadHadithDetail(hadithId, category) {
  const hadith = hadithData[category][hadithId];
  const stepsContainer = document.getElementById('steps-container');

  stepsContainer.innerHTML = '';
  document.getElementById('hadith-title').textContent = hadith.title;

  hadith.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'wudhu-step' + (index === 0 ? ' active' : '');
    stepDiv.setAttribute('data-step', index + 1);
    stepDiv.innerHTML = `
      <div class="step-number">${index + 1}</div>
      <div class="step-text">
        <p class="arabic">${step.arabic}</p>
        <p class="translation">${step.translation}</p>
      </div>
    `;
    stepsContainer.appendChild(stepDiv);
  });

  currentStep = 1;
  totalSteps = hadith.steps.length;
  updateProgress();
  updateButtonState();
  
  // Add swipe indicators after loading content
  if (document.querySelector('.swipe-indicators')) {
    document.querySelector('.swipe-indicators').remove();
  }
  addSwipeIndicators();
  setupNavigationToggle();

  document.querySelector('.topics-grid').classList.add('hidden');
  document.getElementById('hadith-options').classList.add('hidden');
  document.getElementById('hadith-detail').classList.remove('hidden');
}

// Navigation functions
function nextStep() {
  if (currentStep < totalSteps) {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    currentStepElement.classList.add('prev-step');
    currentStepElement.classList.remove('active');
    
    // Small delay for animations to be visible
    setTimeout(() => {
      currentStep++;
      document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
      updateProgress();
      updateButtonState();
      vibrate();
    }, 100);
  }
}

function previousStep() {
  if (currentStep > 1) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    
    // Small delay for animations to be visible
    setTimeout(() => {
      currentStep--;
      const prevStepElement = document.querySelector(`[data-step="${currentStep}"]`);
      prevStepElement.classList.remove('prev-step');
      prevStepElement.classList.add('active');
      updateProgress();
      updateButtonState();
      vibrate();
    }, 100);
  }
}

// Update the progress bar
function updateProgress() {
  const progressPercentage = (currentStep / totalSteps) * 100;
  document.querySelector('.progress').style.width = `${progressPercentage}%`;
}

// Enable/disable navigation buttons based on current step
function updateButtonState() {
  document.querySelector('.prev').disabled = currentStep === 1;
  document.querySelector('.next').disabled = currentStep === totalSteps;
}

// Trigger a short vibration (if supported)
function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// Update font sizes
function updateFontSizes() {
  document.documentElement.style.setProperty('--arabic-font-size', `${arabicFontSize}rem`);
  document.documentElement.style.setProperty('--english-font-size', `${englishFontSize}rem`);
}

// Function to set up font size controls
function setupFontControls() {
  // Initialize with default sizes
  updateFontSizes();
  
  // Arabic font size controls
  document.getElementById('arabic-increase').addEventListener('click', () => {
    arabicFontSize = Math.min(arabicFontSize + 0.2, 3.0); // Max size 3rem
    updateFontSizes();
    vibrate();
  });
  
  document.getElementById('arabic-decrease').addEventListener('click', () => {
    arabicFontSize = Math.max(arabicFontSize - 0.2, 1.0); // Min size 1rem
    updateFontSizes();
    vibrate();
  });
  
  // English font size controls
  document.getElementById('english-increase').addEventListener('click', () => {
    englishFontSize = Math.min(englishFontSize + 0.1, 1.8); // Max size 1.8rem
    updateFontSizes();
    vibrate();
  });
  
  document.getElementById('english-decrease').addEventListener('click', () => {
    englishFontSize = Math.max(englishFontSize - 0.1, 0.8); // Min size 0.8rem
    updateFontSizes();
    vibrate();
  });
}

// Save font size preferences to localStorage
function saveFontPreferences() {
  localStorage.setItem('arabicFontSize', arabicFontSize);
  localStorage.setItem('englishFontSize', englishFontSize);
}

// Load font size preferences from localStorage
function loadFontPreferences() {
  const savedArabicSize = localStorage.getItem('arabicFontSize');
  const savedEnglishSize = localStorage.getItem('englishFontSize');
  
  if (savedArabicSize) {
    arabicFontSize = parseFloat(savedArabicSize);
  }
  
  if (savedEnglishSize) {
    englishFontSize = parseFloat(savedEnglishSize);
  }
  
  updateFontSizes();
}

// Initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadHadithData();
  setupSwipeGestures();
  setupFontControls();
  loadFontPreferences();
  setupSettingsPanel();
  setupNavigationToggle();
  
  // Save preferences when user leaves the page
  window.addEventListener('beforeunload', () => {
    saveFontPreferences();
    localStorage.setItem('useSwipeNavigation', useSwipeNavigation);
  });
});