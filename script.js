// Global Variables
let hadithData = {};  // Will be populated from data/data.json
let currentStep = 1;
let totalSteps = 0;
let currentCategory = '';
let arabicFontSize = 1.8; // Default size in rem
let englishFontSize = 1.0; // Default size in rem
let transliterationFontSize = 1.0; // Default size in rem
let showTransliteration = false; // Default transliteration setting
let showReferences = false; // Default reference setting
let isPortraitMode = window.innerHeight > window.innerWidth;

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
  const swipeThreshold = 50;
  const stepsContainer = document.getElementById('steps-container');

  stepsContainer.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  });

  stepsContainer.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > swipeThreshold) {
      deltaX > 0 ? previousStep() : nextStep();
    }
  });
}

// Show the main topics page
function showMainPage() {
  document.querySelector('.topics-grid').classList.remove('hidden');
  document.getElementById('hadith-options').classList.add('hidden');
  document.getElementById('hadith-detail').classList.add('hidden');
  
  // Show the header on main page
  document.querySelector('.header').style.display = 'block';
  
  // Remove background pattern if exists
  const pattern = document.querySelector('.background-pattern');
  if (pattern) pattern.remove();
}

// Show the options page for a selected category
function showHadithOptions(category) {
  const optionsGrid = document.querySelector('.hadith-options-grid');
  const optionsTitle = document.getElementById('options-title');

  optionsGrid.innerHTML = '';
  
  // Updated to include the new category
  optionsTitle.textContent = category === 'wudhu'
    ? 'Select a Wudhu Narration'
    : category === 'upon_waking'
    ? 'Select a Morning Supplication'
    : 'Select a Supplication';

  // Get appropriate icon for category - updated for new category
  const categoryIcon = category === 'wudhu' 
    ? '💧' 
    : category === 'upon_waking'
    ? '🌅'
    : '📜';

  // Add decorative background pattern
  const existingPattern = document.querySelector('.background-pattern');
  if (!existingPattern) {
    const patternContainer = document.createElement('div');
    patternContainer.className = 'background-pattern';
    document.getElementById('hadith-options').appendChild(patternContainer);
  }
  
  // Create cards with enhanced styling
  Object.entries(hadithData[category]).forEach(([id, data], index) => {
    // Get a custom icon based on the hadith/supplication title
    let cardIcon = getCardIcon(data.title);
    
    const card = document.createElement('div');
    card.className = 'hadith-option-card';
    card.style.animationDelay = `${index * 0.1}s`; // Stagger animation
    card.onclick = () => loadHadithDetail(id, category);
    
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.summary || ''}</p>
      <div class="card-icon">${cardIcon}</div>
    `;
    
    optionsGrid.appendChild(card);
  });

  // Hide the header
  document.querySelector('.header').style.display = 'none';
  
  document.querySelector('.topics-grid').classList.add('hidden');
  document.getElementById('hadith-options').classList.remove('hidden');
  document.getElementById('hadith-detail').classList.add('hidden');
  
  // Add subtle scroll indicator if there are many items
  if (Object.keys(hadithData[category]).length > 3) {
    addScrollIndicator();
  }
}

// Function to get appropriate icon based on title
function getCardIcon(title) {
  // Default icons - updated to include the upon_waking category
  const icons = {
    'default': '🤲',
    'wudhu': '💧',
    'prayer': '📿',
    'supplication': '📜',
    'confession': '🔄',
    'forgiveness': '✨',
    'blessing': '🌟',
    'mercy': '🌈',
    'protection': '🛡️',
    'upon_waking': '🌅'
  };
  
  // Check title for keywords
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('وضوء') || titleLower.includes('wudhu')) return icons['wudhu'];
  if (titleLower.includes('صلاة') || titleLower.includes('prayer')) return icons['prayer'];
  if (titleLower.includes('دعاء') || titleLower.includes('supplication')) return icons['supplication'];
  if (titleLower.includes('توبة') || titleLower.includes('confession')) return icons['confession'];
  if (titleLower.includes('مغفرة') || titleLower.includes('forgiveness')) return icons['forgiveness'];
  if (titleLower.includes('بركة') || titleLower.includes('blessing')) return icons['blessing'];
  if (titleLower.includes('رحمة') || titleLower.includes('mercy')) return icons['mercy'];
  if (titleLower.includes('حماية') || titleLower.includes('protection')) return icons['protection'];
  if (titleLower.includes('استيقاظ') || titleLower.includes('upon waking') || titleLower.includes('morning') || titleLower.includes('صباح')) return icons['upon_waking'];
  
  return icons['default'];
}

// Add a subtle scroll indicator if there are multiple items
function addScrollIndicator() {
  const existingIndicator = document.querySelector('.scroll-indicator');
  if (existingIndicator) existingIndicator.remove();
  
  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.innerHTML = '<div class="indicator-dot"></div>';
  
  document.getElementById('hadith-options').appendChild(indicator);
  
  // Hide indicator after scrolling
  const optionsGrid = document.querySelector('.hadith-options-grid');
  optionsGrid.addEventListener('scroll', () => {
    indicator.classList.add('hiding');
    setTimeout(() => {
      indicator.remove();
    }, 700);
  });
}

// Load and display the detailed view of a hadith/supplication
function loadHadithDetail(hadithId, category) {
  const hadith = hadithData[category][hadithId];
  const stepsContainer = document.getElementById('steps-container');

  stepsContainer.innerHTML = '';
  document.getElementById('hadith-title').textContent = hadith.title;

  // Simplify step UI for better mobile performance
  hadith.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'wudhu-step' + (index === 0 ? ' active' : '');
    stepDiv.setAttribute('data-step', index + 1);
    
    // Add structure with transliteration and reference section
    stepDiv.innerHTML = `
      <div class="step-number">${index + 1}</div>
      <div class="step-text">
        <p class="arabic">${step.arabic}</p>
        <p class="transliteration" style="display: ${showTransliteration ? 'block' : 'none'}">${step.transliteration || 'Transliteration not available'}</p>
        <p class="translation">${step.translation}</p>
        <div class="reference-container" style="display: ${showReferences ? 'block' : 'none'}">
          <a href="${step.reference || '#'}" target="_blank" class="reference-link">
            ${step.reference ? '📚 Source' : 'No reference available'}
          </a>
        </div>
      </div>
    `;
    stepsContainer.appendChild(stepDiv);
  });

  currentStep = 1;
  totalSteps = hadith.steps.length;
  updateProgress();
  updateButtonState();
  
  // Remove old settings container if exists
  const oldSettings = document.querySelector('.settings-container');
  if (oldSettings) {
    oldSettings.remove();
  }
  
  // Create settings button
  setupSettingsButton();

  // Hide the header
  document.querySelector('.header').style.display = 'none';
  
  document.querySelector('.topics-grid').classList.add('hidden');
  document.getElementById('hadith-options').classList.add('hidden');
  document.getElementById('hadith-detail').classList.remove('hidden');
  
  // Dynamic size adjustments
  updateNavigationUI();
  
  // Remove text controls if they exist
  const textControls = document.querySelector('.text-controls');
  if (textControls) {
    textControls.remove();
  }
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
      updateNavigationUI();
      vibrate();
      
      // Adjust content height after step change
      adjustContentHeight();
      
      // Reset scroll position in landscape mode
      if (!isPortraitMode) {
        document.getElementById('steps-container').scrollTop = 0;
      }
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
      updateNavigationUI();
      vibrate();
      
      // Adjust content height after step change
      adjustContentHeight();
      
      // Reset scroll position in landscape mode
      if (!isPortraitMode) {
        document.getElementById('steps-container').scrollTop = 0;
      }
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
  document.documentElement.style.setProperty('--transliteration-font-size', `${transliterationFontSize}rem`);
}

// Function to toggle transliteration
function toggleTransliteration() {
  showTransliteration = !showTransliteration;
  updateTransliterationDisplay();
  updateTransliterationSizeControlVisibility();
  vibrate();
  savePreferences();
}

// Function to toggle references
function toggleReferences() {
  showReferences = !showReferences;
  updateReferenceDisplay();
  vibrate();
  savePreferences();
}

// Update the display based on transliteration preference
function updateTransliterationDisplay() {
  const transliterationElements = document.querySelectorAll('.transliteration');
  
  transliterationElements.forEach(element => {
    element.style.display = showTransliteration ? 'block' : 'none';
  });
  
  // Update the toggle switch appearance
  const translitToggle = document.getElementById('transliteration-toggle');
  if (translitToggle) {
    translitToggle.checked = showTransliteration;
  }
}

// Update the display based on reference preference
function updateReferenceDisplay() {
  const referenceContainers = document.querySelectorAll('.reference-container');
  
  referenceContainers.forEach(container => {
    container.style.display = showReferences ? 'block' : 'none';
  });
  
  // Update the toggle switch appearance
  const referencesToggle = document.getElementById('references-toggle');
  if (referencesToggle) {
    referencesToggle.checked = showReferences;
  }
}

// Add a new function to update transliteration size control visibility
function updateTransliterationSizeControlVisibility() {
  const translitSizeControl = document.querySelector('.transliteration-font-control');
  if (translitSizeControl) {
    translitSizeControl.style.display = showTransliteration ? 'flex' : 'none';
  }
}

// Save preferences to localStorage
function savePreferences() {
  localStorage.setItem('arabicFontSize', arabicFontSize);
  localStorage.setItem('englishFontSize', englishFontSize);
  localStorage.setItem('transliterationFontSize', transliterationFontSize);
  localStorage.setItem('showTransliteration', showTransliteration);
  localStorage.setItem('showReferences', showReferences);
}

// Load preferences from localStorage
function loadPreferences() {
  const savedArabicSize = localStorage.getItem('arabicFontSize');
  const savedEnglishSize = localStorage.getItem('englishFontSize');
  const savedTransliterationSize = localStorage.getItem('transliterationFontSize');
  const savedTransliteration = localStorage.getItem('showTransliteration');
  const savedReferences = localStorage.getItem('showReferences');
  
  if (savedArabicSize) {
    arabicFontSize = parseFloat(savedArabicSize);
  }
  
  if (savedEnglishSize) {
    englishFontSize = parseFloat(savedEnglishSize);
  }
  
  if (savedTransliterationSize) {
    transliterationFontSize = parseFloat(savedTransliterationSize);
  }
  
  if (savedTransliteration !== null) {
    showTransliteration = savedTransliteration === 'true';
  }
  
  if (savedReferences !== null) {
    showReferences = savedReferences === 'true';
  }
  
  updateFontSizes();
}

// Create side navigation in each wudhu step based on device orientation
function createSideNavigation() {
  // Only add side navigation in landscape mode
  if (isPortraitMode) {
    return; // Skip creating side navigation in portrait mode
  }
  
  // Add side navigation to each active step
  const activeStep = document.querySelector('.wudhu-step.active');
  if (!activeStep) return;
  
  // Remove any existing side navigation
  const existingNav = activeStep.querySelector('.side-navigation');
  if (existingNav) {
    existingNav.remove();
  }
  
  // Create new side navigation
  const sideNav = document.createElement('div');
  sideNav.className = 'side-navigation';
  
  // Previous arrow
  const prevArrow = document.createElement('div');
  prevArrow.className = `nav-arrow prev-arrow ${currentStep === 1 ? 'disabled' : ''}`;
  prevArrow.innerHTML = '<div class="arrow-icon">&#10094;</div>';
  prevArrow.addEventListener('click', function() {
    if (currentStep > 1) {
      previousStep();
    }
  });
  
  // Next arrow
  const nextArrow = document.createElement('div');
  nextArrow.className = `nav-arrow next-arrow ${currentStep === totalSteps ? 'disabled' : ''}`;
  nextArrow.innerHTML = '<div class="arrow-icon">&#10095;</div>';
  nextArrow.addEventListener('click', function() {
    if (currentStep < totalSteps) {
      nextStep();
    }
  });
  
  sideNav.appendChild(prevArrow);
  sideNav.appendChild(nextArrow);
  activeStep.appendChild(sideNav);
}

// Dynamically adjust content height
function adjustContentHeight() {
  // Get all relevant elements
  const detailSection = document.getElementById('hadith-detail');
  const stepsContainer = document.getElementById('steps-container');
  const sectionHeader = document.querySelector('.section-header');
  const progressBar = document.querySelector('.progress-bar');
  const navControls = document.querySelector('.navigation-controls');
  
  if (!detailSection.classList.contains('hidden')) {
    // For landscape orientation
    if (!isPortraitMode) {
      // Calculate available height
      const viewportHeight = window.innerHeight;
      const headerHeight = sectionHeader ? sectionHeader.offsetHeight : 0;
      const progressHeight = progressBar ? progressBar.offsetHeight : 0;
      
      // Always enable scrolling in landscape mode
      const availableHeight = viewportHeight - headerHeight - progressHeight - 30;
      stepsContainer.style.height = `${availableHeight}px`;
      stepsContainer.style.overflow = 'auto';
      
      // Ensure active step is visible
      const activeStep = document.querySelector('.wudhu-step.active');
      if (activeStep) {
        // Force step to be relatively positioned for proper scrolling
        activeStep.style.position = 'relative';
        activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // For portrait mode, handle bottom navigation
      if (navControls) {
        const navHeight = navControls.offsetHeight;
        // Add padding to ensure content isn't hidden behind nav
        stepsContainer.style.paddingBottom = `${navHeight + 10}px`;
      }
      
      // Revert to auto height in portrait
      stepsContainer.style.height = 'auto';
      stepsContainer.style.minHeight = 'auto';
      stepsContainer.style.overflow = 'visible';
    }
  }
}

// Update navigation UI based on orientation
function updateNavigationUI() {
  // First get current orientation
  isPortraitMode = window.innerHeight > window.innerWidth;
  
  // Update body class for CSS styles
  document.body.classList.toggle('landscape-mode', !isPortraitMode);
  
  // Show or hide bottom navigation controls
  const navControls = document.querySelector('.navigation-controls');
  if (navControls) {
    navControls.style.display = isPortraitMode ? 'flex' : 'none';
  }
  
  // Calculate and set content height
  adjustContentHeight();
  
  // Handle side navigation
  if (isPortraitMode) {
    // In portrait mode, remove any existing side navigation
    document.querySelectorAll('.side-navigation').forEach(nav => {
      nav.remove();
    });
  } else {
    // In landscape mode, add side navigation
    createSideNavigation();
  }
}

// Detect orientation changes to optimize UI for landscape/portrait
function handleOrientationChange() {
  // Wait for browser to complete orientation change
  setTimeout(() => {
    updateNavigationUI();
    
    // Reset scroll position
    const stepsContainer = document.getElementById('steps-container');
    if (stepsContainer) {
      stepsContainer.scrollTop = 0;
    }
    
    // Additional delay to ensure UI has updated
    setTimeout(adjustContentHeight, 150);
  }, 100);
}

// Function to create and set up the settings button
function setupSettingsButton() {
  // Create settings container
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'settings-container';
  
  // Create settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn';
  settingsBtn.innerHTML = '<div class="settings-icon">⚙</div>';
  settingsBtn.setAttribute('aria-label', 'Settings');
  
  // Create settings panel
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'settings-panel';
  
  // Create settings content
  settingsPanel.innerHTML = `
    <h3 class="settings-title">Text Settings</h3>
    <div class="font-control">
      <span>Arabic Size:</span>
      <div class="font-control-buttons">
        <button class="font-btn" id="arabic-decrease">-</button>
        <button class="font-btn" id="arabic-increase">+</button>
      </div>
    </div>
    <div class="font-control">
      <span>English Size:</span>
      <div class="font-control-buttons">
        <button class="font-btn" id="english-decrease">-</button>
        <button class="font-btn" id="english-increase">+</button>
      </div>
    </div>
    <div class="font-control transliteration-font-control" style="display: ${showTransliteration ? 'flex' : 'none'}">
      <span>Transliteration Size:</span>
      <div class="font-control-buttons">
        <button class="font-btn" id="transliteration-decrease">-</button>
        <button class="font-btn" id="transliteration-increase">+</button>
      </div>
    </div>
    <div class="toggle-control">
      <span>Show Transliteration:</span>
      <label class="toggle-switch">
        <input type="checkbox" id="transliteration-toggle" ${showTransliteration ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="toggle-control">
      <span>Show References:</span>
      <label class="toggle-switch">
        <input type="checkbox" id="references-toggle" ${showReferences ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    </div>
  `;
  
  // Add click event to toggle settings panel
  settingsBtn.addEventListener('click', function() {
    settingsPanel.classList.toggle('active');
    settingsBtn.classList.toggle('active');
  });
  
  // Close settings when clicking outside
  document.addEventListener('click', function(event) {
    if (!settingsContainer.contains(event.target) && settingsPanel.classList.contains('active')) {
      settingsPanel.classList.remove('active');
      settingsBtn.classList.remove('active');
    }
  });
  
  // Add elements to the DOM
  settingsContainer.appendChild(settingsPanel);
  settingsContainer.appendChild(settingsBtn);
  
  // Add settings to hadith detail section
  const hadithDetail = document.getElementById('hadith-detail');
  hadithDetail.appendChild(settingsContainer);
  
  // Re-bind font size control events (since we've created new buttons)
  document.getElementById('arabic-increase').addEventListener('click', () => {
    arabicFontSize = Math.min(arabicFontSize + 0.2, 3.0);
    updateFontSizes();
    vibrate();
    savePreferences();
  });
  
  document.getElementById('arabic-decrease').addEventListener('click', () => {
    arabicFontSize = Math.max(arabicFontSize - 0.2, 1.0);
    updateFontSizes();
    vibrate();
    savePreferences();
  });
  
  document.getElementById('english-increase').addEventListener('click', () => {
    englishFontSize = Math.min(englishFontSize + 0.1, 1.8);
    updateFontSizes();
    vibrate();
    savePreferences();
  });
  
  document.getElementById('english-decrease').addEventListener('click', () => {
    englishFontSize = Math.max(englishFontSize - 0.1, 0.8);
    updateFontSizes();
    vibrate();
    savePreferences();
  });
  
  // Add transliteration size control events
  if (document.getElementById('transliteration-increase')) {
    document.getElementById('transliteration-increase').addEventListener('click', () => {
      transliterationFontSize = Math.min(transliterationFontSize + 0.1, 1.8);
      updateFontSizes();
      vibrate();
      savePreferences();
    });
  }
  
  if (document.getElementById('transliteration-decrease')) {
    document.getElementById('transliteration-decrease').addEventListener('click', () => {
      transliterationFontSize = Math.max(transliterationFontSize - 0.1, 0.8);
      updateFontSizes();
      vibrate();
      savePreferences();
    });
  }
  
  // Add transliteration toggle event
  document.getElementById('transliteration-toggle').addEventListener('change', toggleTransliteration);
  
  // Add references toggle event
  document.getElementById('references-toggle').addEventListener('change', toggleReferences);
}

// Initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadHadithData();
  setupSwipeGestures();
  loadPreferences();
  
  // Initial orientation detection
  isPortraitMode = window.innerHeight > window.innerWidth;
  document.body.classList.toggle('landscape-mode', !isPortraitMode);
  
  // Add orientation change detection
  window.addEventListener('resize', function() {
    updateNavigationUI();
    adjustContentHeight();
  });
  
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Save preferences when user leaves the page
  window.addEventListener('beforeunload', savePreferences);
});

// For backward compatibility, rename functions
function loadFontPreferences() {
  loadPreferences();
}

function saveFontPreferences() {
  savePreferences();
}
