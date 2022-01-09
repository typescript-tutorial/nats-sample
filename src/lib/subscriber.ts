import { connect, Msg, MsgHdrs, NatsConnection, StringCodec } from 'nats';
import { Config, StringMap } from './core';

export type Hanlde<T> = (data: T, attributes?: StringMap, raw?: Msg) => Promise<number>;

export function createSubscriber<T>(c: Config, logError?: (msg: any) => void, json?: boolean, logInfo?: (msg: any) => void): Promise<Subscriber<T>> {
  return connect(c.opts).then(client => {
    return new Subscriber<T>(client, c.subject, logError, json, logInfo);
  });
}
export const createConsumer = createSubscriber;
export const createReader = createSubscriber;
export const createReceiver = createSubscriber;
export class Subscriber<T> {
  constructor(public client: NatsConnection, public subject: string, public logError?: (msg: string) => void, public json?: boolean, public logInfo?: (msg: string) => void) {
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
    const sc = StringCodec();
    const sub = this.client.subscribe(this.subject);
    (async () => {
      for await (const msg of sub) {
        const s = sc.decode(msg.data);
        console.log(`[${sub.getProcessed()}]: ${s}`);
        const data = (this.json ? JSON.parse(s) : s);
        handle(data, mapHeaders(msg.headers), msg);
      }
      if (this.logInfo) {
        this.logInfo('subscription closed');
      }
    })();
  }
}
export const Consumer = Subscriber;
export const Reader = Subscriber;
export const Receiver = Subscriber;
export function mapHeaders(hdr?: MsgHdrs): StringMap|undefined {
  if (hdr) {
    const r: StringMap = {};
    const keys = hdr.keys();
    let i = 0;
    for (const k of keys) {
      i = i + 1;
      const obj = hdr.get(k);
      r[k] = obj;
    }
    if (i === 0) {
      return undefined;
    } else {
      return r;
    }
  } else {
    return undefined;
  }
}
