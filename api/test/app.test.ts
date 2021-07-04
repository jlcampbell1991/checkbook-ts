import App from "../src/app";
import Logger from '../src/logger';
import Routes from '../src/routes/routes';
import request from "supertest";

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

describe("/ping", () => {
  test("should respond with 200 OK", () =>{
    return request(app)
      .get("/ping")
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("pong")
      })
  })
});
