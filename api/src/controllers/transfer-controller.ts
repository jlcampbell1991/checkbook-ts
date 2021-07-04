import TransactionController from "./transaction-controller";
import { getDate, Transaction, Transfer } from '../models/models';
import { v4 as UUID } from 'uuid';

class TransferController {
    private transCont: TransactionController;

    constructor() {
        this.transCont = new TransactionController();
    }

    async create(transfer: Transfer, payload: string): Promise<Transaction[]> {
        const transferId = UUID();
        const date = getDate();
        const fromTransaction: Transaction = await this.transCont.create({
            date: date,
            memo: `Transfer - ${transfer.memo}`,
            amount: transfer.amount,
            category: 'withdrawal',
            status: 'posted',
            transferred: false,
            line_item_id: transfer.from,
            transfer_id: transferId
         }, payload);

        const toTransaction: Transaction = await this.transCont.create({
            date: date,
            memo: `Transfer - ${transfer.memo}`,
            amount: transfer.amount,
            category: 'deposit',
            status: 'posted',
            transferred: false,
            line_item_id: transfer.to,
            transfer_id: transferId
        }, payload);

        return [
            fromTransaction,
            toTransaction
        ];
    }
}

export default TransferController;