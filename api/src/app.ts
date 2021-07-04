import bodyParser from "body-parser";
import express from "express";
import {Application} from "express";
import Routes from './routes/routes';
import Logger from './logger';


class App {
  public app: Application
  private port: number;
  private logger: Logger;

  constructor(routes: Routes, port: number, logger: Logger) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.port = port;

    this.app.use("/", routes.router);

    this.logger = logger;
  }

  listen(): void {
    this.app.listen(this.port, () => {
      this.logger.info(`Application listening on port ${this.port}`);
    })
  }
}

export default App;
