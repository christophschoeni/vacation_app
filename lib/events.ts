type EventListener = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: { [key: string]: EventListener[] } = {};

  on(event: string, listener: EventListener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: EventListener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

export const appEvents = new SimpleEventEmitter();

export const EVENTS = {
  SAVE_VACATION: 'save_vacation',
} as const;