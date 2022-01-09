import { Codec, connect, ConnectionOptions, headers, JSONCodec, MsgHdrs, NatsConnection, PublishOptions, StringCodec } from 'nats';
import { Config, StringMap, toString } from './core';

export function createPublisher<T>(c: Config, logError?: (msg: any) => void, logInfo?: (msg: any) => void): Promise<Publisher<T>> {
  return connect(c.opts).then(client => {
    return new Publisher<T>(client, c.subject, logError, logInfo);
  })
}
export const createProducer = createPublisher;
export const createSender = createPublisher;
export const createWriter = createPublisher;
export class Publisher<T> {
  constructor(public connection: NatsConnection, public subject: string, public logError?: (msg: any) => void, public logInfo?: (msg: any) => void) {
    this.jc = JSONCodec();
    this.sc = StringCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  jc: Codec<T>;
  sc: Codec<string>;
  send(data: T, attrs?: StringMap): Promise<void> {
    return this.publish(data, attrs);
  }
  put(data: T, attrs?: StringMap): Promise<void> {
    return this.publish(data, attrs);
  }
  write(data: T, attrs?: StringMap): Promise<void> {
    return this.publish(data, attrs);
  }
  produce(data: T, attrs?: StringMap): Promise<void> {
    return this.publish(data, attrs);
  }
  publish(data: T, attrs?: StringMap): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.logInfo) {
        this.logInfo('Produce send data : ' + toString(data));
      }
      try {
        const d = (typeof data === 'string' ? this.sc.encode(data) : this.jc.encode(data));
        this.connection.publish(this.subject, d, createPublishOptions(attrs));
        resolve();
      } catch (e) {
        if (this.logError) {
          this.logError('Error nats: ' + toString(e));
        }
        reject(e);
      }
    });
  }
}
export const Producer = Publisher;
export const Sender = Publisher;
export const Writer = Publisher;

export function createSimplePublisher<T>(opts: ConnectionOptions, logError?: (msg: any) => void, logInfo?: (msg: any) => void): Promise<SimplePublisher<T>> {
  return connect(opts).then(client => {
    return new SimplePublisher<T>(client, logError, logInfo);
  })
}
export const createSimpleProducer = createSimplePublisher;
export const createSimpleSender = createSimplePublisher;
export const createSimpleWriter = createSimplePublisher;
// tslint:disable-next-line:max-classes-per-file
export class SimplePublisher<T> {
  constructor(public connection: NatsConnection, public logError?: (msg: any) => void, public logInfo?: (msg: any) => void) {
    this.jc = JSONCodec();
    this.sc = StringCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  jc: Codec<T>;
  sc: Codec<string>;
  send(subject: string, data: T, attrs?: StringMap): Promise<void> {
    return this.publish(subject, data, attrs);
  }
  put(subject: string, data: T, attrs?: StringMap): Promise<void> {
    return this.publish(subject, data, attrs);
  }
  write(subject: string, data: T, attrs?: StringMap): Promise<void> {
    return this.publish(subject, data, attrs);
  }
  produce(subject: string, data: T, attrs?: StringMap): Promise<void> {
    return this.publish(subject, data, attrs);
  }
  publish(subject: string, data: T, attrs?: StringMap): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.logInfo) {
        this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        const d = (typeof data === 'string' ? this.sc.encode(data) : this.jc.encode(data));
        this.connection.publish(subject, d, createPublishOptions(attrs));
        resolve();
      } catch (e) {
        if (this.logError) {
          this.logError('Error nats: ' + toString(e));
        }
        reject(e);
      }
    });
  }
}
export const SimpleProducer = SimplePublisher;
export const SimpleSender = SimplePublisher;
export const SimpleWriter = SimplePublisher;
export function createHeader(m?: StringMap): MsgHdrs|undefined {
  if (m) {
    const h = headers();
    const keys = Object.keys(m);
    let i = 0;
    for (const k of keys) {
      i = i + 1;
      h.append(k, m[k]);
    }
    if (i === 0) {
      return undefined;
    } else {
      return h;
    }
  } else {
    return undefined;
  }
}
export function createPublishOptions(m?: StringMap): PublishOptions|undefined {
  if (m) {
    const h = createHeader(m);
    if (h) {
      return {headers: h};
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}
