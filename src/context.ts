import { HealthController, LogConfig, LogController } from 'express-ext';
import { createLogger, map } from 'logger-core';
import { Db } from 'mongodb';
import { MongoChecker, MongoInserter } from 'mongodb-extension';
import { createRetry, ErrorHandler, Handle, Handler, NumberMap, RetryWriter, Subscribe } from 'mq-one';
import { Client } from 'ts-nats';
import { Attributes, Validator } from 'xvalidators';
import { NatsChecker, NatsConfig, Publisher, Subscriber } from './lib';

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

export interface Config {
  log: LogConfig;
  retries: NumberMap;
  nats: NatsConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  publish: (user: User) => Promise<void>;
  subscribe: Subscribe<User>;
  handle: Handle<User>;
}
export function createContext(db: Db, client: Client, conf: Config): ApplicationContext {
  const retries = createRetry(conf.retries);
  const logger = createLogger(conf.log);
  const log = new LogController(logger, map);
  const mongoChecker = new MongoChecker(db);
  const natsChecker = new NatsChecker(conf.nats.opts);
  const health = new HealthController([mongoChecker, natsChecker]);
  const writer = new MongoInserter(db.collection('user'), 'id');
  const retryWriter = new RetryWriter(writer.write, retries, writeUser, logger.error)
  const errorHandler = new ErrorHandler(logger.error);
  const validator = new Validator<User>(user, true);
  const handler = new Handler<User, void>(retryWriter.write, validator.validate, retries, errorHandler.error, logger.error, logger.info);

  const subscriber = new Subscriber<User>(client, conf.nats.subject);
  const publisher = new Publisher<User>(client, conf.nats.subject)
  return { health, log, handle: handler.handle, publish: publisher.publish, subscribe: subscriber.subscribe };
}
export function writeUser(msg: User): Promise<number> {
  console.log('Error: ' + JSON.stringify(msg));
  return Promise.resolve(1);
}
