import healthCheck from './healthCheck';

describe('health check', () => {
  it('should reply 200', async () => {
    const response = await healthCheck();
    expect(response.statusCode).toBe(200);
  });
});
