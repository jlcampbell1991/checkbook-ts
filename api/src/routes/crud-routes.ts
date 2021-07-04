import {Controller} from '../controllers/controller';
import bodyParser from "body-parser";
import ErrorHandler from './error-handler';
import express from "express";
import {Request, Response, Router} from "express";

export abstract class CrudRoutes <T> extends ErrorHandler<T> {
  public router: Router;

  constructor(controller: Controller<T>) {
    super();

    this.router = express.Router();
    this.router.use(bodyParser.json());
    this.router.use(bodyParser.urlencoded({ extended: true }));

    this.router.get('/', async (_: Request, res: Response) => {
        const payload = this.getPayload(res);
        const results = await this.handleErrors(() => controller.index(payload));
        res.status(results.status).send(results.body);
    });

    this.router.get('/:id', async (req: Request, res: Response) => {
        const payload = this.getPayload(res);
        const results = await this.handleErrors(() => controller.show(req.params.id, payload));
        res.status(results.status).send(results.body);
    });

    this.router.post('/', async (req: Request, res: Response) => {
        const payload = this.getPayload(res);
        const results = await this.handleErrors(() => controller.create(req.body, payload), req.body);
        res.status(results.status).send(results.body);
    });

    this.router.put('/:id', async (req: Request, res: Response) => {
        const payload = this.getPayload(res);
        const results = await this.handleErrors(
            () => controller.update(req.params.id, req.body, payload), req.body);
        res.status(results.status).send(results.body);
    });

    this.router.delete('/:id', async (req: Request, res: Response) => {
        const payload = this.getPayload(res);
        const results = await this.handleErrors(() => controller.destroy(req.params.id, payload));
        res.status(results.status).send(results.body);
    });
  }
    protected getPayload(res: Response): string {
        return res.locals.jwtPayload;
    }
}