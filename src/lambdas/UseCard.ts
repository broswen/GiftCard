'use strict';

import { GiftCardNotFoundError } from "../models/GiftCardNotFoundError";
import { InvalidCardError } from "../models/InvalidCardError";
import { InvalidCodeError } from "../models/InvalidCodeError";
import { ServiceError } from "../models/ServiceError";
import { ServiceResponse } from "../models/ServiceResponse";
import { GiftCardService, UseCardResult } from "../services/GiftCardService";
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

  const response: ServiceResponse<UseCardResult> = await giftCardService.useCard(event.body.id, event.body.code, event.body.amount)

  if (response instanceof ServiceError) {
    console.error(response)

    switch (response.constructor) {
      case GiftCardNotFoundError: throw createError(404, 'card not found')
      case InvalidCodeError: throw createError(400, 'invalid code')
      case InvalidCardError: throw createError(400, 'invalid card')
      default: throw createError(500)
    }
  }

  let useCardResult: UseCardResult = response

  return {
    statusCode: 200,
    body: JSON.stringify(useCardResult)
  };
};


module.exports.handler = middy(useCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
