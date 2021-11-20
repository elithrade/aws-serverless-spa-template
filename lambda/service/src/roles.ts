import { APIGatewayProxyEventV2 } from 'aws-lambda';

export enum Roles {
  Member = 'Member',
}

export function getRoles(event: APIGatewayProxyEventV2): string[] {
  const rolesStr = event.requestContext.authorizer?.jwt?.claims.roles;
  let roles: string[] = [];
  if (
    typeof rolesStr === 'string' &&
    rolesStr.startsWith('[') &&
    rolesStr.endsWith(']')
  ) {
    roles = rolesStr.substring(1, rolesStr.length - 1).split(' ');
  } else if (Array.isArray(rolesStr)) {
    roles = rolesStr;
  }
  return roles;
}
