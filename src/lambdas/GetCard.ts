'use strict';

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});

const middy = require('@middy/core');
const createError = require('http-errors')

const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const validator = require('@middy/validator');

const inputSchema = {
  type: 'object',
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1 },
        code: { type: 'string', minLength: 1 }
      },
      required: ['id', 'code']
    }
  }
}

const getCard = async (event, context) => {

  const { id, code } = event.queryStringParameters;

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
    data = await ddbClient.send(new GetItemCommand(params));
  } catch (error) {
    console.error(error);
    throw createError(500);
  }

  if (data.Item === undefined) {
    // card not found with that id
    throw createError(404);
  }

  if (data.Item.code.S !== code || !data.Item.valid.BOOL) {
    // card code doesn't match, or is invalid
    throw createError(400);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        id: data.Item.PK.S.split('#')[1],
        value: parseFloat(data.Item.value.N)
      }
    ),
  };
};


module.exports.handler = middy(getCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
