import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { GiftCardNotFoundError } from '../models/GiftCardNotFoundError';
import { InvalidCardError } from "../models/InvalidCardError";
import { InvalidCodeError } from "../models/InvalidCodeError";
import { ServiceError } from "../models/ServiceError";
import { ServiceResponse } from "../models/ServiceResponse";
import { GiftCard, GiftCardService, UseCardResult } from './GiftCardService';


export class GiftCardServiceImpl implements GiftCardService {

    ddbClient: DynamoDBClient

    constructor() {
        this.ddbClient = new DynamoDBClient({})
    }

    async createCard(value: number): Promise<ServiceResponse<GiftCard>> {
        const id: string = this.generateId();
        const code: string = this.generateCode()

        const params: PutItemCommandInput = {
            TableName: process.env.CARDS,
            Item: {
                PK: {
                    S: `C#${id}`
                },
                SK: {
                    S: `C#${id}`
                },
                value: {
                    N: `${value}`
                },
                code: {
                    S: code
                },
                valid: {
                    BOOL: true
                }
            }
        }
        let data: PutItemCommandOutput
        try {
            data = await this.ddbClient.send(new PutItemCommand(params));

        } catch (error) {
            return new ServiceError(error.message)
        }

        return {
            id,
            code,
            value,
            valid: true
        }
    }

    // TODO throw different errors, card not found, code doesn't match
    async getCard(id: string, code: string): Promise<ServiceResponse<GiftCard>> {
        const params: GetItemCommandInput = {
            TableName: process.env.CARDS,
            Key: {
                PK: {
                    S: `C#${id}`
                },
                SK: {
                    S: `C#${id}`
                }
            }
        }

        let data: GetItemCommandOutput;
        try {
            data = await this.ddbClient.send(new GetItemCommand(params));
        } catch (error) {
            return new ServiceError(error.message)
        }

        if (data.Item === undefined) {
            return new GiftCardNotFoundError(`${id} not found`)
        }

        if (data.Item.code.S !== code) {
            return new InvalidCodeError(`${code} does not match`)
        }

        return {
            id: data.Item.PK.S.split('#')[1],
            value: parseFloat(data.Item.value.N),
            valid: data.Item.valid.BOOL,
            code: data.Item.code.S
        }

    }

    async useCard(id: string, code: string, amount: number): Promise<ServiceResponse<UseCardResult>> {

        const response: ServiceResponse<GiftCard> = await this.getCard(id, code)

        if (response instanceof ServiceError) {
            return response
        }

        const giftcard: GiftCard = response

        let startingValue: number = giftcard.value

        if (!giftcard.valid) {
            return new InvalidCardError(`${id} card is invalid`)
        }

        let amountDue: number = amount
        let cardValue: number
        if (amount >= giftcard.value) {
            // amount > card value, use all of card value
            amountDue -= giftcard.value
            cardValue = 0
        } else {
            // card value can cover entire amount
            cardValue = giftcard.value - amount
            amountDue = 0
        }

        const params2: UpdateItemCommandInput = {
            TableName: process.env.CARDS,
            Key: {
                PK: {
                    S: `C#${id}`
                },
                SK: {
                    S: `C#${id}`
                }
            },
            UpdateExpression: 'SET #v = :v',
            ExpressionAttributeNames: {
                '#v': 'value'
            },
            ExpressionAttributeValues: {
                ':v': {
                    N: `${cardValue}`
                }
            }
        }

        // create card usage event record
        const params3: PutItemCommandInput = {
            TableName: process.env.CARDS,
            Item: {
                PK: {
                    S: `C#${id}`
                },
                SK: {
                    S: `E#${new Date().toISOString()}`
                },
                value: {
                    N: String(startingValue)
                },
                amount: {
                    N: String(amount)
                }
            }
        }

        try {
            await this.ddbClient.send(new UpdateItemCommand(params2));
            await this.ddbClient.send(new PutItemCommand(params3));
        } catch (error) {
            console.error(error);
            return new ServiceError(error.message)
        }

        return {
            id,
            amountDue,
            remainingValue: cardValue
        }

    }

    generateId(sections: number = 4): string {
        let id: string = '';

        for (let i = 0; i < sections; i++) {
            if (i !== 0) id = id.concat('-');
            for (let x = 0; x < 4; x++) {
                id = id.concat(String(this.getRandomInt(10)));
            }
        }

        return id;
    }

    generateCode(length: number = 6): string {
        let code: string = '';
        for (let i = 0; i < length; i++) {
            code = code.concat(String(this.getRandomInt(10)));
        }
        return code;
    }

    getRandomInt(max: number, min: number = 0): number {
        return Math.floor(min + (Math.random() * Math.floor(max)));
    }


}