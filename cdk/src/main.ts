#!/bin/env node

import { App } from '@aws-cdk/core';
import { ServiceStack } from './ServiceStack';
import { SpaStack } from './SpaStack';

const app = new App();
const regions = ['us-east-2', 'ap-southeast-2'];

const env = app.node.tryGetContext('env');

regions.map(
  (region) =>
    new ServiceStack(app, `${app.stageName}-service-${region}`, {
      env: {
        ...env,
        region,
      },
    })
);

new SpaStack(app, `${app.stageName}-spa`, {
  env: {
    ...env,
    region: 'us-east-1',
  },
});
