import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as core from '@aws-cdk/core';
import { EdgeFunctionProps } from '@aws-cdk/aws-cloudfront/lib/experimental';

/**
 * The SpaEdgeFunction construct provides a lambda function for CloudFront
 * Distribution lambdaFunctionAssociations for origin requests. For each
 * request, if the request does not look like a file changes the uri for the
 * request to `/index.html`.
 *
 * Requests are assumed to be file request if and only if they contain a `.` and
 * no `/` occur after the last instance of a `.`.  e.g. `styles/main.css` would
 * be treated as a file, but `projects/customer.last/` would not be treated as a
 * files.
 *
 * This is to aid deploying web apps employing browser routing instead of hash
 * routing.
 */
export class SpaEdgeFunction extends cloudfront.experimental.EdgeFunction {
  constructor(scope: core.Construct, id: string, props?: EdgeFunctionProps) {
    super(scope, id, {
      ...(props ?? {}),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'spaHandler.handler',
      code: lambda.AssetCode.fromAsset('../lambda/resources/lib'),
    });
  }
}
