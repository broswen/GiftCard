'use strict';

import { GiftCard, GiftCardService } from "../services/GiftCardService";
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

  let giftcard: GiftCard
  try {
    giftcard = await giftCardService.createCard(event.body.amount)
  } catch (error) {
    console.error(error);
    throw createError(500);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(giftcard)
  };
};

module.exports.handler = middy(createCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
