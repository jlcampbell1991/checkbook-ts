import App from "../../src/app";
import { PayDayDeposit, LineItem, Transaction, User } from "../../src/models/models";
import Logger from '../../src/logger';
import request from "supertest";
import { v4 as UUID } from 'uuid';
import Routes from '../../src/routes/routes';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

let id: string;
let itemId: string;
let payDayId: string;
function deposit(payDayId: string, itemId: string): PayDayDeposit {
    return {
        amount: 10.99,
        payDayId: payDayId,
        lineItemId: itemId
    }
}

function validatePayDayDepositProps(pd: PayDayDeposit) {
    expect(pd).toHaveProperty("amount");
    expect(pd).toHaveProperty("lineItemId");
    expect(pd).toHaveProperty("payDayId");
}

function validatePayDayDepositVals(to: PayDayDeposit, from: PayDayDeposit) {
    expect(to.amount).toEqual(from.amount);
    expect(to.lineItemId).toEqual(from.lineItemId);
    expect(to.payDayId).toEqual(from.payDayId);
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

describe("PayDayDepositRoutes", () => {
    // MAKE BETTER  ///////////////////////////////////////////////////////////////////////////////
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

    test("should create a new LineItem", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send({
                name: UUID(),
                balance: 100,
                category_id: UUID()
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                itemId = res.body.id;
            })
    })

    test("should create a new PayDay", () => {
        return request(app)
            .post("/pay-days")
            .set('x-auth-token', jwt)
            .send({
                name: UUID()
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                payDayId = res.body.id;
            })
    })
    // MAKE BETTER  ///////////////////////////////////////////////////////////////////////////////    
    test("should create a new PayDayDeposit", () => {
        return request(app)
            .post("/pay-day-deposits")
            .set('x-auth-token', jwt)
            .send(deposit(payDayId, itemId))
            .then(res => {
                expect(res.statusCode).toBe(200);
                validatePayDayDepositProps(res.body);
                id = res.body.id;
            })
    })

    test("should not create a new PayDayDeposit with invalid body", () => {
        return request(app)
            .post("/pay-day-deposits")
            .set('x-auth-token', jwt)
            .send({
                flarm: UUID()
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should getAll PayDayDeposits", () => {
        return request(app)
            .get("/pay-day-deposits")
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
                res.body.forEach(validatePayDayDepositProps);
            })
    })

    test("should get a PayDayDeposit by ID", () => {
        return request(app)
            .get(`/pay-day-deposits/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                const dep = deposit(payDayId, itemId);
                dep.id = id;
                validatePayDayDepositProps(res.body);
                validatePayDayDepositVals(res.body, dep);
            })
    })

    test("should not get a PayDayDeposit with Invalid Id", () => {
        return request(app)
            .get('/pay-day-deposits/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should create transactions", () => {
        return request(app)
            .post(`/pay-days/${payDayId}/get-paid`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty("length");
                expect(res.body.length).toBeGreaterThan(0);
                
            })
    })

    test("should update an existing PayDayDeposit", () => {
        const updated = deposit(payDayId, UUID());
        return request(app)
            .put(`/pay-day-deposits/${id}`)
            .set('x-auth-token', jwt)
            .send(updated)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validatePayDayDepositProps(res.body);
                updated.id = id;
                validatePayDayDepositVals(res.body, updated)
            })
    })

    test("should not update an existing PayDayDeposit when given invalid data", () => {
        return request(app)
            .put(`/pay-day-deposits/${id}`)
            .set('x-auth-token', jwt)
            .send({
                flarm: name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    // test("should should delete a PayDayDeposit", () => {
    //     return request(app)
    //         .delete(`/pay-day-deposits/${id}`)
    //         .set('x-auth-token', jwt)
    //         .then(res => {
    //             expect(res.statusCode).toBe(200);
    //         })
    // })
});
