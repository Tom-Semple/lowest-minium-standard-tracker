// DOM Elements
const activityCounter = document.getElementById('activity-counter');
const addActivityButton = document.getElementById('add-activity');
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
    progressBar.style.backgroundColor = '#4cd964'; // Green
  } else {
    progressBar.style.backgroundColor = '#1da1f2'; // Blue
  }
}

// Generate the calendar view
async function generateCalendar() {
  const activities = await window.electronAPI.getActivities();
  const today = new Date();
  
  // Clear the calendar
  calendarElement.innerHTML = '';
  
  // Generate days for the current month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement('div');
    calendarElement.appendChild(emptyDay);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    // Mark completed days
    if (activities[dateStr] && activities[dateStr] >= GOAL_ACTIVITIES) {
      dayElement.classList.add('completed');
    }
    
    // Mark today
    if (day === today.getDate()) {
      dayElement.classList.add('today');
    }
    
    calendarElement.appendChild(dayElement);
  }
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
      nameModal.classList.add('hidden');
      console.log('Name saved successfully');
    }
  } catch (error) {
    console.error('Error saving name:', error);
  }
});

cancelNameButton.addEventListener('click', () => {
  try {
    nameModal.classList.add('hidden');
    console.log('Edit name modal closed');
  } catch (error) {
    console.error('Error closing edit name modal:', error);
  }
});

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Call initApp immediately as well, in case DOMContentLoaded already fired
initApp(); 