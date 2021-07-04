import { Controller } from './controller';
import { getDate, PayDay, PayDayDeposit, Transaction, TransCat, TransStatus } from '../models/models';
import { PayDayXA } from '../transactors/pay-day-xa';
import { PayDayDepositXA } from '../transactors/pay-day-deposit-xa';
import { TransactionXA } from '../transactors/transaction-xa';
import { LineItemXA } from '../transactors/line-item-xa';
import { v4 as UUID } from 'uuid';

class PayDayController extends Controller<PayDay> {
    private xa: PayDayXA;
    private depXA: PayDayDepositXA;
    private transXA: TransactionXA;
    private itemXA: LineItemXA;

    constructor() {
        super();
        this.xa = new PayDayXA();
        this.depXA = new PayDayDepositXA();
        this.transXA = new TransactionXA();
        this.itemXA = new LineItemXA();
    }

    index(payload: string): Promise<PayDay[]> {
        const userId = this.getUserId(payload);
        return this.xa.selectAll(userId);
    }

    async show(id: string, payload: string): Promise<PayDay> {
        return this.tryOrNotFound(async () => {
            const userId = this.getUserId(payload);
            const [payDay, deposits] = await Promise.all([
                this.xa.select(id, userId),
                this.getDeposits(id, payload)
            ]);
            payDay.deposits = deposits;
            payDay.total = deposits.reduce((accum, deposit) => accum + deposit.amount, 0)
            return payDay;
        })
    }

    async create(payDay: PayDay, payload: string): Promise<PayDay> {
        const userId = this.getUserId(payload);
        return await this.xa.insert(payDay, userId);
    }

    async update(id: string, payDay: PayDay, payload: string): Promise<PayDay> {
        return this.tryOrNotFound(async () => {
            const userId = this.getUserId(payload);
            const [updated, deposits] = await Promise.all([
                this.xa.update(id, payDay, userId),
                this.getDeposits(id, payload)
            ])

            updated.deposits = deposits;
            return updated;
        });
    }

    async destroy(id: string, payload: string): Promise<PayDay> {
        const userId = this.getUserId(payload);
        const [payDay, _] = await Promise.all([
            this.xa.delete(id, userId),
            this.destroyDeposits(id, payload)
        ])
        return payDay;
    }

    async getPaid(id: string, payload: string): Promise<Transaction[]> {
        const userId = this.getUserId(payload);
        const [payDay, deposits] = await Promise.all([this.show(id, payload), this.getDeposits(id, payload)])
        const payDayId = UUID();

        return Promise.all(
            deposits.map(async deposit => {
                const item = await this.itemXA.select(deposit.lineItemId, userId)
                const trans = {
                    date: getDate(),
                    memo: `Pay Day - ${payDay.name}`,
                    amount: deposit.amount,
                    category: "deposit" as TransCat,
                    status: "posted" as TransStatus,
                    transferred: false,
                    pay_day_id: payDayId,
                    line_item_id: deposit.lineItemId,
                    line_item_balance: 0.00
                }

                const itemBalance = item.balance + this.enrichAmount(trans)
                trans.line_item_balance = itemBalance;
                item.balance = itemBalance;

                const [res, _] = await Promise.all([
                    this.transXA.insert(trans, userId),
                    this.itemXA.update(item.id, item, userId)
                ]);
                return res;
            })
        )
    }

    private async getDeposits(id: string, payload: any): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        return this.depXA.selectByPayDayId(id, userId);
    }

    private async destroyDeposits(id: string, payload: any): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        return this.depXA.deleteByPayDayId(id, userId);
    }
}

export default PayDayController;