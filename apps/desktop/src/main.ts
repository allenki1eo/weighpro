import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { XK3190Bridge } from './serial/xk3190Bridge.js'
import type { ScaleReading } from '@weighpro/core'

const WEB_URL = process.env.WEIGHPRO_WEB_URL ?? 'http://localhost:3000'
const SCALE_PORT = process.env.XK3190_SERIAL_PORT ?? 'COM3'
const SCALE_BAUD = parseInt(process.env.XK3190_BAUD_RATE ?? '1200', 10)

let mainWindow: BrowserWindow | null = null
let scaleBridge: XK3190Bridge | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Weighbridge OS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadURL(WEB_URL)
  mainWindow.on('closed', () => { mainWindow = null })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

async function startScale() {
  scaleBridge = new XK3190Bridge(SCALE_PORT, SCALE_BAUD)

  scaleBridge.on('reading', (reading: ScaleReading) => {
    mainWindow?.webContents.send('scale:reading', reading)
    // Also POST to web for browser clients
    const webUrl = WEB_URL.replace(/\/$/, '')
    fetch(`${webUrl}/api/scale/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-scale-token': process.env.SCALE_SECRET ?? 'dev-scale-secret' },
      body: JSON.stringify({ weightKg: reading.weightKg, isStable: reading.isStable, raw: reading.raw }),
    }).catch(() => { /* ignore network errors */ })
  })

  scaleBridge.on('error', (err: Error) => {
    console.error('Scale error:', err.message)
    mainWindow?.webContents.send('scale:error', err.message)
  })

  scaleBridge.on('close', () => {
    mainWindow?.webContents.send('scale:disconnected')
    // Retry after 5s
    setTimeout(startScale, 5000)
  })

  try {
    await scaleBridge.connect()
    console.log(`Scale connected on ${SCALE_PORT} at ${SCALE_BAUD} baud`)
    mainWindow?.webContents.send('scale:connected', { port: SCALE_PORT })
  } catch (err) {
    console.warn(`Could not connect to scale on ${SCALE_PORT}:`, (err as Error).message)
    mainWindow?.webContents.send('scale:error', `Could not connect to scale on ${SCALE_PORT}`)
  }
}

// IPC handlers
ipcMain.handle('scale:list-ports', async () => {
  return XK3190Bridge.listPorts()
})

ipcMain.handle('scale:reconnect', async (_event, portPath?: string, baudRate?: number) => {
  scaleBridge?.disconnect()
  scaleBridge = new XK3190Bridge(portPath ?? SCALE_PORT, baudRate ?? SCALE_BAUD)
  scaleBridge.on('reading', (r: ScaleReading) => mainWindow?.webContents.send('scale:reading', r))
  scaleBridge.on('error', (e: Error) => mainWindow?.webContents.send('scale:error', e.message))
  await scaleBridge.connect()
  return { ok: true }
})

ipcMain.handle('print:silent', async (_event, html: string) => {
  const printWin = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } })
  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  await new Promise<void>((res) => setTimeout(res, 500))
  printWin.webContents.print({ silent: true, printBackground: true }, () => {
    printWin.close()
  })
  return { ok: true }
})

app.whenReady().then(async () => {
  createWindow()
  await startScale()
})

app.on('window-all-closed', () => {
  scaleBridge?.disconnect()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
