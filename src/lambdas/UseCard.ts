'use strict';

import { GiftCardServiceImpl } from "../services/GiftCardServiceImpl";

const giftCardService: GiftCardService = new GiftCardServiceImpl()

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

  let useCardResult: UseCardResult
  try {
    useCardResult = await giftCardService.useCard(event.body.id, event.body.code, event.body.amount)
  } catch (error) {
    console.error(error);
    throw createError(500);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(useCardResult)
  };
};


module.exports.handler = middy(useCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
