import App from "../../src/app";
import { PayDay, LineItem, Transaction, User } from "../../src/models/models";
import Logger from '../../src/logger';
import request from "supertest";
import { v4 as UUID } from 'uuid';
import Routes from '../../src/routes/routes';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

let id: string;
let payDay: PayDay = {
    name: UUID()
}
let updatedPayDay: PayDay = {
    name: UUID(),
    id: id
}

function validatePayDayProps(pd: PayDay) {
    expect(pd).toHaveProperty("name");
    expect(pd).toHaveProperty("id");
}

function validatePayDayVals(to: PayDay, from: PayDay) {
    expect(to.name).toEqual(from.name);
    expect(to.id).toEqual(from.id);
}
let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

describe("PayDayRoutes", () => {    
    // ////////////////////////////////////////////////////////////////////////////////////////////
    test("should create a new user", () => {
        return request(app)
            .post("/users")
            .send(user)
            .then(res => {
                expect(res.statusCode).toBe(200);
                userId = res.body.id;
            })
    })

    test("return a token when logging in", () => {
        return request(app)
            .post("/login")
            .send(user)
            .then(res => {
                jwt = res.body.authToken;
            })
    })
    ///////////////////////////////////////////////////////////////////////////////////////////////
    test("should create a new PayDay", () => {
        return request(app)
            .post("/pay-days")
            .set('x-auth-token', jwt)
            .send(payDay)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validatePayDayProps(res.body);
                id = res.body.id;
                payDay.id = res.body.id;
            })
    })

    test("should not create a new PayDay with invalid body", () => {
        return request(app)
            .post("/pay-days")
            .set('x-auth-token', jwt)
            .send({
                flarm: UUID()
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should not create a new PayDay with duplicate name", () => {
        return request(app)
            .post("/pay-days")
            .set('x-auth-token', jwt)
            .send(payDay)
            .then(res => {
                expect(res.statusCode).toBe(409);
            })
    })

    test("should getAll PayDays", () => {
        return request(app)
            .get("/pay-days")
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
                res.body.forEach(validatePayDayProps);
            })
    })

    test("should get a PayDay by ID", () => {
        return request(app)
            .get(`/pay-days/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validatePayDayProps(res.body);
                validatePayDayVals(res.body, payDay);
            })
    })

    test("should not get a PayDay with Invalid Id", () => {
        return request(app)
            .get('/pay-days/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should update an existing PayDay", () => {
        return request(app)
            .put(`/pay-days/${id}`)
            .set('x-auth-token', jwt)
            .send(updatedPayDay)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validatePayDayProps(res.body);
                updatedPayDay.id = id;
                validatePayDayVals(res.body, updatedPayDay)
            })
    })

    test("should not update an existing PayDay when given invalid data", () => {
        return request(app)
            .put(`/pay-days/${id}`)
            .set('x-auth-token', jwt)
            .send({
                flarm: payDay.name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    test("should should delete a PayDay", () => {
        return request(app)
            .delete(`/pay-days/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })
});
