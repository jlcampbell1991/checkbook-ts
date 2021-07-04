import App from "../../src/app";
import Logger from '../../src/logger';
import request from "supertest";
import Routes from '../../src/routes/routes';
import { getDate, Transaction, User } from "../../src/models/models";
import { v4 as UUID } from 'uuid';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;

let id: string;
let lineItemId: string;
let balance: number = 100;
const wdAmt = 10.99;
const depAmt = 14.99;
const memo = UUID();

const deposit: () => Transaction = () => { 
    return {
        date: getDate(),
        memo: memo,
        amount: depAmt,
        status: 'posted',
        category: 'deposit',
        transferred: true,
        line_item_id: lineItemId,
        user_id: userId
    } 
}

const withdrawal: () => Transaction = () => { 
    return {
        date: getDate(),
        memo: memo,
        amount: wdAmt,
        status: 'pending',
        category: 'withdrawal',
        transferred: false,
        line_item_id: lineItemId,
        user_id: userId
    } 
}

const invalidCatTrans = () => { 
    return {
        memo: memo,
        amount: wdAmt,
        status: 'pending',
        category: 'not withdrawal',
        line_item_id: lineItemId,
        user_id: userId
    } 
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

function validateTransProps(trans) {
    expect(trans).toHaveProperty("date");
    expect(trans).toHaveProperty("amount");
    expect(trans).toHaveProperty("category");
    expect(trans).toHaveProperty("transferred");
    expect(trans).toHaveProperty("line_item_id");
    expect(trans).toHaveProperty("line_item_balance");
    expect(trans).toHaveProperty("id");
}

function validateTransVals(to: Transaction, from: Transaction) {
    const toDate = new Date(to.date);
    expect(toDate.toDateString()).toEqual(from.date.toDateString());
    expect(to.amount).toEqual(from.amount);
    expect(to.category).toEqual(from.category);
    expect(to.transferred).toEqual(from.transferred);
    expect(to.line_item_id).toEqual(from.line_item_id);
    expect(to.id).toEqual(from.id);
}

describe("TransactionRoutes", () => {
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

    test("should create a new LineItem", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send({
                name: `trans-${UUID()}`,
                balance: balance,
                category_id: UUID(),
                userId: userId
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                lineItemId = res.body.id;
            })
    })
    ///////////////////////////////////////////////////////

    test("should create a new transaction", () => {
        return request(app)
            .post("/transactions")
            .set('x-auth-token', jwt)
            .send(withdrawal())
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateTransProps(res.body);
                id = res.body.id;
            })
    })

    test("should subtract from line item balance if withdrawal", () => {
        return request(app)
            .get(`/line-items/${lineItemId}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const bal = res.body.balance;
                expect(bal).toBeLessThan(balance);
                expect(bal).toEqual(balance - wdAmt);
                balance = bal;
            })
    })

    test("should not create a new transaction with invalid body", () => {
        return request(app)
            .post("/transactions")
            .set('x-auth-token', jwt)
            .send({
                category: 'withdrawal'
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should not create a new transaction with invalid category type", () => {
        return request(app)
            .post("/transactions")
            .set('x-auth-token', jwt)
            .send(invalidCatTrans())
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should getAll transactions", () => {
        return request(app)
            .get("/transactions")
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
                res.body.forEach(validateTransProps);
            })
    })

    test("should get a transaction by ID", () => {
        return request(app)
            .get(`/transactions/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const wd = withdrawal();
                wd.id = id;
                expect(res.statusCode).toBe(200);
                validateTransProps(res.body);
                validateTransVals(res.body, wd);
            })
    })

    test("should not get a transaction with Invalid Id", () => {
        return request(app)
            .get('/transactions/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should update an existing transaction", () => {
        return request(app)
            .put(`/transactions/${id}`)
            .set('x-auth-token', jwt)
            .send(deposit())
            .then(res => {
                const dep = deposit();
                dep.id = id;
                expect(res.statusCode).toBe(200);
                validateTransProps(res.body);
                validateTransVals(res.body, dep)
            })
    })

    test("should add to line item balance if deposit", () => {
        return request(app)
            .get(`/line-items/${lineItemId}`)
            .set('x-auth-token', jwt)
            .then(res => {
                const bal = res.body.balance;
                expect(bal).toBeGreaterThan(balance);
                expect(bal).toEqual(balance + wdAmt + depAmt)
                balance = bal;
            })
    })

    test("should not update an existing transaction when given invalid data", () => {
        return request(app)
            .put(`/transactions/${id}`)
            .set('x-auth-token', jwt)
            .send({
                category: "deposit"
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    test("should update status of an existing transaction", () => {
        return request(app)
            .put(`/transactions/${id}/update-status`)
            .set('x-auth-token', jwt)
            .send({
                status: "pending"
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateTransProps(res.body);
                expect(res.body.status).toBe("pending");
            })
    })

    test("should update transferred of an existing transaction", () => {
        return request(app)
            .put(`/transactions/${id}/update-transferred`)
            .set('x-auth-token', jwt)
            .send({
                transferred: false
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateTransProps(res.body);
                expect(res.body.transferred).toBe(false);
            })
    })


    test("should should delete a transaction", () => {
        return request(app)
            .delete(`/transactions/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })

    test("should not should delete a transaction that doesn't exist", () => {
        return request(app)
            .delete('/transactions/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })
});
