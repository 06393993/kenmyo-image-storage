import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context,
    Handler,
} from "aws-lambda";
import AWS = require("aws-sdk");
import { promisify } from "util";
import uuidv4 = require("uuid/v4");

import { config } from "./config/config";

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const sns = new AWS.SNS();

function asyncHandlerWrpper<E, R>(h: Handler<E, R>): Handler<E, R> {
    return (event: E, context: Context, callback: Callback<R>) => {
        const res = h(event, context, callback);
        if (res) {
            res.then((result) => callback(null, result), (error) => {
                // tslint:disable-next-line
                console.log("an error occured");
                callback(error);
            });
        }
    };
}

const frontRouter: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = asyncHandlerWrpper(
    async (
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>,
    ): Promise<APIGatewayProxyResult> => {
        const id = uuidv4();
        const input = Math.random().toString();
        await promisify(s3.putObject.bind(s3))({
            Body: input,
            Bucket: config.imagesS3BucketName,
            Key: id,
        });
        const Item = {
            id,
        };
        await promisify(docClient.put.bind(docClient))({
            Item,
            TableName: config.imagesMetaTableName,
        });
        const output = (await promisify(s3.getObject.bind(s3))({
            Bucket: config.imagesS3BucketName,
            Key: id,
        })).Body.toString();
        return {
            body: JSON.stringify({
                Item,
                config,
                env: process.env,
                input,
                output,
            }),
            statusCode: 200,
        };
    },
);

const imageCreatedPublisher: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =
    async (
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>,
    ): Promise<APIGatewayProxyResult> => {
        await promisify(sns.publish.bind(sns))({
            Message: JSON.stringify(event),
            TopicArn: config.imageCreatedTopicArn,
        });
        return {
            body: JSON.stringify({
                config,
                env: process.env,
                event,
            }),
            statusCode: 200,
        };
    };

export {
    imageCreatedPublisher,
    frontRouter,
};
