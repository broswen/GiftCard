interface GiftCardService {
    createCard(value: number): Promise<GiftCard>
    getCard(id: string, code: string): Promise<GiftCard>
    useCard(id: string, code: string, amount: number): Promise<UseCardResult>
    generateId(sections: number): string
    generateCode(length: number): string
}

type GiftCard = {
    id: string
    code: string
    value: number
    valid: boolean
}

type UseCardResult = {
    id: string
    amountDue: number
    remainingValue: number
}