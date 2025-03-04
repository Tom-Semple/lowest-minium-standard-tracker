// DOM Elements
const activityCounter = document.getElementById('activity-counter');
const addActivityButton = document.getElementById('add-activity');
const removeActivityButton = document.getElementById('remove-activity');
const resetDbButton = document.getElementById('reset-db');
const progressBar = document.getElementById('progress-bar');
const streakCount = document.getElementById('streak-count');
const fireStatus = document.getElementById('fire-status');
const userNameElement = document.getElementById('user-name');
const editNameButton = document.getElementById('edit-name');
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const saveNameButton = document.getElementById('save-name');
const cancelNameButton = document.getElementById('cancel-name');
const calendarElement = document.getElementById('calendar');

// Constants
const GOAL_ACTIVITIES = 10;
const DAYS_TO_SHOW = 28; // Show 4 weeks of activity

// Initialize the app
async function initApp() {
  await loadUserName();
  await loadTodayActivities();
  await loadStreakInfo();
  generateCalendar();
}

// Load user name from storage
async function loadUserName() {
  const userName = await window.electronAPI.getUserName();
  userNameElement.textContent = userName;
}

// Load today's activities
async function loadTodayActivities() {
  const activities = await window.electronAPI.getActivities();
  const today = new Date().toISOString().split('T')[0];
  const todayCount = activities[today] || 0;
  
  updateActivityCounter(todayCount);
}

// Load streak information
async function loadStreakInfo() {
  const streakInfo = await window.electronAPI.getStreakInfo();
  
  streakCount.textContent = streakInfo.currentStreak;
  
  if (streakInfo.hasFireStatus) {
    fireStatus.classList.remove('hidden');
  } else {
    fireStatus.classList.add('hidden');
  }
}

// Update the activity counter and progress bar
function updateActivityCounter(count) {
  activityCounter.textContent = count;
  
  // Update progress bar
  const progressPercentage = Math.min((count / GOAL_ACTIVITIES) * 100, 100);
  progressBar.style.width = `${progressPercentage}%`;
  
  // Change color when goal is reached
  if (count >= GOAL_ACTIVITIES) {
    progressBar.style.backgroundColor = '#00ba7c'; // X's green color
  } else {
    progressBar.style.backgroundColor = '#1d9bf0'; // X's blue color
  }
}

// Generate the calendar view - showing a continuous timeline
async function generateCalendar() {
  const activities = await window.electronAPI.getActivities();
  
  // Clear the calendar
  calendarElement.innerHTML = '';
  
  // Generate a continuous timeline of days, starting from today and going back
  const today = new Date();
  
  // Create a grid of days
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    // Add the date number
    dayElement.textContent = date.getDate();
    
    // Mark completed days
    if (activities[dateStr] && activities[dateStr] >= GOAL_ACTIVITIES) {
      dayElement.classList.add('completed');
    }
    
    // Mark today
    if (i === 0) {
      dayElement.classList.add('today');
    }
    
    // Add activity count as a tooltip
    const count = activities[dateStr] || 0;
    dayElement.title = `${dateStr}: ${count} activities`;
    
    calendarElement.appendChild(dayElement);
  }
}

// Function to close the modal
function closeModal() {
  nameModal.classList.add('hidden');
  console.log('Modal closed');
}

// Event Listeners
addActivityButton.addEventListener('click', async () => {
  try {
    const newCount = await window.electronAPI.addActivity();
    updateActivityCounter(newCount);
    await loadStreakInfo();
    generateCalendar();
    console.log('Activity added successfully');
  } catch (error) {
    console.error('Error adding activity:', error);
  }
});

removeActivityButton.addEventListener('click', async () => {
  try {
    const newCount = await window.electronAPI.removeActivity();
    updateActivityCounter(newCount);
    await loadStreakInfo();
    generateCalendar();
    console.log('Activity removed successfully');
  } catch (error) {
    console.error('Error removing activity:', error);
  }
});

resetDbButton.addEventListener('click', async () => {
  try {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      await window.electronAPI.clearDatabase();
      await initApp();
      console.log('Database reset successfully');
    }
  } catch (error) {
    console.error('Error resetting database:', error);
  }
});

editNameButton.addEventListener('click', () => {
  try {
    nameInput.value = userNameElement.textContent;
    nameModal.classList.remove('hidden');
    console.log('Edit name modal opened');
  } catch (error) {
    console.error('Error opening edit name modal:', error);
  }
});

saveNameButton.addEventListener('click', async () => {
  try {
    const newName = nameInput.value.trim();
    if (newName) {
      await window.electronAPI.setUserName(newName);
      userNameElement.textContent = newName;
      closeModal();
    }
  } catch (error) {
    console.error('Error saving name:', error);
  }
});

cancelNameButton.addEventListener('click', closeModal);

// Close modal when clicking outside of modal content
nameModal.addEventListener('click', (event) => {
  if (event.target === nameModal) {
    closeModal();
  }
});

// Add keyboard event to close modal with Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !nameModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Call initApp immediately as well, in case DOMContentLoaded already fired
initApp(); 