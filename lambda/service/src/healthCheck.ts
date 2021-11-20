import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export const healthCheck =
  async (): Promise<APIGatewayProxyStructuredResultV2> => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success' }),
    };
  };

export default healthCheck;
