import AWS from "aws-sdk";
import createError from "http-errors";

import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import commonMiddleware from "../lib/commonMiddleware.js";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  const status = event.queryStringParameters?.status || "OPEN";

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error.message);
  }
};

export const handler = commonMiddleware(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema),
  }),
);

// With logs
// sls invoke local -f getAuctions -l --data "{\"queryStringParameters\":{\"status\":\"OPEN\"}}"

// or, if invoking the deployed Lambda:

// sls invoke -f getAuctions -l --data "{\"queryStringParameters\":{\"status\":\"OPEN\"}}"
