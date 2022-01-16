import { merge } from 'config-plus';
import dotenv from 'dotenv';
import http from 'http';
import { getBody } from './lib';
import { connectToDb } from 'mongodb-extension';
import { connect } from 'nats';
import { config, env } from './config';
import { createContext, User } from './context';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

connectToDb(`${conf.mongo.uri}`, `${conf.mongo.db}`).then(db => {
  connect(conf.nats.opts).then(client => {
    const ctx = createContext(db, client, conf);
    ctx.subscribe(ctx.handle);
    http.createServer(async (req, res) => {
      if (req.url === '/health') {
        ctx.health.check(req, res);
      } else if (req.url === '/log') {
        ctx.log.config(req, res);
      } else if (req.url === '/send') {
        var body = await getBody(req);
        try {
          await ctx.publish(JSON.parse(body) as User);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(JSON.stringify({message:"message was produced"}));
        }catch(err) {
          res.writeHead(500, {"Content-Type": "application/json"});
          res.end(JSON.stringify({error:err}));
        };
      }
    }).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  }).catch(err => console.error('Error ' + JSON.stringify(err)));
});


