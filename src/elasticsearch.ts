import { winstonLogger } from '@benjaminalcala/gigl-shared';
import { Client } from '@elastic/elasticsearch';
import { config } from '@gateway/config';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayServer', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`,
      auth: {
        username: 'elastic',
        password: 'admin1234'
      }
    });
  }

  async checkConnection() {
    let isHealthy = false;
    while (!isHealthy) {
      try {
        const health = await this.elasticSearchClient.cluster.health();
        log.info('Gateway service Elasticsearch cluster health status - ', health.status);
        isHealthy = true;
      } catch (error) {
        log.error('Connection to Elasticsearch failed. Retrying...');
        log.error(`Gateway service checkElasticHealth() error: ${error}`);
      }
    }
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();
