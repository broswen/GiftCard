import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";

export class GiftCardServiceImpl implements GiftCardService {

    ddbClient: DynamoDBClient

    constructor() {
        this.ddbClient = new DynamoDBClient({})
    }

    async createCard(value: number): Promise<GiftCard> {
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
            console.error(error);
            throw error
        }

        return {
            id,
            code,
            value,
            valid: true
        }
    }

    // TODO throw different errors, card not found, code doesn't match
    async getCard(id: string, code: string): Promise<GiftCard> {
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
            console.error(error);
            throw error
        }

        if (data.Item === undefined) {
            throw new Error("card not found")
        }

        if (data.Item.code.S !== code) {
            throw new Error("code does not match")
        }

        return {
            id: data.Item.PK.S.split('#')[1],
            value: parseFloat(data.Item.value.N),
            valid: data.Item.valid.BOOL,
            code: data.Item.code.S
        }

    }

    useCard(id: string, code: string, amount: number): Promise<UseCardResult> {

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