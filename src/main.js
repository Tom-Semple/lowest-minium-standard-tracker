const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize the data store
const store = new Store({
  schema: {
    activities: {
      type: 'object',
      default: {}
    },
    streakStartDate: {
      type: 'string',
      default: ''
    },
    userName: {
      type: 'string',
      default: 'User'
    }
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'X Activity Tracker',
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Open DevTools in development
  // Comment this out for production
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for data operations
ipcMain.handle('get-activities', () => {
  return store.get('activities');
});

ipcMain.handle('get-user-name', () => {
  return store.get('userName');
});

ipcMain.handle('set-user-name', (event, name) => {
  store.set('userName', name);
  return name;
});

ipcMain.handle('add-activity', () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const activities = store.get('activities');
  
  if (!activities[today]) {
    activities[today] = 0;
  }
  
  activities[today] += 1;
  store.set('activities', activities);
  
  return activities[today];
});

// Add a new handler to remove activities
ipcMain.handle('remove-activity', () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const activities = store.get('activities');
  
  if (activities[today] && activities[today] > 0) {
    activities[today] -= 1;
    store.set('activities', activities);
  }
  
  return activities[today] || 0;
});

ipcMain.handle('get-streak-info', () => {
  const activities = store.get('activities');
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate current streak
  let currentStreak = 0;
  let hasFireStatus = false;
  
  // Check if today has at least 10 activities
  const hasCompletedToday = activities[today] >= 10;
  
  // Calculate streak by checking consecutive days backwards
  let checkDate = new Date();
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const count = activities[dateStr] || 0;
    
    if (count >= 10) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Fire status is achieved after 10 days of streak
  hasFireStatus = currentStreak >= 10;
  
  return {
    currentStreak,
    hasFireStatus,
    hasCompletedToday
  };
});

// Add a handler to clear the database
ipcMain.handle('clear-database', () => {
  store.clear();
  // Reinitialize with defaults
  store.set('activities', {});
  store.set('streakStartDate', '');
  store.set('userName', 'User');
  return true;
}); 