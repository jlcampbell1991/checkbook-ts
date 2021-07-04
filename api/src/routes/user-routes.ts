import {CrudRoutes} from './crud-routes';
import {Request, Response} from "express";
import { UserController } from "../controllers/user-controller";
import {User} from '../models/models';

class UserRoutes extends CrudRoutes<User> {
  constructor(controller: UserController) {
    super(controller);
  }

  isValid(user: User): boolean {
    return (
      user.name !== undefined &&
      user.password !== undefined
    )
  }
}

export default UserRoutes;
