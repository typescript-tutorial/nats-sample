import { ConnectionOptions } from 'nats';

export interface StringMap {
  [key: string]: string;
}
export interface Config {
  opts: ConnectionOptions;
  subject: string;
}
export type NatsConfig = Config;
export function toString(m: any): string {
  return typeof m === 'string' ? m : JSON.stringify(m);
}
