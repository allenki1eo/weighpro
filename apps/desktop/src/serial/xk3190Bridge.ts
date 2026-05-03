import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import type { ScaleReading } from '@weighpro/core'
import { parseXK3190Line, isWeightStable } from '@weighpro/core'
import { EventEmitter } from 'events'

export class XK3190Bridge extends EventEmitter {
  private port: SerialPort | null = null
  private readings: ScaleReading[] = []
  private portPath: string
  private baudRate: number

  constructor(portPath: string, baudRate = 1200) {
    super()
    this.portPath = portPath
    this.baudRate = baudRate
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.port = new SerialPort(
        { path: this.portPath, baudRate: this.baudRate, dataBits: 8, stopBits: 1, parity: 'none' },
        (err) => { if (err) reject(err) else resolve() }
      )

      const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      parser.on('data', (line: string) => {
        const reading = parseXK3190Line(line)
        if (!reading) return

        this.readings = [...this.readings.slice(-30), reading]
        const stable = isWeightStable(this.readings)

        const enriched: ScaleReading = { ...reading, isStable: stable }
        this.emit('reading', enriched)
      })

      this.port.on('error', (err) => this.emit('error', err))
      this.port.on('close', () => this.emit('close'))
    })
  }

  disconnect(): void {
    this.port?.close()
    this.port = null
    this.readings = []
  }

  get isConnected(): boolean {
    return this.port?.isOpen ?? false
  }

  static async listPorts(): Promise<string[]> {
    const ports = await SerialPort.list()
    return ports.map((p) => p.path)
  }
}
