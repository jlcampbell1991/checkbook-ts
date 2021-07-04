import App from "../../src/app";
import Logger from '../../src/logger';
import request from "supertest";
import Routes from '../../src/routes/routes';
import { LineItem, Transaction, Transfer, User } from "../../src/models/models";
import { v4 as UUID } from 'uuid';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

let toItem: LineItem = {
    name: UUID(),
    balance: 100,
    category_id: UUID()
}

let fromItem: LineItem = {
    name: UUID(),
    balance: 100,
    category_id: UUID()
}

const transfer: Transfer = {
    memo: UUID(),
    to: "",
    from: "",
    amount: 10.99
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

let transactions: Transaction[];

describe("TransferRoutes", () => {
    // TODO: MAKE THIS BETTER /////////////////////////////
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

    test("should create a from Item", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send(fromItem)
            .then(res => {
                expect(res.statusCode).toBe(200);
                transfer.from = res.body.id;
            })
    })

    test("should create a to Item", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send(toItem)
            .then(res => {
                expect(res.statusCode).toBe(200);
                transfer.to = res.body.id;
            })
    })
    ///////////////////////////////////////////////////////

    test("should create a new transfer", () => {
        return request(app)
            .post("/transfers")
            .set('x-auth-token', jwt)
            .send(transfer)
            .then(res => {
                transactions = res.body;
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('length');
                expect(res.body.length).toBeGreaterThan(0);
            })
    })


    test("should decrease from line item balance", () => {
        return request(app)
            .get(`/line-items/${transfer.from}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const bal = res.body.balance;
                expect(bal).toBeLessThan(fromItem.balance);
                expect(bal).toEqual(fromItem.balance - transfer.amount);
            })
    })

    test("should increase to line item balance", () => {
        return request(app)
            .get(`/line-items/${transfer.to}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const bal = res.body.balance;
                expect(bal).toBeGreaterThan(toItem.balance);
                expect(bal).toEqual(toItem.balance + transfer.amount);
            })
    })

    test("should delete transfers", () => {
        return request(app)
            .delete(`/transactions/${transactions[0].id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const trans = res.body;
                expect(trans.id).toBe(transactions[0].id)
                expect(res.status).toBe(200);
            })
    })

    test("should delete transfers", () => {
        return request(app)
            .get(`/transactions/${transactions[0].id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.status).toBe(404)
            })
    })

    test("should delete transfers", () => {
        return request(app)
            .get(`/transactions/${transactions[1].id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.status).toBe(404)
            })
    })
})