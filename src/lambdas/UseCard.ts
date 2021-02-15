'use strict';

import { APIGatewayEventRequestContext, APIGatewayProxyEvent } from "aws-lambda";


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
        id: { type: 'string', minLength: 19, maxLength: 19},
        code: { type: 'string', minLength: 6, maxLength: 6},
        amount: { type: 'number', minValue: 0 }
      },
      required: ['amount', 'id', 'code']
    }
  }
}

const useCard = async (event: APIGatewayProxyEvent, context: APIGatewayEventRequestContext) => {

  //get card details
  //  return 404 if not found
  //  return 400 if code doesn't match

  //if value > card, return amountDue and 0
  //else return card - value

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'CreateCard',
        input: event,
      }
    ),
  };
};


module.exports.handler = middy(useCard)
  .use(jsonBodyParser())
  .use(validator({inputSchema}))
  .use(httpErrorHandler());
