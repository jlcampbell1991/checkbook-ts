import express from "express";
import LineItemCategoryRoutes from './line-item-category-routes';
import LineItemRoutes from './line-item-routes';
import LineItemCategoryController from '../controllers/line-item-category-controller';
import LineItemController from '../controllers/line-item-controller';
import {NextFunction, Request, Response, Router} from "express";
import TransactionRoutes from './transaction-routes';
import TransactionController from '../controllers/transaction-controller';
import TransferController from "../controllers/transfer-controller";
import TransferRoutes from "./transfer-routes";
import { UserController } from "../controllers/user-controller";
import UserRoutes from "./user-routes";
import PayDayController from "../controllers/pay-day-controller";
import PayDayRoutes from './pay-day-routes';
import PayDayDepositController from "../controllers/pay-day-deposit-controller";
import PayDayDepositRoutes from "./pay-day-deposit-routes";
import SessionController from "../controllers/session-controller";
import SessionRoutes from "./session-routes";
import * as jwt from 'jsonwebtoken';

class Routes {
  public router: Router;

  constructor() {
    this.router = express.Router();

    const transController = new TransactionController();
    const transferController = new TransferController();
    const userController = new UserController();
    const payDayDepositController = new PayDayDepositController();
    const payDayController = new PayDayController();
    const sessionController = new SessionController();
    const lineItemController = new LineItemController();
    const lineItemCatController = new LineItemCategoryController();

    // No auth
    const userRoutes = new UserRoutes(userController);
    this.router.use('/users', userRoutes.router);

    const sessionRoutes = new SessionRoutes(sessionController);
    this.router.use('/login', sessionRoutes.router);

    this.router.get('/ping', (_: Request, res: Response) => {
      res.send('pong');
    });

    // auth
    this.router.use((req: Request, res: Response, next: NextFunction) => {
      try{
        const payload = jwt.verify(req.header('x-auth-token'), process.env.JWT_SECRET)
        res.locals.jwtPayload = payload;
        next();
      } catch(e) {
        res.status(401).send();
      }
    })

    const transRoutes = new TransactionRoutes(transController);
    this.router.use('/transactions', transRoutes.router);

    const lineItemRoutes = new LineItemRoutes(lineItemController);
    this.router.use('/line-items', lineItemRoutes.router);

    const lineItemCategoryRoutes = new LineItemCategoryRoutes(lineItemCatController);
    this.router.use('/line-item-categories', lineItemCategoryRoutes.router);

    const transferRoutes = new TransferRoutes(transferController);
    this.router.use('/transfers', transferRoutes.router);

    const payDayRoutes = new PayDayRoutes(payDayController);
    this.router.use('/pay-days', payDayRoutes.router);

    const payDayDepRoutes = new PayDayDepositRoutes(payDayDepositController);
    this.router.use('/pay-day-deposits', payDayDepRoutes.router);
  }
}

export default Routes;
