import { v4 as UUID } from 'uuid';
import { Client } from 'ts-postgres';
import { ResultRow } from 'ts-postgres/dist/src/result';
import { Results } from '../models/models';

export abstract class AbstractTransactor {
    constructor(private transform: <T>(res: ResultRow<any>) => T) {}

    protected makeId(): string {
      return UUID();
    }

    async transact<T>(statement: string, transform: (res: ResultRow<any>) => T = this.transform): Promise<T[]> {
      const client = new Client({
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASS
      });

      await client.connect();
      
      try {
        const results = client.query(statement);
        const ts = [];

        for await (const result of results) {
          ts.push(transform(result));
        }

        return ts;
      } catch(e) {
        // console.log(e);
        const results: Results<T> = { status: 409, body: 'Conflict' }
        throw JSON.stringify(results);
      } finally {
        await client.end();
      }
    }

    protected parseMoney(money: string): number {
      return parseFloat(parseFloat(money).toFixed(2))
    }
  }