import { Controller } from './controller';
import { User } from "../models/models";
import { UserXA } from "../transactors/user-xa";

export class UserController extends Controller<User> {
    private userXA: UserXA;

    constructor() {
        super();
        this.userXA = new UserXA();
    }

    async index(): Promise<User[]> {
        return [];
    }

    show(id: string): Promise<User> {
        return this.userXA.select(id);
    }

    async create(user: User): Promise<User> {
        return this.userXA.insert(user);
    }

    async update(id: string, user: User): Promise<User> {
        return this.userXA.update(id, user);
    }

    destroy(id: string): Promise<User> {
        return this.userXA.delete(id);
    }
}