import bodyParser from "body-parser";
import ErrorHandler from './error-handler';
import express from "express";
import {Request, Response, Router} from "express";
import { Results, Transfer } from '../models/models';
import TransferController from "../controllers/transfer-controller";


class TransferRoutes extends ErrorHandler<Transfer> {
    public router: Router;

    constructor(controller: TransferController) {
        super();

        this.router = express.Router();
        this.router.use(bodyParser.json());
        this.router.use(bodyParser.urlencoded({ extended: true }));

        this.router.post('/', async (req: Request, res: Response) => {
            const userId = res.locals.jwtPayload;
            const results = await this.handleErrors(() => controller.create(req.body, userId), req.body);
            res.status(results.status).send(results.body);
        })
    }

    isValid(transfer: Transfer): boolean {
        return (
            transfer.from !== undefined &&
            transfer.to   !== undefined &&
            transfer.amount > 0
        );
    }
}

export default TransferRoutes;