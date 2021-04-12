export class ServiceError implements Error {
    public name: string
    public message: string
    constructor(message?: string) {
        this.message = message || ''
    }
}