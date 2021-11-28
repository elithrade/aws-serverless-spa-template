import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as core from '@aws-cdk/core';
import { EdgeFunctionProps } from '@aws-cdk/aws-cloudfront/lib/experimental';

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
