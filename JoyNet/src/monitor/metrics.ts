import client from 'prom-client';

export class MetricsReporter {
    private nodeHealthGauge: client.Gauge;
    private responseTimeHistogram: client.Histogram;
    private errorCounter: client.Counter;

    constructor() {
        // Initialize Prometheus metrics
        this.nodeHealthGauge = new client.Gauge({
            name: 'node_health_score',
            help: 'Health score of the RPC node',
            labelNames: ['node_address']
        });

        this.responseTimeHistogram = new client.Histogram({
            name: 'node_response_time',
            help: 'Response time of the RPC node',
            labelNames: ['node_address'],
            buckets: [100, 200, 500, 1000, 2000, 5000]
        });

        this.errorCounter = new client.Counter({
            name: 'node_health_check_errors',
            help: 'Number of errors during health checks',
            labelNames: ['node_address']
        });
    }

    public reportNodeHealth(
        nodeAddress: string,
        metrics: { isHealthy: boolean; score: number; responseTime: number }
    ): void {
        this.nodeHealthGauge.set({ node_address: nodeAddress }, metrics.score);
        this.responseTimeHistogram.observe(
            { node_address: nodeAddress },
            metrics.responseTime
        );
    }

    public reportNodeError(nodeAddress: string): void {
        this.errorCounter.inc({ node_address: nodeAddress });
    }
}