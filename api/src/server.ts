import App from './app';
import Logger from './logger';
import Routes from "./routes/routes";

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger);

app.listen();
