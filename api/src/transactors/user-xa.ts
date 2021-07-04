import { User } from '../models/models';
import { ResultRow } from 'ts-postgres/dist/src/result';
import bcrypt from 'bcrypt';
import { AbstractTransactor } from './abstract-transactor';

export class UserXA extends AbstractTransactor {
  constructor(private table = "users") { 
    super(<User>(res: ResultRow<any>): User => {
      try {
        return {
            name: res.get("name") as string,
            password: res.get("password") as string,
            id: res.get("id") as string,
        } as unknown as User
      } catch(e) {
        throw new Error(e);
      }
    })
  }

  async insert(user: User): Promise<User> {
    const arr = await this.transact<User>(`
      insert into ${this.table}(name, password, id)
      values
      (
          '${user.name}',
          '${this.encrypt(user.password)}',
          '${this.makeId()}'
      )
      returning *
      `);
    return arr[0];
  }

  async update(id: string, user: User): Promise<User> {
    const arr = await this.transact<User>(`
      update ${this.table} set
          name = '${user.name}',
          password = '${this.encrypt(user.password)}'
      where id = '${id}'
      returning *
      `);
    return arr[0];
  }

  async select(id: string): Promise<User> {
    const arr = await this.transact<User>(`select * from ${this.table} where id = '${id}'`);
    return arr[0];
  }

  async delete(id: string): Promise<User> {
    const arr = await this.transact<User>(`delete from ${this.table} where id = '${id}' returning *`);
    return arr[0];
  }

  async selectByName(name: string): Promise<User> {
        const arr = await this.transact<User>(`select * from ${this.table} where name = '${name}'`)
        return arr[0];
  }

  private encrypt(str: string): string {
    return bcrypt.hashSync(str, 10);
  }
}