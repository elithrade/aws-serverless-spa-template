import * as core from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

/**
 * EdgeRole properties are equivalent to Role Properties,
 * omitting 'assumedBy' which is is set by the EdgeRole directly.
 */
export interface EdgeRoleProps extends Omit<iam.RoleProps, 'assumedBy'> {}

/**
 * The EdgeRole constructs provides an IAM role suitable for lambda and
 * lambda at edge. It is used by `SpaFunction` and `StsFunction` as a default
 * role value, and allows it to be assumed by either lambda or edge lambda
 * service principals
 */
export class EdgeRole extends iam.Role {
  /**
   * Instantiates and instance of an EdgeRole
   * @param scope Parent of the construct
   * @param id The construct Id of this role
   * @param props Role properties
   */
  constructor(scope: core.Construct, id: string, props?: EdgeRoleProps) {
    const wrappedProps = {
      ...(props ?? {}),
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
    };
    super(scope, id, wrappedProps);
  }
}
