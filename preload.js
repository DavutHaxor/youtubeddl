window.addEventListener('DOMContentLoaded', () => {
    const { contextBridge, ipcRenderer } = require('electron');
    try {
      contextBridge.exposeInMainWorld('electron', {
        require: require,
        ipcRenderer: ipcRenderer,
        sendSignal: () => ipcRenderer.send("path:get"),
        sendMinimizeSignal: () => ipcRenderer.send("minimize"),
        sendCloseSignal: () => ipcRenderer.send("close"),
        moveTo: () => ipcRenderer.send("move"),
      });
    } catch (error) {
      console.error('Error in preload script:', error);
    }
    console.log('Preload script loaded');

  });
  