import { HealthController, LogConfig, LogController } from 'express-ext';
import { JSONLogger, map } from 'logger-core';
import { Db } from 'mongodb';
import { MongoChecker, MongoInserter } from 'mongodb-extension';
import { Consume, createRetry, ErrorHandler, Handle, Handler, NumberMap, RetryWriter } from 'mq-one';
import { Client } from 'ts-nats';
import { Attributes, Validator } from 'xvalidators';
import { Config, NatsChecker, Publisher, Subscriber } from './lib';

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

export interface Conf {
  log: LogConfig;
  retries: NumberMap;
  nats: Config;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  publish: (data: User) => Promise<void>;
  consume: Consume<User>;
  handle: Handle<User>;
}
export function createContext(db: Db, client: Client, conf: Conf): ApplicationContext {
  const retries = createRetry(conf.retries);
  const logger = new JSONLogger(conf.log.level, conf.log.map);
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
  return { health, log, handle: handler.handle, publish: publisher.publish, consume: subscriber.subscribe };
}
export function writeUser(msg: User): Promise<number> {
  console.log('Error: ' + JSON.stringify(msg));
  return Promise.resolve(1);
}
