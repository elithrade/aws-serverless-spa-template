import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as core from '@aws-cdk/core';
import { EdgeFunctionProps } from '@aws-cdk/aws-cloudfront/lib/experimental';

/**
 * StsEdgeFunction properties are equivalent to Function Properties, omitting
 * `runtime`, `handler` and `code` which is is set by the StsFunction directly.
 */
export interface StsEdgeFunctionProps extends Partial<EdgeFunctionProps> {}

/**
 * The StsEdgeFunction construct provides a lambda function for CloudFront
 * Distribution lambdaFunctionAssociations for origin responses. For each
 * response the function adds headers for strict transport security.
 *
 * https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security
 *
 * This is to aid meeting security guidelines that may be required for a web
 * application.
 */
export class StsEdgeFunction extends cloudfront.experimental.EdgeFunction {
  constructor(scope: core.Construct, id: string, props?: StsEdgeFunctionProps) {
    super(scope, id, {
      ...(props ?? {}),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'stsHandler.handler',
      code: lambda.AssetCode.fromAsset('../lambda/resources/lib'),
    });
  }
}
