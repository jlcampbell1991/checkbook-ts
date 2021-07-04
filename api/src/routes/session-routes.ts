import bodyParser from "body-parser";
import ErrorHandler from './error-handler';
import express from "express";
import {Request, Response, Router} from "express";
import SessionController from "../controllers/session-controller";
import { User } from '../models/models';


class SessionRoutes extends ErrorHandler<User> {
    public router: Router;

    constructor(controller: SessionController) {
        super();

        this.router = express.Router();
        this.router.use(bodyParser.json());
        this.router.use(bodyParser.urlencoded({ extended: true }));

        this.router.post('/', async (req: Request, res: Response) => {
            const results = await this.handleErrors(() => controller.login(req.body));
            res.status(results.status).send(results.body);
        })
    }

    isValid(user: User): boolean {
        return (
          user.name !== undefined &&
          user.password !== undefined
        )
      }
}

export default SessionRoutes;