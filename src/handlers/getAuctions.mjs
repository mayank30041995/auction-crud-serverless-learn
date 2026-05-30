import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware.mjs";

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
    console.error("DynamoDB Error:", error);

    throw new createError.InternalServerError(error.message);
  }
};

export const handler = commonMiddleware(getAuctions);
