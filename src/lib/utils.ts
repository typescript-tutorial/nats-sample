import http from 'http';

export function getBody(req: http.IncomingMessage): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        let body = "";
        // listen to data sent by client
        req.on("data", (chunk) => {
          // append the string version to the body
          body += chunk.toString();
        });
        // listen till the end
        req.on("end", () => {
          // send back the data
          resolve(body);
        });
      } catch (err) {
        reject(err);
      }
    });
  }