import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

export class Health {
  public static health(_req: Request, res: Response): void {
    res.status(StatusCodes.OK).send('Gateway service is healthy');
  }
}
