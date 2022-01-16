import {Request, Response} from 'express';//
import * as http from 'http'
import {check, HealthChecker} from 'express-ext';

export class HealthController {
  constructor(protected checkers: HealthChecker[]) {
    this.check = this.check.bind(this);
  }
  check(req: http.IncomingMessage, res: http.ServerResponse) {
    check(this.checkers).then(heath => {
      if (heath.status === 'UP') {
        // return res.status(200).json(heath).end();
        res.writeHead(200, {'Content-Type':"application/json"});
        res.write(JSON.stringify(heath));
        res.end();
      } else {
        res.writeHead(500,{'Content-Type':"application/json"});
        res.write(JSON.stringify(heath));
        res.end();
      }
    });
  }
}
