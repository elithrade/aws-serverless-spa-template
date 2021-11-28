import * as Lambda from 'aws-lambda';

export const handler: Lambda.CloudFrontResponseHandler = async (
  event,
  _,
  callback
) => {
  try {
    const cf = event.Records[0].cf;
    const response = cf.response;

    response.headers['strict-transport-security'] = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubdomains; preload',
      },
    ];

    callback(null, response);
  } catch (error) {
    return {
      status: '500',
      headers: {
        'content-type': [{ value: 'text/plain' }],
      },
      body: 'An error occurred loading the page',
    };
  }
};
