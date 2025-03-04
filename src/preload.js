const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functions to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getActivities: () => ipcRenderer.invoke('get-activities'),
  getUserName: () => ipcRenderer.invoke('get-user-name'),
  setUserName: (name) => ipcRenderer.invoke('set-user-name', name),
  addActivity: () => ipcRenderer.invoke('add-activity'),
  removeActivity: () => ipcRenderer.invoke('remove-activity'),
  getStreakInfo: () => ipcRenderer.invoke('get-streak-info'),
  clearDatabase: () => ipcRenderer.invoke('clear-database')
}); 