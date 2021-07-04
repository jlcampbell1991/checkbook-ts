import App from "../../src/app";
import bcrypt from 'bcrypt';
import Logger from '../../src/logger';
import request from "supertest";
import Routes from '../../src/routes/routes';
import { User } from "../../src/models/models";
import { v4 as UUID } from 'uuid';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}

describe("SessionRoutes", () => {
    // MAKE BETTER ////////////////////////////////////////////////////////////////////////////////
    test("should create a new user", () => {
        return request(app)
            .post("/users")
            .send(user)
            .then(res => {
                expect(res.statusCode).toBe(200);
                userId = res.body.id;
            })
    })
    // MAKE BETTER ////////////////////////////////////////////////////////////////////////////////

    test("return a token when logging in", () => {
        return request(app)
            .post("/login")
            .send(user)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('authToken');
            })
    })

    test("return 401 when logging in with invalid creds", () => {
        user.password = 'flarm';
        return request(app)
            .post("/login")
            .send(user)
            .then(res => {
                expect(res.statusCode).toBe(401);   
            })
    })


});
