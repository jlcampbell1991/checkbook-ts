import {CrudRoutes} from './crud-routes';
import {LineItemCategory} from '../models/models';
import LineItemCategoryController from '../controllers/line-item-category-controller';

class LineItemCategoryRoutes extends CrudRoutes<LineItemCategory> {
  constructor(controller: LineItemCategoryController) { 
    super(controller); 
  }

  isValid(cat: LineItemCategory): boolean {
    return (
      cat.name !== undefined
    )
  }
}

export default LineItemCategoryRoutes;
