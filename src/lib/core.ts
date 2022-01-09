import { Client, connect as connect2, NatsConnectionOptions } from 'ts-nats';

export interface StringMap {
  [key: string]: string;
}
export interface Config {
  opts: NatsConnectionOptions | string | number;
  subject: string;
}
export function toString(m: any): string {
  return typeof m === 'string' ? m : JSON.stringify(m);
}
export function connect(uri: string): Promise<Client> {
  return connect2({ servers: [uri] });
}
