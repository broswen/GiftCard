import { ServiceError } from "./ServiceError";

export class InvalidCodeError extends ServiceError {
    public name = "InvalidCodeError"
    constructor(message: string) {
        super(message)
    }
}