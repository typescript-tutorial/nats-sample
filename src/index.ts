import dotenv from 'dotenv';
import express, { json } from 'express';
import http from 'http';
import { connectToDb } from 'mongodb-extension'
import { createContext, User } from './context';
import { Config, connect } from './lib';

dotenv.config();
const app = express();

const port = process.env.PORT;

const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.MONGO_DB;

const natsURI = process.env.NATSURI;
const natsSub = process.env.NATSSUB;

app.use(json());

connectToDb(`${mongoURI}`, `${mongoDB}`).then(async (db) => {
  const config: Config = {
    uri: String(natsURI),
    subject: String(natsSub),
  };
  const client = await connect(config.uri);
  const ctx = createContext(db, client, config);
  ctx.read(ctx.handle);
  const produce = ctx.produce;
  app.get('/health', ctx.health.check);
  if (produce) {
    app.post('/send', (req, res) => {
      const data = req.body as User;
      produce(data).then(r => res.json({ message: 'message was produce' }))
        .catch(err => res.json({ error: err }));
    });
  }
  http.createServer(app).listen(port, () => {
    console.log('Start server at port ' + port);
  });
});
// const natsConnection = new NatsConnection();
// const client = natsConnection.connect();
// // tslint:disable-next-line:no-console
// console.log(client);
