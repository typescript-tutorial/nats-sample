export const config = {
  port: 8084,
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  mongo: {
    uri: 'mongodb://localhost:27017',
    db: 'masterdata'
  },
  retries: {
    1: 10000,
    2: 15000,
    3: 25000,
  },
  nats: {
    opts: {
      servers: 'nats://localhost:4222'
    },
    subject: 'test'
  },
};

export const env = {
  sit: {
    log: {
      level: 'error'
    },
    mongo: {
      database: 'masterdata_sit',
    }
  },
  prd: {
    log: {
      level: 'error'
    }
  }
};
