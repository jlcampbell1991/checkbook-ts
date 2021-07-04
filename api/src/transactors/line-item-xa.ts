import { LineItem } from '../models/models';
import { ResultRow } from 'ts-postgres/dist/src/result';
import {Transactor} from './transactor';

export class LineItemXA extends Transactor<LineItem> {
  constructor() {
    super("line_items", <LineItem>(res: ResultRow<any>) => {
      try {
        return {
          name: res.get("name") as string,
          balance: this.parseMoney(res.get("balance") as string),
          category_id: res.get("category_id") as string,
          id: res.get("id") as string,
          userId: res.get('user_id') as string
        } as unknown as LineItem // SMELLS
      } catch(e) {
        throw new Error(e);
      }
    })
  }

  insertStatement(item: LineItem, userId: string): string {
    return `
      insert into ${this.table}(name, balance, category_id, user_id, id)
      values
      (
        '${item.name}',
        ${item.balance},
        '${item.category_id}',
        '${userId}',
        '${this.makeId()}'
      )
      returning *
    `;
  }

  updateStatement(id: string, item: LineItem, userId: string): string {
    return `
      update ${this.table} set
        name = '${item.name}',
        balance = ${item.balance},
        category_id = '${item.category_id}'
      where id = '${id}' and user_id = '${userId}'
      returning *
    `;
  }

  async selectByCategoryId(id: string, userId: string): Promise<LineItem[]> {
    return await this.transact(`select * from ${this.table} where category_id = '${id}' and user_id = '${userId}'`);
  }

  async deleteByCategoryId(id: string, userId: string): Promise<LineItem[]> {
    return await this.transact(`delete from ${this.table} where category_id = '${id}' and user_id = '${userId}' returning *`);
  }
}
