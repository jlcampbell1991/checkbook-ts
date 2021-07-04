import { PayDayDeposit } from '../models/models';
import { ResultRow } from 'ts-postgres/dist/src/result';
import {Transactor} from './transactor';

export class PayDayDepositXA extends Transactor<PayDayDeposit> {
  constructor(){
    super("pay_day_deposits",
    <PayDayDeposit>(res: ResultRow<any>): PayDayDeposit => {
      try {
        return {
          amount: this.parseMoney(res.get("amount") as string),
          lineItemId: res.get("line_item_id") as string,
          payDayId: res.get("pay_day_id") as string,
          id: res.get("id") as string,
          userId: res.get('user_id') as string
        } as unknown as PayDayDeposit
      } catch(e) {
        throw new Error(e);
      }
    });
  }

  insertStatement(deposit: PayDayDeposit, userId: string): string {
    return `
      insert into ${this.table}(amount, line_item_id, pay_day_id, id, user_id)
      values
      (
        '${deposit.amount}',
        '${deposit.lineItemId}',
        '${deposit.payDayId}',
        '${this.makeId()}',
        '${userId}'
      )
      returning *
    `;
  }

  updateStatement(id: string, deposit: PayDayDeposit, userId: string): string {
    return `
      update ${this.table} set
        amount = '${deposit.amount}',
        line_item_id = '${deposit.lineItemId}',
        pay_day_id = '${deposit.payDayId}'
      where id = '${id}' and user_id = '${userId}'
      returning *
    `;
  }

  selectByPayDayId(payDayId: string, userId: string): Promise<PayDayDeposit[]> {
      return this.transact(`select * from ${this.table} where pay_day_id = '${payDayId}' and user_id = '${userId}'`);
  }

    selectByLineItemId(itemId: string, userId: string): Promise<PayDayDeposit[]> {
        return this.transact(`select * from ${this.table} where line_item_id = '${itemId}' and user_id = '${userId}'`);
    }


    deleteByPayDayId(payDayId: string, userId: string): Promise<PayDayDeposit[]> {
        return this.transact(`delete from ${this.table} where pay_day_id = '${payDayId}' and user_id = '${userId}' returning *`);
    }
}
