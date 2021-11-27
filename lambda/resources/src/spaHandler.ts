import * as Lambda from 'aws-lambda';

export const handler: Lambda.CloudFrontRequestHandler = (
  event,
  _,
  callback
) => {
  const request = event.Records[0].cf.request;
  const dotIndex = request.uri.lastIndexOf('.');
  const slashIndex = request.uri.lastIndexOf('/');

  if (dotIndex === -1 || slashIndex > dotIndex) {
    request.uri = '/index.html';
  }

  callback(null, request);
};
