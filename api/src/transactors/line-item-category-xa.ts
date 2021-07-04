import { LineItemCategory } from '../models/models';
import { ResultRow } from 'ts-postgres/dist/src/result';
import {Transactor} from './transactor';

export class LineItemCategoryXA extends Transactor<LineItemCategory> {
  constructor(){
    super("line_item_categories", <LineItemCategory>(res: ResultRow<any>): LineItemCategory => {
      try {
        return {
          name: res.get("name") as string,
          id: res.get("id") as string,
          userId: res.get('user_id') as string
        } as unknown as LineItemCategory
      } catch(e) {
        throw new Error(e);
      }
    });
  }

  insertStatement(cat: LineItemCategory, userId: string): string {
    return `
      insert into ${this.table}(name, id, user_id)
      values
      (
        '${cat.name}',
        '${this.makeId()}',
        '${userId}'
      )
      returning *
    `;
  }

  updateStatement(id: string, cat: LineItemCategory, userId: string): string {
    return `
      update ${this.table} set
        name = '${cat.name}'
      where id = '${id}' and user_id = '${userId}'
      returning *
    `;
  }
}
