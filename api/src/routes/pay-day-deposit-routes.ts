import {CrudRoutes} from './crud-routes';
import {PayDayDeposit} from '../models/models';
import PayDayDepositController from '../controllers/pay-day-deposit-controller';

class PayDayDepositRoutes extends CrudRoutes<PayDayDeposit> {
  constructor(controller: PayDayDepositController) { 
    super(controller); 
  }

  isValid(dep: PayDayDeposit): boolean {
    return (
      dep.amount !== undefined &&
      dep.lineItemId !== undefined &&
      dep.payDayId !== undefined
    )
  }
}

export default PayDayDepositRoutes;
