import { PayDay } from '../models/models';
import { ResultRow } from 'ts-postgres/dist/src/result';
import {Transactor} from './transactor';

export class PayDayXA extends Transactor<PayDay> {
  constructor(){
    super("pay_days",
    <PayDay>(res: ResultRow<any>): PayDay => {
      try {
        return {
          name: res.get("name") as string,
          id: res.get("id") as string,
          userId: res.get('user_id') as string
        } as unknown as PayDay
      } catch(e) {
        throw new Error(e);
      }
    });
  }

  insertStatement(payDay: PayDay, userId: string): string {
    return `
      insert into ${this.table}(name, id, user_id)
      values
      (
        '${payDay.name}',
        '${this.makeId()}',
        '${userId}'
      )
      returning *
    `;
  }

  updateStatement(id: string, payDay: PayDay, userId: string): string {
    return `
      update ${this.table} set
        name = '${payDay.name}'
      where id = '${id}' and user_id = '${userId}'
      returning *
    `;
  }
}
