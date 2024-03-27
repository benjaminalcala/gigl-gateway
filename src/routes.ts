import { Application } from 'express';
import { gatewayHealthRoutes } from '@gateway/routes/health';

export function getGatewayRoutes(app: Application): void {
  app.use('', gatewayHealthRoutes.getGatewayHealthRoutes());
}
