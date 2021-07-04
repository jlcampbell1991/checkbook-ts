import { Transaction } from "../models/models";

export abstract class Controller<T> {
    abstract index(payload: any): Promise<T[]>
    abstract show(id: string, payload: any): Promise<T>
    abstract create(trans: T, payload: any): Promise<T> 
    abstract update(id: string, t: T, payload: any): Promise<T>
    abstract destroy(id: string, payload: any): Promise<T>
    protected getUserId(payload: any): string {
        return payload.userId || payload.payload;
    }
    protected async tryOrNotFound<U>(f: () => Promise<U>): Promise<U> {
        try {
            return await f();
        } catch {
            const res = { status: 404, body: "Not Found" }
            throw JSON.stringify(res);
        }
    }

    protected enrichAmount(trans: Transaction) {
        return trans.category === 'withdrawal' ? trans.amount * -1 : trans.amount;
    }
}