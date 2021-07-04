import Encryptable from '../utilities/encryptable';
import { Results, User } from '../models/models';
import { UserXA } from "../transactors/user-xa";
import * as jwt from 'jsonwebtoken';

class SessionController extends Encryptable {
    private userXA: UserXA;
    
    constructor() { 
        super();
        this.userXA = new UserXA();
    }

    async login(user: User) {
        const dbUser: User = await this.userXA.selectByName(user.name);

        if(this.validate(user.password, dbUser.password)) {
            return { 
                authToken: jwt.sign({ payload: dbUser.id }, process.env.JWT_SECRET, { expiresIn: "24h" })
            };
        } else {
            const results: Results<User> = { status: 401, body: 'Unauthorized' }
            throw JSON.stringify(results);
        }
    }
}

export default SessionController;