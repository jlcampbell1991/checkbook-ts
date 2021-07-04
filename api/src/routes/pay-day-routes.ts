import {CrudRoutes} from './crud-routes';
import {PayDay} from '../models/models';
import {Request, Response, Router} from "express";
import PayDayController from '../controllers/pay-day-controller';

class PayDayRoutes extends CrudRoutes<PayDay> {
  constructor(controller: PayDayController) { 
    super(controller); 

    this.router.post('/:id/get-paid', async (req: Request, res: Response) => {
      const payload = this.getPayload(res);
      const results = await this.handleErrors(() => controller.getPaid(req.params.id, payload));
      res.status(results.status).send(results.body);
  });
  }

  isValid(cat: PayDay): boolean {
    return (
      cat.name !== undefined
    )
  }
}

export default PayDayRoutes;
