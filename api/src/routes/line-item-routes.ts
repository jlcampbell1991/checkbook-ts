import {CrudRoutes} from './crud-routes';
import {LineItem, Results} from '../models/models';
import LineItemController from '../controllers/line-item-controller';

class LineItemRoutes extends CrudRoutes<LineItem> {
  constructor(controller: LineItemController) {
    super(controller);
  }

  isValid(item: LineItem): boolean {
    return (
      item.name !== undefined &&
      item.balance !== undefined &&
      item.category_id !== undefined
    )
  }
}

export default LineItemRoutes;