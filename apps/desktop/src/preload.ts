import { contextBridge, ipcRenderer } from "electron";
import type { WeightReading } from "@weighpro/core";

contextBridge.exposeInMainWorld("weighproStation", {
  getLastReading: () => ipcRenderer.invoke("scale:get-last-reading") as Promise<WeightReading | null>,
  reconnectScale: () => ipcRenderer.invoke("scale:reconnect") as Promise<WeightReading | null>,
  onScaleReading: (callback: (reading: WeightReading) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, reading: WeightReading) => callback(reading);
    ipcRenderer.on("scale:reading", listener);
    return () => ipcRenderer.removeListener("scale:reading", listener);
  },
  onScaleError: (callback: (message: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, message: string) => callback(message);
    ipcRenderer.on("scale:error", listener);
    return () => ipcRenderer.removeListener("scale:error", listener);
  },
});
