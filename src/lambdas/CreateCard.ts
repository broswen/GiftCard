'use strict';

import { APIGatewayEventRequestContext, APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});

const middy = require('@middy/core');

const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const validator = require('@middy/validator');

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        amount: { type: 'number', minValue: 0 }
      },
      required: ['amount']
    }
  }
}

const createCard = async (event, context) => {

  //generate id
  const id: string = generateId();
  const code: string = generateCode(6);
  

  console.log('value', event.body.value);
  console.log(id, code);

  const value: number = event.body.value;
  //generate code
  //check if code exists
  //insert

  const params = {
    TableName: process.env.CARDS,
    Item: {
      PK: {
        S: `C#${id}`
      },
      SK: {
        S: `C#${id}`
      },
      value: {
        N: value
      },
      code: {
        S: code
      },
      valid: {
        B: true
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        id,
        code,
        value
      }
    ),
  };
};

function generateId(sections: number = 4): string {
  let id: string = '';

  for (let i = 0; i < sections; i++) {
    if (i !== 0) id.concat('-');
    for (let x = 0; x < 4; x++) {
      id.concat(`${getRandomInt(10)}`);
    }
  }

  return id;
}

function generateCode(length: number): string {
  let code: string = '';
  for (let i = 0; i < length; i++) {
    code.concat(`${getRandomInt(10)}`);
  }
  return code;
}

function getRandomInt(max: number, min: number = 0): number {
  return Math.floor(min + (Math.random() * Math.floor(max)));
}

module.exports.handler = middy(createCard)
  .use(jsonBodyParser())
  .use(validator({inputSchema}))
  .use(httpErrorHandler());