import express, { Express } from 'express';
import { GatewayServer } from '@gateway/server';

class Application {
  public initialize() {
    const app: Express = express();
    const server = new GatewayServer(app);
    server.start();
  }
}

const app: Application = new Application();
app.initialize();
