import { ServiceError } from "./ServiceError";

export class GiftCardNotFoundError extends ServiceError {
    public name = "GiftCardNotFoundError"
    constructor(message: string) {
        super(message)
    }
}