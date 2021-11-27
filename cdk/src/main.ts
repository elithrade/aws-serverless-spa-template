#!/bin/env node

import { App } from '@aws-cdk/core';
import { ServiceStack } from './ServiceStack';
import { SpaStack } from './SpaStack';

const app = new App();

const account = app.node.tryGetContext('account');
if (!account) {
  throw new Error('AWS account to deploy the stacks is undefined.');
}

const appName =
  app.node.tryGetContext('appName') ?? 'aws-serverless-spa-template';
const environment = app.node.tryGetContext('environment') ?? 'dev';
const region = app.node.tryGetContext('region') ?? 'us-east-1';

const stackPrefix = `${appName}-${region}-${environment}`;

new ServiceStack(app, `${stackPrefix}-service`, {
  env: {
    account,
    region,
  },
});

new SpaStack(app, `${stackPrefix}-spa`, {
  env: {
    account,
    region,
  },
});
