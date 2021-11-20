import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as createUuid } from 'uuid';
import healthCheck from './healthCheck';
import timeCheck from './timeCheck';
import { AsyncRouteHandler } from './types';

export const RESPONSE_BASE = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'access-control-allow-headers': 'accept,authorization,content-type',
    'access-control-allow-methods': '*',
    'access-control-allow-origin': '*',
    'access-control-max-age': 864000,
  },
  isBase64Encoded: false,
};

interface Route {
  routeKey: string;
  handler: AsyncRouteHandler;
}

const routes: Route[] = [
  { routeKey: 'GET /', handler: healthCheck },
  { routeKey: 'GET /api/time', handler: timeCheck },
];

export const handler: APIGatewayProxyHandlerV2 = async (
  event,
  context
): Promise<APIGatewayProxyResultV2> => {
  const route = routes.find((item) => item.routeKey === event.routeKey);
  if (route) {
    try {
      const response = await route.handler(event, context);
      return {
        ...RESPONSE_BASE,
        ...response,
        headers: {
          ...RESPONSE_BASE.headers,
          ...(response.headers ?? {}),
        },
      };
    } catch (error) {
      const correlationId = createUuid();
      console.log(`Failed to handle request: ${JSON.stringify(event)}`);
      console.log(`Unhandled server error [${correlationId}]: ${error}`);
      return {
        ...RESPONSE_BASE,
        statusCode: 500,
        body: JSON.stringify({ message: 'Server Error', logId: correlationId }),
      };
    }
  }
  return {
    ...RESPONSE_BASE,
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' }),
  };
};
