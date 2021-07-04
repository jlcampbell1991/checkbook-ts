import App from "../../src/app";
import { getDate, LineItemCategory, LineItem, Transaction, User } from "../../src/models/models";
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
const updatedName: string = UUID();

let itemId: string;
function lineItem(catId: string): LineItem {
    return {
        name: UUID(),
        balance: 100,
        category_id: catId
    }
}

let transId: string;
function transaction(itemId: string): Transaction { 
    return {
        date: getDate(),
        memo: UUID(),
        amount: 14.99,
        status: 'posted',
        category: 'deposit',
        transferred: true,
        line_item_id: itemId
    } 
}

function validateCatProps(cat: LineItemCategory) {
    expect(cat).toHaveProperty("name");
    expect(cat).toHaveProperty("id");
}

function validateCatVals(to: LineItemCategory, from: LineItemCategory) {
    expect(to.name).toEqual(from.name);
    expect(to.id).toEqual(from.id);
}

let userId: string;
const user: User = {
    name: UUID(),
    password: UUID()
}
let jwt: string;

let payDayId;

describe("LineItemCategoryRoutes", () => {   
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

    test("should create a new LineItemCategory", () => {
        return request(app)
            .post("/line-item-categories")
            .set('x-auth-token', jwt)
            .send({
                name: name
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateCatProps(res.body);
                id = res.body.id;
            })
    })

    test("should create a new LineItem", () => {
        return request(app)
            .post("/line-items")
            .send(lineItem(id))
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                itemId = res.body.id;
            })
    })

    test("should create a new PayDay", () => {
        return request(app)
            .post("/pay-days")
            .set('x-auth-token', jwt)
            .send({ name: UUID() })
            .then(res => {
                expect(res.statusCode).toBe(200);
                payDayId = res.body.id;
            })
    })

    test("should create a new PayDayDeposit", () => {
        return request(app)
            .post("/pay-day-deposits")
            .send({
                amount: 10.99,
                lineItemId: itemId,
                payDayId: payDayId,
            })
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })

    test("should create a new Transaction", () => {
        return request(app)
            .post("/transactions")
            .send(transaction(itemId))
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                transId = res.body.id;
            })
    })

    test("should not create a new LineItemCategory with invalid body", () => {
        return request(app)
            .post("/line-item-categories")
            .set('x-auth-token', jwt)
            .send({
                flarm: name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
                expect(res.text).toBe("Bad Request");
            })
    })

    test("should not create a new LineItemCategory with duplicate name", () => {
        return request(app)
            .post("/line-item-categories")
            .set('x-auth-token', jwt)
            .send({
                name: name
            })
            .then(res => {
                expect(res.statusCode).toBe(409);
            })
    })

    test("should getAll LineItemCategorys", () => {
        return request(app)
            .get("/line-item-categories")
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
                res.body.forEach(validateCatProps);
            })
    })

    test("should get a LineItemCategory by ID", () => {
        return request(app)
            .get(`/line-item-categories/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateCatProps(res.body);
                validateCatVals(res.body, {
                    name: name,
                    id: id
                });
            })
    })

    test("should not get a LineItemCategory with Invalid Id", () => {
        return request(app)
            .get('/line-item-categories/invalidId')
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should update an existing LineItemCategory", () => {
        return request(app)
            .put(`/line-item-categories/${id}`)
            .set('x-auth-token', jwt)
            .send({
                name: updatedName
            })
            .then(res => {
                expect(res.statusCode).toBe(200);
                validateCatProps(res.body);
                validateCatVals(res.body, {
                    name: updatedName,
                    id: id
                })
            })
    })

    test("should not update an existing LineItemCategory when given invalid data", () => {
        return request(app)
            .put(`/line-item-categories/${id}`)
            .set('x-auth-token', jwt)
            .send({
                flarm: name
            })
            .then(res => {
                expect(res.statusCode).toBe(400);
            })
    })

    test("should should delete a LineItemCategory", () => {
        return request(app)
            .delete(`/line-item-categories/${id}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            })
    })

    test("should should delete all child line items", () => {
        return request(app)
            .get(`/line-items/${itemId}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })

    test("should should delete all child transactions", () => {
        return request(app)
            .get(`/transactions/${transId}`)
            .set('x-auth-token', jwt)
            .then(res => {
                expect(res.statusCode).toBe(404);
            })
    })
});
