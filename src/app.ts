import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express, { json } from 'express';
import http from 'http';
import { connectToDb } from 'mongodb-extension';
import { config, env } from './config';
import { createContext, User } from './context';
import { connect } from './lib';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
app.use(json());

connectToDb(`${conf.mongo.uri}`, `${conf.mongo.db}`).then(async (db) => {
  connect(conf.nats.opts).then(client => {
    const ctx = createContext(db, client, conf);
    ctx.consume(ctx.handle);
    app.get('/health', ctx.health.check);
    app.patch('/log', ctx.log.config);
    app.post('/send', (req, res) => {
      const data = req.body as User;
      ctx.publish(data).then(r => res.json({ message: 'message was produced' }))
        .catch(err => res.json({ error: err }));
    });
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  });
});
