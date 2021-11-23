import * as core from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3_deployment from '@aws-cdk/aws-s3-deployment';
import * as certificate_manager from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53_targets from '@aws-cdk/aws-route53-targets';

export class SpaStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const spaContext = this.node.tryGetContext('spa');
    const serviceContext = this.node.tryGetContext('service');

    const zoneName = spaContext.zoneName;
    const siteName = spaContext.siteName;

    const serviceSiteName = serviceContext.siteName;

    if (
      typeof zoneName !== 'string' ||
      typeof siteName !== 'string' ||
      !siteName.endsWith(zoneName)
    ) {
      throw new Error('Invalid configuration of SPA site name.');
    }

    if (typeof serviceSiteName !== 'string') {
      throw new Error('Invalid configuration of API site name');
    }

    const hostedZone = route53.HostedZone.fromLookup(this, 'zone', {
      domainName: zoneName,
    });

    const cert = new certificate_manager.DnsValidatedCertificate(this, 'cert', {
      domainName: siteName,
      hostedZone,
    });

    const bucket = new s3.Bucket(this, 'bucket');

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'identity',
      {
        comment: `${id} access identity`,
      }
    );

    bucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      domainNames: [siteName],
      certificate: cert,
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
      },
      additionalBehaviors: {
        '/api/*': {
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: new cloudfront.CachePolicy(this, 'cachePolicy', {
            defaultTtl: core.Duration.seconds(0),
            minTtl: core.Duration.seconds(0),
            maxTtl: core.Duration.seconds(1),
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
              'Authorization',
              'Content-Type'
            ),
          }),
          origin: new origins.HttpOrigin(serviceSiteName),
        },
      },
    });

    new route53.ARecord(this, 'alias', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.CloudFrontTarget(distribution)
      ),
      recordName: siteName,
    });
    new route53.AaaaRecord(this, 'ipv6Alias', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.CloudFrontTarget(distribution)
      ),
      recordName: siteName,
    });

    new s3_deployment.BucketDeployment(this, 'deploy', {
      destinationBucket: bucket,
      distribution,
      sources: [s3_deployment.Source.asset('../../spa/dist')],
    });

    new core.CfnOutput(this, 'spaUrl', {
      exportName: `${id}-url`,
      value: `https://${siteName}`,
    });
  }
}