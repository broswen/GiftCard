'use strict';

import { APIGatewayEventRequestContext, APIGatewayProxyEvent } from "aws-lambda";


const middy = require('@middy/core');

const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');

const getCard = async (event: APIGatewayProxyEvent, context: APIGatewayEventRequestContext) => {


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


module.exports.handler = middy(getCard)
  .use(jsonBodyParser())
  .use(httpErrorHandler());
