import { Client, Msg } from 'ts-nats';
import { StringMap, toString } from './core';

export type Hanlde<T> = (data: T, attributes?: StringMap, raw?: Msg) => Promise<number>;
export class Subscriber<T> {
  constructor(public client: Client, public subject: string, public logError?: (msg: string) => void, public json?: boolean, public logInfo?: (msg: string) => void) {
    this.subject = subject;
    this.subscribe = this.subscribe.bind(this);
    this.get = this.get.bind(this);
    this.receive = this.receive.bind(this);
    this.read = this.read.bind(this);
    this.consume = this.consume.bind(this);
  }
  get(handle: Hanlde<T>) {
    return this.subscribe(handle);
  }
  receive(handle: Hanlde<T>) {
    return this.subscribe(handle);
  }
  read(handle: Hanlde<T>) {
    return this.subscribe(handle);
  }
  consume(handle: Hanlde<T>) {
    return this.subscribe(handle);
  }
  subscribe(handle: Hanlde<T>): void {
    this.client.subscribe(this.subject, (error, msg) => {
      if (error && this.logError) {
        this.logError('Fail to consume message ' + toString(error));
        return;
      }
      if (this.logInfo) {
        this.logInfo('Received : ' + toString(msg));
      }
      if (!msg.data) {
        throw new Error('message content is empty!');
      }
      const data = (this.json ? JSON.parse(msg.data) : msg.data);
      handle(data, undefined, msg);
    });
  }
}
export const Consumer = Subscriber;
export const Reader = Subscriber;
export const Receiver = Subscriber;
