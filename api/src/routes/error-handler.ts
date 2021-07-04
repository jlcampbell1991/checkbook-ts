import { Results } from '../models/models';

abstract class ErrorHandler<T> {
    abstract isValid(t: any): boolean;

    protected async handleErrors<U>(f: () => Promise<U | U[]>, t?: T): Promise<Results<U | U[]>> {
        if(t && !this.isValid(t)) { return { status: 400, body: 'Bad Request' }; }
        try {
            const body = await f();
            if(body !== undefined) {
                return { status: 200, body: body };
            } else {
                return { status: 404, body: 'Not Found' };
            }
        } catch(e) {
            try {
                // console.log(e);
                return JSON.parse(e) as Results<U | U[]>;
            } catch(e) { throw e }
        }
    }
}

export default ErrorHandler;