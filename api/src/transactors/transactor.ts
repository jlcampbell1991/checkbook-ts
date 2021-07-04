import { ResultRow } from 'ts-postgres/dist/src/result';
import { AbstractTransactor } from './abstract-transactor';

export abstract class Transactor<T> extends AbstractTransactor {

    constructor(protected table: string, transform: <T>(res: ResultRow<any>) => T) { super(transform) }

    abstract insertStatement(t: T, userId: string): string;
    abstract updateStatement(id: string, t: T, userId: string): string;
    selectAllStatement(userId: string): string { return `select * from ${this.table} where user_id = '${userId}'`; }
    selectStatement(id: string, userId: string) { return `select * from ${this.table} where id = '${id}' and user_id = '${userId}'`; }
    deleteStatement(id: string, userId: string) { return `delete from ${this.table} where id = '${id}' and user_id = '${userId}' returning *`; }

    async insert(t: T, userId: string): Promise<T> {
      const arr = await this.transact<T>(this.insertStatement(t, userId));
      return arr[0];
    }

    async update(id: string, t: T, userId: string): Promise<T> {
      const arr = await this.transact<T>(this.updateStatement(id, t, userId));
      return arr[0];
    }

    async selectAll(userId: string): Promise<T[]> {
      return this.transact<T>(this.selectAllStatement(userId));
    }

    async select(id: string, userId: string): Promise<T> {
      const arr = await this.transact<T>(this.selectStatement(id, userId));
      return arr[0];
    }

    async delete(id: string, userId: string): Promise<T> {
      const arr = await this.transact<T>(this.deleteStatement(id, userId));
      return arr[0];
    }
  }