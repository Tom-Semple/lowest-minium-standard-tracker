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
const FUTURE_DAYS = 10; // Days to show in the future

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

// Generate the calendar view - showing all past days plus future days
async function generateCalendar() {
  const activities = await window.electronAPI.getActivities();
  
  // Clear the calendar
  calendarElement.innerHTML = '';
  
  const today = new Date();
  
  // Use a reasonable start date - 1 year ago
  const startDate = new Date();
  startDate.setFullYear(today.getFullYear() - 1);
  
  const endDate = new Date();
  endDate.setDate(today.getDate() + FUTURE_DAYS); // 10 days into the future
  
  // Calculate total days to show
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Create an array of all dates to display
  const dates = [];
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    dates.push(date);
  }
  
  // Group dates by month and year
  const groupedDates = {};
  dates.forEach(date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!groupedDates[key]) {
      groupedDates[key] = {
        year,
        month,
        dates: []
      };
    }
    
    groupedDates[key].dates.push(date);
  });
  
  // Sort keys by year and month (descending)
  const sortedKeys = Object.keys(groupedDates).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    
    if (yearA !== yearB) {
      return yearB - yearA; // Most recent year first
    }
    return monthB - monthA; // Most recent month first
  });
  
  // Create month sections
  for (const key of sortedKeys) {
    const { year, month, dates } = groupedDates[key];
    
    // Create month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.textContent = `${monthNames[month]} ${year}`;
    calendarElement.appendChild(monthHeader);
    
    // Create month container
    const monthContainer = document.createElement('div');
    monthContainer.className = 'month-container';
    calendarElement.appendChild(monthContainer);
    
    // Add days for this month
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      
      // Format the date: Day (e.g., 15)
      dayElement.textContent = date.getDate();
      
      // Mark completed days
      if (activities[dateStr] && activities[dateStr] >= GOAL_ACTIVITIES) {
        dayElement.classList.add('completed');
      }
      
      // Mark today
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      if (isToday) {
        dayElement.classList.add('today');
      }
      
      // Mark future days
      if (date > today) {
        dayElement.classList.add('future');
      }
      
      // Add activity count as a tooltip
      const count = activities[dateStr] || 0;
      dayElement.title = `${dateStr}: ${count} activities`;
      
      monthContainer.appendChild(dayElement);
    }
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