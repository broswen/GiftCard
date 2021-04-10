'use strict';

import { GiftCardServiceImpl } from "../services/GiftCardServiceImpl";

const giftCardService: GiftCardService = new GiftCardServiceImpl()

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

  let giftcard: GiftCard
  // TODO catch different service errors
  try {
    giftcard = await giftCardService.getCard(id, code)
  } catch (error) {
    console.error(error)
    throw createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(giftcard)
  };
};


module.exports.handler = middy(getCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
