'use strict';

import { ServiceError } from "../models/ServiceError";
import { ServiceResponse } from "../models/ServiceResponse";
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

  const response: ServiceResponse<GiftCard> = await giftCardService.createCard(event.body.amount)

  if (response instanceof ServiceError) {
    console.error(response)
    throw createError(500)
  }

  let giftcard: GiftCard = response

  return {
    statusCode: 200,
    body: JSON.stringify(giftcard)
  };
};

module.exports.handler = middy(createCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
