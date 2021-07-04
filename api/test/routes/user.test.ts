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

function validateUserProps(user) {
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("password");
}

function validateUserVals(to: User, from: User) {
    expect(to.name).toEqual(from.name);
    expect(bcrypt.compareSync(from.password, to.password)).toBe(true);
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}

const updatedUser: User = {
    name: UUID(),
    password: UUID()
}

describe("UserRoutes", () => {
    test("should create a new user", () => {
        return request(app)
            .post("/users")
            .send(user)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateUserProps(res.body);
                userId = res.body.id;
            })
    })

    test("should not create a new user with invalid body", () => {
        return request(app)
            .post("/users")
            .send({
                category: 'withdrawal'
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should get a user by ID", () => {
        return request(app)
            .get(`/users/${userId}`)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateUserProps(res.body);
                validateUserVals(res.body, user);
            })
    })

    test("should not get a user with Invalid Id", () => {
        return request(app)
            .get('/users/invalidId')
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should update an existing user", () => {
        return request(app)
            .put(`/users/${userId}`)
            .send(updatedUser)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateUserProps(res.body);
                validateUserVals(res.body, updatedUser)
            })
    })

    test("should not update an existing user when given invalid data", () => {
        return request(app)
            .put(`/users/${userId}`)
            .send({
                category: "deposit"
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    test("should should delete a user", () => {
        return request(app)
            .delete(`/users/${userId}`)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })

    test("should not should delete a user that doesn't exist", () => {
        return request(app)
            .delete('/users/invalidId')
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })
});
