import { Client, connect as conn, NatsConnectionOptions } from 'ts-nats';

export interface StringMap {
  [key: string]: string;
}
export interface Config {
  opts: NatsConnectionOptions | string | number;
  subject: string;
}
export type NatsConfig = Config;
export function toString(m: any): string {
  return typeof m === 'string' ? m : JSON.stringify(m);
}
export function connect(uri: string): Promise<Client> {
  return conn({ servers: [uri] });
}
