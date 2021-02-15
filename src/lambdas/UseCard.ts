'use strict';

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});

const middy = require('@middy/core');
const createError = require('http-errors');

const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const validator = require('@middy/validator');

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1 },
        code: { type: 'string', minLength: 1 },
        amount: { type: 'number', minValue: 0 }
      },
      required: ['amount', 'id', 'code']
    }
  }
}

const useCard = async (event, context) => {

  const params: GetItemCommandInput = {
    TableName: process.env.CARDS,
    Key: {
      PK: {
        S: `C#${event.body.id}`
      },
      SK: {
        S: `C#${event.body.id}`
      }
    }
  }

  let data: GetItemCommandOutput;
  try {
    data = await ddbClient.send(new GetItemCommand(params));
  } catch (error) {
    console.error(error);
    throw createError(500);
  }

  if (data.Item === undefined) {
    // card not found with that id
    throw createError(404);
  }

  if (data.Item.code.S !== event.body.code || !data.Item.valid.BOOL) {
    // card code doesn't match, or is invalid
    throw createError(400);
  }

  let amountDue: number = event.body.amount;
  let cardValue: number;
  if (event.body.amount >= data.Item.value.N) {
    // set card value to   0
    amountDue -= parseFloat(data.Item.value.N);
    cardValue = 0;
  } else {
    cardValue = parseFloat(data.Item.value.N) - event.body.amount;
    amountDue = 0;
  }

  const params2: UpdateItemCommandInput = {
    TableName: process.env.CARDS,
    Key: {
      PK: {
        S: `C#${event.body.id}`
      },
      SK: {
        S: `C#${event.body.id}`
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

  const params3: PutItemCommandInput = {
    TableName: process.env.CARDS,
    Item: {
      PK: {
        S: `C#${event.body.id}`
      },
      SK: {
        S: `E#${new Date().toISOString()}`
      },
      value: {
        N: data.Item.value.N
      },
      amount: {
        N: `${event.body.amount}`
      }
    }
  }

  try {
    await ddbClient.send(new UpdateItemCommand(params2));
    await ddbClient.send(new PutItemCommand(params3));
  } catch (error) {
    console.error(error);
    throw createError(500);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        amountDue,
        cardValue
      }
    ),
  };
};


module.exports.handler = middy(useCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
