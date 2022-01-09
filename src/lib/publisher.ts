import { Codec, JSONCodec } from 'nats';
import { Client, connect, NatsConnectionOptions } from 'ts-nats';
import { Config, toString } from './core';

export function createPublisher<T>(c: Config, logError?: (msg: any) => void, logInfo?: (msg: any) => void): Promise<Publisher<T>> {
  return connect(c.opts).then(client => {
    return new Publisher<T>(client, c.subject, logError, logInfo);
  })
}
export const createProducer = createPublisher;
export const createSender = createPublisher;
export const createWriter = createPublisher;
export class Publisher<T> {
  constructor(public client: Client, public subject: string, public logError?: (msg: any) => void, public logInfo?: (msg: any) => void) {
    this.jc = JSONCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  jc: Codec<T>;
  send(data: T): Promise<void> {
    return this.publish(data);
  }
  put(data: T): Promise<void> {
    return this.publish(data);
  }
  write(data: T): Promise<void> {
    return this.publish(data);
  }
  produce(data: T): Promise<void> {
    return this.publish(data);
  }
  publish(data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.logInfo) {
        this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        this.client.publish(this.subject, this.jc.encode(data));
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

export function createSimplePublisher<T>(opts: NatsConnectionOptions, logError?: (msg: any) => void, logInfo?: (msg: any) => void): Promise<SimplePublisher<T>> {
  return connect(opts).then(client => {
    return new SimplePublisher<T>(client, logError, logInfo);
  })
}
export const createSimpleProducer = createSimplePublisher;
export const createSimpleSender = createSimplePublisher;
export const createSimpleWriter = createSimplePublisher;
// tslint:disable-next-line:max-classes-per-file
export class SimplePublisher<T> {
  constructor(public client: Client, public logError?: (msg: any) => void, public logInfo?: (msg: any) => void) {
    this.jc = JSONCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  jc: Codec<T>;
  send(subject: string, data: T): Promise<void> {
    return this.publish(subject, data);
  }
  put(subject: string, data: T): Promise<void> {
    return this.publish(subject, data);
  }
  write(subject: string, data: T): Promise<void> {
    return this.publish(subject, data);
  }
  produce(subject: string, data: T): Promise<void> {
    return this.publish(subject, data);
  }
  publish(subject: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.logInfo) {
        this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        this.client.publish(subject, this.jc.encode(data));
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
