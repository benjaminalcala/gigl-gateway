import { config } from '@gateway/config';
import axios from 'axios';
import { sign } from 'jsonwebtoken';

export class AxiosService {
  public axiosConnection: ReturnType<typeof axios.create>;

  constructor(baseUrl: string, service?: string) {
    this.axiosConnection = this.createAxiosConnection(baseUrl, service);
  }

  public createAxiosConnection(baseUrl: string, service?: string): ReturnType<typeof axios.create> {
    let requestGatewayToken = '';
    if (service) {
      requestGatewayToken = sign({ id: service }, `${config.GATEWAY_JWT_TOKEN}`);
    }
    const connection = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken: requestGatewayToken
      },
      withCredentials: true
    });
    return connection;
  }
}
