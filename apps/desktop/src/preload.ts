import { contextBridge, ipcRenderer } from 'electron'
import type { ScaleReading } from '@weighpro/core'

contextBridge.exposeInMainWorld('__weighpro', {
  // Scale
  onScaleReading: (cb: (reading: ScaleReading) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, reading: ScaleReading) => cb(reading)
    ipcRenderer.on('scale:reading', handler)
    return () => ipcRenderer.off('scale:reading', handler)
  },
  onScaleConnected: (cb: (info: { port: string }) => void) => {
    ipcRenderer.on('scale:connected', (_e, info) => cb(info))
  },
  onScaleDisconnected: (cb: () => void) => {
    ipcRenderer.on('scale:disconnected', cb)
  },
  onScaleError: (cb: (msg: string) => void) => {
    ipcRenderer.on('scale:error', (_e, msg) => cb(msg))
  },
  listPorts: (): Promise<string[]> => ipcRenderer.invoke('scale:list-ports'),
  reconnect: (port?: string, baud?: number): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('scale:reconnect', port, baud),

  // Print
  printSilent: (html: string): Promise<{ ok: boolean }> => ipcRenderer.invoke('print:silent', html),
})
