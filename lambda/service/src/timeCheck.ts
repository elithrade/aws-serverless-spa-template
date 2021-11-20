import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { getRoles, Roles } from './roles';

export const timeCheck = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const roles = getRoles(event);
  if (roles.every((role) => role !== Roles.Member)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: `does not have required role: ${Roles.Member} for time query`,
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      time: new Date(),
    }),
  };
};

export default timeCheck;
