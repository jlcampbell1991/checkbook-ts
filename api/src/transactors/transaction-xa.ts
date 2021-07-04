import { ResultRow } from 'ts-postgres/dist/src/result';
import {TransCat, Transaction, TransStatus} from '../models/models';
import {Transactor} from './transactor';

export class TransactionXA extends Transactor<Transaction> {
  constructor(){
    super("transactions",
    <Transaction>(res: ResultRow<any>): Transaction => {
      try {
        return {
          date: res.get("date") as Date,
          memo: res.get("memo") as string,
          amount: this.parseMoney(res.get("amount") as string),
          category: res.get("category") as TransCat,
          status: res.get("status") as TransStatus,
          transferred: res.get("transferred") as boolean,
          line_item_id: res.get("line_item_id") as string,
          line_item_balance: this.parseMoney(res.get("line_item_balance") as string),
          transfer_id: res.get("transfer_id") as string,
          pay_day_id: res.get("pay_day_id") as string,
          user_id: res.get("user_id") as string,
          id: res.get("id") as string,
        } as unknown as Transaction
      } catch(e) {
        throw new Error(e);
      }
    });
  }

  async insert(trans: Transaction, userId: string): Promise<Transaction> {
    const count = await this.count(userId);
    const diff = parseInt(process.env.MAX_TRANS) - count;
    if(diff <= 0) await this.deleteNOldest((diff * -1) + 1, userId);
    const arr = await this.transact<Transaction>(this.insertStatement(trans, userId));
    return arr[0];
  }

  insertStatement(trans: Transaction, userId: string): string {
    const date = new Date(trans.date);
    return `
    insert into ${this.table}(
      date,
      memo,
      amount,
      category,
      status,
      transferred,
      line_item_id,
      line_item_balance,
      transfer_id,
      pay_day_id,
      user_id,
      id)
    values
    (
      '${date.toISOString()}',
      '${trans.memo}',
      ${trans.amount},
      '${trans.category}',
      '${trans.status}',
      ${trans.transferred},
      '${trans.line_item_id}',
      '${trans.line_item_balance}',
      '${trans.transfer_id}',
      '${trans.pay_day_id}',
      '${userId}',
      '${this.makeId()}'
    )
    returning *
    `;
  }

  updateStatement(id: string, trans: Transaction, userId: string): string {
    const date = new Date(trans.date);
    return `
      update ${this.table} set
        date = '${date.toISOString()}',
        memo = '${trans.memo}',
        amount = ${trans.amount},
        category = '${trans.category}',
        status = '${trans.status}',
        transferred = ${trans.transferred},
        line_item_id = '${trans.line_item_id}',
        line_item_balance = '${trans.line_item_balance}',
        transfer_id = '${trans.transfer_id}'
      where id = '${id}'
      and user_id = '${userId}'
      returning *
    `;
  }

  async deleteByTransferId(transferId: string, userId: string): Promise<Transaction[]> {
    return this.transact<Transaction>(`delete from ${this.table} where transfer_id = '${transferId}' and user_id = '${userId}' returning *`);
  }

  async selectByItemId(id: string, userId: string): Promise<Transaction[]> {
    return this.transact<Transaction>(`select * from ${this.table} where line_item_id = '${id}' and user_id = '${userId}'`);
  }

  async deleteByItemId(id: string, userId: string): Promise<Transaction[]> {
    return this.transact<Transaction>(`delete from ${this.table} where line_item_id = '${id}' and user_id = '${userId}' returning *`);
  }

  async deleteByPayDayId(id: string, userId: string): Promise<Transaction[]> {
    return this.transact<Transaction>(`delete from ${this.table} where pay_day_id = '${id}' and user_id = '${userId}' returning *`);
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Transaction> {
    const arr = await this.transact<Transaction>(`
      update ${this.table} set
        status = '${status}'
      where id = '${id}'
      and user_id = '${userId}'
      returning *`);
    return arr[0];
  }

  async updateTransferred(id: string, transffered: boolean, userId: string): Promise<Transaction> {
    const arr = await this.transact<Transaction>(`
    update ${this.table} set
      transferred = ${transffered}
    where id = '${id}'
    and user_id = '${userId}'
    returning *`);
  return arr[0];
  }

  // TODO: Incorporate userId
  async count(userId: string): Promise<number> {
    const arr = await this.transact<number>(
      `select count(id) from ${this.table}`,
      (res: ResultRow<any>): number => parseInt(res.get("count") as string)
    )
    return arr[0];
  }

  // TODO: Incorporate userId
  async deleteNOldest(n: number, userId: string): Promise<Transaction[]> {
    return this.transact<Transaction>(
      `delete from ${this.table} where id in (
        select id from ${this.table} order by date asc limit ${n}
      ) returning *`
    )
  }
}
