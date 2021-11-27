import * as lambda from '@aws-cdk/aws-lambda';
import * as core from '@aws-cdk/core';
import { EdgeRole } from './EdgeRole';

/**
 * SpaFunction properties are equivalent to Function Properties, omitting
 * `runtime`, `handler` and `code` which is is set by the SpaFunction directly.
 */
export interface SpaFunctionProps
  extends Omit<lambda.FunctionProps, 'runtime' | 'handler' | 'code'> {}

/**
 * The SpaFunction construct provides a lambda function for CloudFront
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
export class SpaFunction extends lambda.Function {
  /**
   * Instantiates and instance of an SpaFunction
   * @param scope Parent of the construct
   * @param id The construct Id of this role
   * @param props SpaFunction properties
   */
  constructor(scope: core.Construct, id: string, props?: SpaFunctionProps) {
    super(scope, 'id', {
      ...(props ?? {}),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'spaHandler.handler',
      code: lambda.AssetCode.fromAsset('../lambda/resources/lib'),
      role: props?.role ?? new EdgeRole(scope, `${id}-role`),
    });
  }
}
