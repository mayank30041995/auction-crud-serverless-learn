import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import createError from "http-errors";

import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import commonMiddleware from "../lib/commonMiddleware.js";
import createAuctionSchema from "../lib/schemas/createAuctionSchema.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error.message);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionSchema),
  }),
);

// sls deploy function --function createAuction
// node -e "import('@middy/validator/transpile').then(console.log)"

// sls logs -f getAuctions -t
// sls logs -f placeBid -t

// sls logs -f processAuctions -t
// sls logs -f processAuctions --startTime  1m
// sls logs --help

// git clone https://github.com/codingly-io/sls-base.git auction-service
// rmdir /s /q .git  // remove git  init folder
