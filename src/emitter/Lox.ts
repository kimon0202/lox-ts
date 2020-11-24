import { EventEmitter } from 'events';

export type ErrorListener = (message: string) => void;

class LoxEvents extends EventEmitter {
  public onError(listener: ErrorListener): void {
    this.on('error', listener);
  }
}

export default new LoxEvents();
