import App from "../../src/app";
import { LineItem, Transaction, User } from "../../src/models/models";
import Logger from '../../src/logger';
import request from "supertest";
import { v4 as UUID } from 'uuid';
import Routes from '../../src/routes/routes';

const port = parseInt(process.env.PORT, 0);
const logger = new Logger();
const routes = new Routes();
const app = new App(routes, port, logger).app;


let id: string;
const name: string = UUID();
const balance: number = 9.99;
const updatedBalance: number = 10.99;
const updatedName: string = UUID();
const categoryId: string = UUID();

let transId: string;
function transaction(itemId: string): Transaction { 
    return {
        date: new Date(),
        memo: UUID(),
        amount: 14.99,
        status: 'posted',
        transferred: true,
        category: 'deposit',
        line_item_id: itemId
    } 
}

function validateItemProps(item: LineItem) {
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("category_id");
    expect(item).toHaveProperty("id");
}

function validateItemVals(to: LineItem, from: LineItem) {
    expect(to.name).toEqual(from.name);
    expect(to.category_id).toEqual(from.category_id);
    expect(to.id).toEqual(from.id);
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

describe("LineItemRoutes", () => {
    // MAKE BETER /////////////////////////////////////////////////////////////////////////////////
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
    // MAKE BETER /////////////////////////////////////////////////////////////////////////////////


    test("should create a new LineItem", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send({
                name: name,
                balance: balance,
                category_id: categoryId
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateItemProps(res.body);
                id = res.body.id;
            })
    })

    test("should create a new Transaction", () => {
        return request(app)
            .post("/transactions")
            .set('x-auth-token', jwt)
            .send(transaction(id))
            .then(res => {
                expect(res.statusCode).toBe(200);
                transId = res.body.id;
            })
    })

    test("should not create a new LineItem with invalid body", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send({
                flarm: name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should not create a new LineItem with duplicate name", () => {
        return request(app)
            .post("/line-items")
            .set('x-auth-token', jwt)
            .send({
                name: name,
                balance: balance,
                category_id: categoryId
            })
            .then(res => {
                expect(res.statusCode).toBe(409);
            })
    })

    test("should getAll LineItems", () => {
        return request(app)
            .get("/line-items")
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
                res.body.forEach(validateItemProps);
            })
    })

    test("should get a LineItem by ID", () => {
        return request(app)
            .get(`/line-items/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateItemProps(res.body);
                validateItemVals(res.body, {
                    name: name,
                    balance: balance,
                    category_id: categoryId,
                    id: id
                });
            })
    })

    test("should not get a LineItem with Invalid Id", () => {
        return request(app)
            .get('/line-items/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should update an existing LineItem", () => {
        return request(app)
            .put(`/line-items/${id}`)
            .set('x-auth-token', jwt)
            .send({
                name: updatedName,
                balance: updatedBalance,
                category_id: categoryId
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateItemProps(res.body);
                validateItemVals(res.body, {
                    name: updatedName,
                    balance: updatedBalance,
                    category_id: categoryId,
                    id: id
                })
            })
    })

    test("should not update an existing LineItem when given invalid data", () => {
        return request(app)
            .put(`/line-items/${id}`)
            .set('x-auth-token', jwt)
            .send({
                flarm: name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    test("should should delete a LineItem", () => {
        return request(app)
            .delete(`/line-items/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })

    test("should should delete all child transactions", () => {
        return request(app)
            .delete(`/transactions/${transId}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })
});
