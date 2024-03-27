import { Health } from '@gateway/controllers/health';
import { Router } from 'express';

class GatewayHealthRoutes {
  private healthRoutes: Router;

  constructor() {
    this.healthRoutes = Router();
  }

  public getGatewayHealthRoutes(): Router {
    this.healthRoutes.get('/gateway-health', Health.health);
    return this.healthRoutes;
  }
}

export const gatewayHealthRoutes = new GatewayHealthRoutes();
