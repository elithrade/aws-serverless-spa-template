import * as lambda from '@aws-cdk/aws-lambda';
import * as core from '@aws-cdk/core';
import * as apigateway_v2 from '@aws-cdk/aws-apigatewayv2';
import * as certificate_manager from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53_targets from '@aws-cdk/aws-route53-targets';
import { determineFullyQualifiedDomainName } from '@aws-cdk/aws-route53/lib/util';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { CfnHealthCheck } from '@aws-cdk/aws-route53';
import { HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';

export class ServiceStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const serviceContext = this.node.tryGetContext('service');

    if (!serviceContext) {
      throw new Error('Missing context "service"');
    }

    const zoneName = serviceContext.zoneName;
    const siteName = serviceContext.siteName;

    if (
      typeof zoneName !== 'string' ||
      typeof siteName !== 'string' ||
      !siteName.endsWith(zoneName)
    ) {
      throw new Error('Invalid configuration of service site name.');
    }

    const hostedZone = route53.HostedZone.fromLookup(this, 'zone', {
      domainName: zoneName,
    });

    const cert = new certificate_manager.DnsValidatedCertificate(this, 'cert', {
      domainName: siteName,
      hostedZone,
    });

    const domainName = new apigateway_v2.DomainName(this, 'domain_name', {
      domainName: siteName,
      certificate: cert,
    });

    const handler = new lambda.Function(this, 'service', {
      code: lambda.AssetCode.fromAsset('../lambda/service/lib'),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
    });

    const integration = new LambdaProxyIntegration({ handler });

    const gw = new apigateway_v2.HttpApi(this, 'api', {
      defaultDomainMapping: {
        domainName,
      },
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', 'Accept'],
        allowMethods: [apigateway_v2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        maxAge: core.Duration.days(10),
      },
    });

    const authContext = serviceContext.auth;
    let authorizer = authContext;

    if (authContext) {
      const audience = serviceContext.audience;
      const issuer = serviceContext.issuer;

      authorizer = new HttpJwtAuthorizer({
        jwtAudience: [audience],
        jwtIssuer: issuer,
      });
    }

    gw.addRoutes({
      methods: [apigateway_v2.HttpMethod.GET],
      path: '/',
      integration,
    });

    gw.addRoutes({
      methods: [apigateway_v2.HttpMethod.GET],
      path: '/api/time',
      integration,
      authorizer,
    });

    const alias = new route53_targets.ApiGatewayv2DomainProperties(
      domainName.regionalDomainName,
      domainName.regionalHostedZoneId
    );

    const target = route53.RecordTarget.fromAlias(alias);

    const doHealthCheck = serviceContext.enableHealthChecks === true;
    const gwStack = core.Stack.of(gw);
    let healthCheck: CfnHealthCheck | undefined;
    if (doHealthCheck) {
      healthCheck = new route53.CfnHealthCheck(this, 'healthCheck', {
        healthCheckConfig: {
          fullyQualifiedDomainName: `${gw.apiId}.execute-api.${gwStack.region}.${gwStack.urlSuffix}`,
          type: 'HTTPS',
          measureLatency: true,
          requestInterval: 30,
        },
        healthCheckTags: [
          {
            key: 'Name',
            value: id,
          },
        ],
      });
    }

    new route53.CfnRecordSet(this, 'aRecordSet', {
      aliasTarget: {
        dnsName: domainName.regionalDomainName,
        hostedZoneId: domainName.regionalHostedZoneId,
        evaluateTargetHealth: true,
      },
      name: determineFullyQualifiedDomainName(siteName, hostedZone),
      hostedZoneId: hostedZone.hostedZoneId,
      resourceRecords: target.values,
      type: route53.RecordType.A,
      region: gwStack.region,
      setIdentifier: id,
      healthCheckId: healthCheck?.attrHealthCheckId,
    });
  }
}
