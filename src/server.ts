import http from 'http';

import { CustomError, IErrorResponse, winstonLogger } from '@benjaminalcala/gigl-shared';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { Application, NextFunction, json, urlencoded, Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
import { elasticSearch } from '@gateway/elasticsearch';
import { getGatewayRoutes } from '@gateway/routes';

const SERVER_PORT = 4000;
const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayServer', 'debug');

export class GatewayServer {
  constructor(private app: Application) {}

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],

        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: config.NODE_ENV !== 'development'
        //sameSite: none
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: '',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    getGatewayRoutes(app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.error(`${fullUrl} endpoint does not exist`);
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist' });
      next();
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(`GatewayService ${error.comingFrom}: ${error}`);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const server: http.Server = new http.Server(app);
      this.startHttpServer(server);
    } catch (error) {
      log.error(`Gateway Service startServer(): ${error}`);
    }
  }

  private async startHttpServer(server: http.Server): Promise<void> {
    try {
      log.info(`Gateway Service has started with pid: ${process.pid}`);
      server.listen(SERVER_PORT, () => {
        log.info(`Gateway Service is running on port: ${SERVER_PORT}`);
      });
    } catch (error) {
      log.error(`Gateway Service startHttpServer(): ${error}`);
    }
  }
}
