import { parseXk3190Frame, type WeightReading } from "@weighpro/core";
import { EventEmitter } from "node:events";
import { ReadlineParser, SerialPort } from "serialport";

interface BridgeOptions {
  path: string;
  baudRate: number;
}

interface BridgeEvents {
  reading: [WeightReading];
  error: [Error];
}

export interface Xk3190Bridge {
  lastReading: WeightReading | null;
  open: () => Promise<void>;
  close: () => void;
  reconnect: () => Promise<void>;
  on: <K extends keyof BridgeEvents>(event: K, listener: (...args: BridgeEvents[K]) => void) => EventEmitter;
}

export function createXk3190Bridge(options: BridgeOptions): Xk3190Bridge {
  const emitter = new EventEmitter();
  let port: SerialPort | undefined;
  let lastReading: WeightReading | null = null;

  function createPort() {
    port = new SerialPort({
      path: options.path,
      baudRate: options.baudRate,
      autoOpen: false,
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    parser.on("data", (frame: string) => {
      const reading = parseXk3190Frame(frame, {
        defaultUnit: "kg",
      });

      if (!reading) {
        return;
      }

      lastReading = reading;
      emitter.emit("reading", reading);
    });

    port.on("error", (error) => emitter.emit("error", error));
  }

  async function open() {
    if (!port) {
      createPort();
    }

    await new Promise<void>((resolve, reject) => {
      port?.open((error) => {
        if (error) {
          emitter.emit("error", error);
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  function close() {
    if (port?.isOpen) {
      port.close();
    }
  }

  async function reconnect() {
    close();
    port = undefined;
    await open();
  }

  return {
    get lastReading() {
      return lastReading;
    },
    open,
    close,
    reconnect,
    on: (event, listener) => emitter.on(event, listener),
  };
}
