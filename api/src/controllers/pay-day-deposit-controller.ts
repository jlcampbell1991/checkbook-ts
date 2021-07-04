import { Controller } from './controller';
import { PayDayDeposit } from '../models/models';
import { PayDayDepositXA } from '../transactors/pay-day-deposit-xa';
import { PayDayXA } from '../transactors/pay-day-xa';

class PayDayDepositController extends Controller<PayDayDeposit> {
    private xa: PayDayDepositXA;
    private payDayXA: PayDayXA;

    constructor() {
        super();
        this.xa = new PayDayDepositXA();
        this.payDayXA = new PayDayXA();
    }

    async index(payload: string): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        const deps = await this.xa.selectAll(userId);
        deps.forEach(async dep => {
            if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
            return dep;
        });
        return deps;
    }

    async show(id: string, payload: string): Promise<PayDayDeposit> {
        const userId = this.getUserId(payload);
        const dep = await this.xa.select(id, userId);
        if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
        return dep;
    }

    async create(deposit: PayDayDeposit, payload: string): Promise<PayDayDeposit> {
        const userId = this.getUserId(payload);
        const dep = await this.xa.insert(deposit, userId)
        if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
        return dep;
    }

    async update(id: string, deposit: PayDayDeposit, payload: string): Promise<PayDayDeposit> {
        const userId = this.getUserId(payload);
        const dep = await this.xa.update(id, deposit, userId);
        if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
        return dep;
    }

    async destroy(id: string, payload: string): Promise<PayDayDeposit> {
        const userId = this.getUserId(payload);
        return this.xa.delete(id, userId);
    }

    async getAllByPayDayId(id: string, payload: any): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        const deps = await this.xa.selectByPayDayId(id, userId);
        deps.forEach(async dep => {
            if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
            return dep;
        });
        return deps;
    }

    async getAllByLineItemId(id: string, payload: any): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        const deps = await this.xa.selectByLineItemId(id, userId);
        deps.forEach(async dep => {
            if(dep !== undefined) dep.name = await this.getName(dep.payDayId, userId);
            return dep;
        });
        return deps;
    }

    async destroyAllByPayDayId(id: string, payload: any): Promise<PayDayDeposit[]> {
        const userId = this.getUserId(payload);
        return this.xa.deleteByPayDayId(id, userId);
    }

    private async getName(payDayId: string, userId: string): Promise<string> {
        const payDay = await this.payDayXA.select(payDayId, userId);
        return payDay.name;
    }
}

export default PayDayDepositController;