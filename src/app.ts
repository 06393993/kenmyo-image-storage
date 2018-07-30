import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context,
    Handler,
} from "aws-lambda";
import * as moment from "moment";

export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =
    async (
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>,
    ): Promise<APIGatewayProxyResult> => {
        return {
            body: JSON.stringify({
                env: process.env,
                now: +moment(),
            }),
            statusCode: 200,
        };
    };
