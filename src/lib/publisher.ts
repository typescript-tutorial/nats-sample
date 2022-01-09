import { Codec, JSONCodec } from 'nats';
import { Client } from 'ts-nats';
import { toString } from './core';

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
