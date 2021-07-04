import { Controller } from './controller';
import { LineItem, LineItemCategory } from '../models/models';
import { LineItemCategoryXA } from '../transactors/line-item-category-xa';
import { LineItemXA } from '../transactors/line-item-xa';
import { TransactionXA } from '../transactors/transaction-xa';
import { PayDayDepositXA } from '../transactors/pay-day-deposit-xa';

class LineItemCategoryController extends Controller<LineItemCategory> {
    private xa: LineItemCategoryXA;
    private itemXA: LineItemXA;
    private transXA: TransactionXA;
    private depXA: PayDayDepositXA;

    constructor() {
        super();
        this.xa = new LineItemCategoryXA();
        this.itemXA = new LineItemXA();
        this.transXA = new TransactionXA();
        this.depXA = new PayDayDepositXA();
    }

    async index(payload: any): Promise<LineItemCategory[]> {
        const userId = this.getUserId(payload);
        const cats = await this.xa.selectAll(userId);
        await Promise.all(
            cats.map(async cat => {
                const items = await this.getItems(cat.id, payload);
                cat.lineItems = items
            })
        )
        return cats;
    }

    async show(id: string, payload: any): Promise<LineItemCategory> {
        const userId = this.getUserId(payload);
        return this.tryOrNotFound(async () => {
            const [cat, items] = await Promise.all([
                this.xa.select(id, userId),
                this.getItems(id, payload)
            ])
            
            cat.lineItems = items;
            return cat;
        })
    }

    async create(trans: LineItemCategory, payload: any): Promise<LineItemCategory> {
        const userId = this.getUserId(payload);
        return await this.xa.insert(trans, userId);
    }

    async update(id: string, cat: LineItemCategory, payload: any): Promise<LineItemCategory> {
        const userId = this.getUserId(payload);
        return this.tryOrNotFound(async () => {
            const [updated, items] = await Promise.all([
                this.xa.update(id, cat, userId),
                this.getItems(id, payload)
            ])
            
            updated.lineItems = items;
            return updated;
        })
    }

    async destroy(id: string, payload: any): Promise<LineItemCategory> {
        const userId = this.getUserId(payload);
        const [category, items] = await Promise.all([
            this.xa.delete(id, userId),
            this.itemXA.deleteByCategoryId(id, userId)
        ])

        await Promise.all(items.flatMap(item => {
            this.transXA.deleteByItemId(item.id, userId);
        }))

        return category;
    }

    private async getItems(catId: string, payload: any): Promise<LineItem[]> {
        const userId = this.getUserId(payload);
        const items = await this.itemXA.selectByCategoryId(catId, userId);
        await Promise.all(items.map(async item => {
            const deposits = await this.depXA.selectByLineItemId(item.id, userId);
            item.budget = deposits.reduce((accum, dep) => accum + dep.amount, 0)
        }))
        
        return items;
    }
}

export default LineItemCategoryController;