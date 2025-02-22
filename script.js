// Global Variables
let hadithData = {};  // Will be populated from data/data.json
let currentStep = 1;
let totalSteps = 0;
let currentCategory = '';

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

  document.querySelector('.topics-grid').classList.add('hidden');
  document.getElementById('hadith-options').classList.add('hidden');
  document.getElementById('hadith-detail').classList.remove('hidden');
}

// Navigation functions
function nextStep() {
  if (currentStep < totalSteps) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    currentStep++;
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
    updateProgress();
    updateButtonState();
    vibrate();
  }
}

function previousStep() {
  if (currentStep > 1) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    currentStep--;
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
    updateProgress();
    updateButtonState();
    vibrate();
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

// Initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadHadithData();
  setupSwipeGestures();
});