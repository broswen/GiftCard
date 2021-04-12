'use strict';

import { GiftCardNotFoundError } from "../models/GiftCardNotFoundError";
import { InvalidCodeError } from "../models/InvalidCodeError";
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

  // TODO catch different service errors
  let response: ServiceResponse<GiftCard> = await giftCardService.getCard(id, code)

  if (response instanceof ServiceError) {
    console.error(response)

    if (response instanceof GiftCardNotFoundError) {
      throw createError(404, 'card not found')
    }

    if (response instanceof InvalidCodeError) {
      throw createError(400, 'invalid code')
    }

    throw createError(500)
  }

  let giftcard: GiftCard = response

  return {
    statusCode: 200,
    body: JSON.stringify(giftcard)
  };
};


module.exports.handler = middy(getCard)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());
