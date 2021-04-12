import { ServiceResponse } from "../models/ServiceResponse"

export interface GiftCardService {
    createCard(value: number): Promise<ServiceResponse<GiftCard>>
    getCard(id: string, code: string): Promise<ServiceResponse<GiftCard>>
    useCard(id: string, code: string, amount: number): Promise<ServiceResponse<UseCardResult>>
    generateId(sections: number): string
    generateCode(length: number): string
}

export type GiftCard = {
    id: string
    code: string
    value: number
    valid: boolean
}

export type UseCardResult = {
    id: string
    amountDue: number
    remainingValue: number
}