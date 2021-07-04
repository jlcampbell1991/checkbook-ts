import { Controller } from './controller';
import { LineItem, Transaction } from '../models/models';
import { LineItemXA } from '../transactors/line-item-xa';
import { TransactionXA } from '../transactors/transaction-xa';
import { PayDayDepositXA } from '../transactors/pay-day-deposit-xa';

class LineItemController extends Controller<LineItem> {
    private xa: LineItemXA;
    private transXA: TransactionXA;
    private depXA: PayDayDepositXA;

    constructor() {
        super();
        this.xa = new LineItemXA();
        this.transXA = new TransactionXA();
        this.depXA = new PayDayDepositXA();
    }

    index(payload: string): Promise<LineItem[]> {
        const userId = this.getUserId(payload);
        return this.xa.selectAll(userId);
    }

    async show(id: string, payload: string): Promise<LineItem> {
        const userId = this.getUserId(payload);
        return this.tryOrNotFound(async () => {
            const [item, trans, deposits, budget] = await Promise.all([
                this.xa.select(id, userId),
                this.getTrans(id, payload),
                this.depXA.selectByLineItemId(id, userId),
                this.getBudget(id, payload)
            ])

            item.transactions = trans;
            item.deposits = deposits;
            item.budget = budget;
            return item;
        })
    }

    // async showWithNoTrans(id: string, payload: string): Promise<LineItem> {
    //     const userId = this.getUserId(payload);
    //     return this.tryOrNotFound(async () => {
    //         const [item, budget] = await Promise.all([
    //             this.xa.select(id, userId),
    //             this.getBudget(id, payload)
    //         ])

    //         item.budget = budget;
    //         return item;
    //     })
    // }

    async getBudget(id: string, payload: any): Promise<number> {
        const userId = this.getUserId(payload);
        const deps = await this.depXA.selectByLineItemId(id, userId)
        return deps.reduce((accum, dep) => accum + dep.amount, 0)
    }

    async create(trans: LineItem, payload: string): Promise<LineItem> {
        const userId = this.getUserId(payload);
        return await this.xa.insert(trans, userId);
    }

    async update(id: string, item: LineItem, payload: string): Promise<LineItem> {
        const userId = this.getUserId(payload);
        return this.tryOrNotFound(async () => {
            const [updated, trans] = await Promise.all([
                this.xa.update(id, item, userId),
                this.getTrans(id, payload)
            ])

            updated.transactions = trans;
            return updated;
        })
    }

    async destroy(id: string, payload: string): Promise<LineItem> {
        const userId = this.getUserId(payload);
        const [_, item] = await Promise.all([this.destroyTrans(id, payload), this.xa.delete(id, userId)])
        return item;
    }

    async getAllByCatId(catId: string, payload: any): Promise<LineItem[]> {
        const userId = this.getUserId(payload);
        return this.tryOrNotFound(async () => {
            const items = await this.xa.selectByCategoryId(catId, userId);
            await Promise.all(
                items.map(async item => {
                    item.budget = await this.getBudget(item.id, payload);
                    return item;
                })
            )
            return items;
        })
    }

    async destroyByCategoryId(catId: string, payload: any): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        const items = await this.xa.deleteByCategoryId(catId, userId);
        const transactions: Transaction[] = [];
        
        items.forEach(async item => {
            const t = await this.destroyTrans(item.id, payload)
            t.forEach(trans => {
                transactions.push(trans);
            })
        })
        return transactions;
    }

    private async destroyTrans(itemId: string, payload: string): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        return this.transXA.deleteByItemId(itemId, userId);
    }

    private async getTrans(itemId: string, payload: any): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        return this.transXA.selectByItemId(itemId, userId);
    }
}

export default LineItemController;