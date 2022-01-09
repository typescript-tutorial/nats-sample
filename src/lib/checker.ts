import { connect, ConnectionOptions } from 'nats';

export interface AnyMap {
  [key: string]: any;
}
export interface HealhChecker {
  name(): string;
  build(data: AnyMap, err: any): AnyMap;
  check(): Promise<AnyMap>;
}
export class NatsChecker implements HealhChecker {
  timeout: number;
  service: string;
  constructor(public opts: ConnectionOptions, service?: string, timeout?: number) {
    this.timeout = (timeout ? timeout : 4200);
    this.service = (service && service.length > 0 ? service : 'nats');
    this.check = this.check.bind(this);
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
  }
  check(): Promise<AnyMap> {
    const obj = {} as AnyMap;
    const promise: Promise<AnyMap> = connect(this.opts).then(conn => obj);
    if (this.timeout > 0) {
      return promiseTimeOut(this.timeout, promise);
    } else {
      return promise;
    }
  }
  name(): string {
    return this.service;
  }
  build(data: AnyMap, err: any): AnyMap {
    if (err) {
      if (!data) {
        data = {} as AnyMap;
      }
      data.error = err;
    }
    return data;
  }
}
function promiseTimeOut(timeoutInMilliseconds: number, promise: Promise<any>): Promise<any> {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(`Time out in: ${timeoutInMilliseconds} milliseconds!`);
      }, timeoutInMilliseconds);
    })
  ]);
}
