import {CrudRoutes} from './crud-routes';
import {Request, Response} from "express";
import TransactionController from "../controllers/transaction-controller";
import {Transaction} from '../models/models';

class TransactionRoutes extends CrudRoutes<Transaction> {
  constructor(controller: TransactionController) {
    super(controller);

    this.router.put('/:id/update-status', async(req: Request, res: Response) => {
      const payload = this.getPayload(res);
      const results = await this.handleErrors(() => controller.toggleStatus(req.params.id, req.body.status, payload));
      res.status(results.status).send(results.body);
    })

    this.router.put('/:id/update-transferred', async(req: Request, res: Response) => {
      const payload = this.getPayload(res);
      const results = await this.handleErrors(() => controller.toggleTransferred(req.params.id, req.body.transferred, payload));
      res.status(results.status).send(results.body);
    })

    this.router.delete('/:pay_day_id/destroy-by-pay-day', async(req: Request, res: Response) => {
      const payload = this.getPayload(res);
      const results = await this.handleErrors(() => controller.destroyByPayDayId(req.params.pay_day_id, payload));
      res.status(results.status).send(results.body);
    })
  }

  isValid(trans: Transaction): boolean {
    return (
      trans.date !== undefined &&
      trans.amount !== undefined &&
      trans.category !== undefined &&
      (trans.category === 'withdrawal' || trans.category === 'deposit') &&
      trans.status !== undefined && 
      (trans.status === 'pending' || trans.status === 'posted')
    )
  }
}

export default TransactionRoutes;
