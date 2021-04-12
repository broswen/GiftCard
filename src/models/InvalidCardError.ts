import { ServiceError } from "./ServiceError"

export class InvalidCardError extends ServiceError {
    public name = "InvalidCardError"
    constructor(message: string) {
        super(message)
    }
}