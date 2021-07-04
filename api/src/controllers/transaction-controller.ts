import { Controller } from './controller';
import { LineItem, Transaction, TransStatus } from "../models/models";
import { LineItemXA } from "../transactors/line-item-xa";
import { TransactionXA } from "../transactors/transaction-xa";

class TransactionController extends Controller<Transaction> {
    private transXA: TransactionXA;
    private itemXA: LineItemXA;

    constructor() {
        super();
        this.transXA = new TransactionXA();
        this.itemXA = new LineItemXA();
    }

    index(payload: string): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        return this.transXA.selectAll(userId);
    }

    async show(id: string, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        return this.transXA.select(id, userId);
    }

    async create(trans: Transaction, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        const item = await this.updateLineItem(
            trans.line_item_id,
            this.enrichAmount(trans),
            userId);
        trans.line_item_balance = item.balance;
        return this.transXA.insert(trans, userId);
    }

    async update(id: string, trans: Transaction, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        const prev = await this.show(id, payload);
        const amount = this.enrichAmount(trans) - this.enrichAmount(prev);
        const item = await this.updateLineItem(trans.line_item_id, amount, userId);
        trans.line_item_balance = item.balance;
        return this.transXA.update(id, trans, userId);
    }

    async destroy(id: string, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        const trans = await this.show(id, payload);
        return this.tryOrNotFound(async () => {
            if(trans.transfer_id !== 'undefined') {
                const transactions = await this.transXA.deleteByTransferId(trans.transfer_id, userId);
                await Promise.all(transactions.map(trans => this.updateLineItemOnDestroy(trans, userId)));
                return transactions.find(trans => trans.id === id);
            } else {
                const trans = await this.transXA.delete(id, userId);
                await this.updateLineItemOnDestroy(trans, userId);
                return trans;
            }
        })
    }

    toggleStatus(id: string, status: TransStatus, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        return this.transXA.updateStatus(id, status, userId);
    }

    toggleTransferred(id: string, transffered: boolean, payload: string): Promise<Transaction> {
        const userId = this.getUserId(payload);
        return this.transXA.updateTransferred(id, transffered, userId);
    }

    // async destroyByItemId(itemId: string, payload: any): Promise<Transaction[]> {
    //     const userId = this.getUserId(payload);
    //     const transactions = await this.transXA.deleteByItemId(itemId, userId);
    //     await Promise.allSettled(transactions.map(trans => this.updateLineItemOnDestroy(trans, userId)))
    //     return transactions;
    // }

    async destroyByPayDayId(payDayId: string, payload: any): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        return this.transXA.deleteByPayDayId(payDayId, userId);
    }

    getAllByItemId(itemId: string, payload: any): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        return this.transXA.selectByItemId(itemId, userId);
    }

    private async updateLineItem(id: string, amount: number, userId: string): Promise<LineItem> {
        const item = await this.itemXA.select(id, userId);
        item.balance = item.balance + amount;
        return this.itemXA.update(item.id, item, userId);
    }

    private async updateLineItemOnDestroy(trans: Transaction, userId: string): Promise<LineItem> {
        const amount = trans.amount * -1;
        return this.updateLineItem(trans.line_item_id, amount, userId);
    }
}

export default TransactionController;