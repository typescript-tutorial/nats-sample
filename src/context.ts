import { HealthController } from 'express-ext';
import { Db } from 'mongodb';
import { MongoInserter, StringMap } from 'mongodb-extension';
import { ErrorHandler, Handler, RetryService, RetryWriter } from 'mq-one';
import { Client } from 'ts-nats';
import { Attributes, Validator } from 'validator-x';
import { Config, NatsChecker, Publisher, Subscriber } from './lib';

const retries = [5000, 10000, 20000];

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}

export const user: Attributes = {
  id: {
    length: 40
  },
  username: {
    required: true,
    length: 255
  },
  email: {
    format: 'email',
    required: true,
    length: 120
  },
  phone: {
    format: 'phone',
    required: true,
    length: 14
  },
  dateOfBirth: {
    type: 'datetime'
  }
};

export interface ApplicationContext {
  handle: (data: User, header?: StringMap) => Promise<number>;
  read: (handle: (data: User, header?: StringMap) => Promise<number>) => void;
  produce: (data: User) => Promise<void>;
  health: HealthController;
}

export function createContext(db: Db, client: Client, config: Config): ApplicationContext {
  const natsChecker = new NatsChecker({ servers: [config.uri] });
  const health = new HealthController([natsChecker]);
  const dbwriter = new MongoInserter(db.collection('user'), 'id');
  const retryWriter = new RetryWriter(dbwriter.write, retries, writeUser, log)
  const errorHandler = new ErrorHandler(log);
  const validator = new Validator<User>(user, true);
  const subscriber = new Subscriber<User>(client, config.subject);
  const publisher = new Publisher<User>(client, config.subject)
  const retryService = new RetryService<User, void>(publisher.publish, log, log);
  const handler = new Handler<User, void>(retryWriter.write, validator.validate, retries, errorHandler.error, log, log, retryService.retry, 3, 'retry');
  const ctx: ApplicationContext = { handle: handler.handle, read: subscriber.subscribe, health, produce: publisher.publish };
  return ctx;
}

export function log(msg: any): void {
  console.log(JSON.stringify(msg));
}

export function writeUser(msg: User): Promise<number> {
  console.log('Error: ' + JSON.stringify(msg));
  return Promise.resolve(1);
}
