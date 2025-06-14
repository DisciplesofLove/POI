import { ethers } from 'ethers';
import { NodeMonitor__factory } from '../../typechain/factories/NodeMonitor__factory';
import { config } from '../config';
import { MetricsReporter } from './metrics';

export class NodeHealthChecker {
    private nodeMonitor: NodeMonitor;
    private metricsReporter: MetricsReporter;
    private checkInterval: NodeJS.Timeout;

    constructor(
        private readonly provider: ethers.providers.Provider,
        private readonly nodeAddress: string
    ) {
        this.nodeMonitor = NodeMonitor__factory.connect(
            config.monitoring.nodeMonitor.contractAddress,
            this.provider
        );
        this.metricsReporter = new MetricsReporter();
    }

    public async startMonitoring(): Promise<void> {
        await this.checkNodeHealth();
        this.checkInterval = setInterval(
            () => this.checkNodeHealth(),
            config.monitoring.nodeMonitor.updateInterval * 1000
        );
    }

    public stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    private async checkNodeHealth(): Promise<void> {
        try {
            const startTime = Date.now();
            const [isHealthy, score] = await this.nodeMonitor.getNodeHealth(this.nodeAddress);
            const responseTime = Date.now() - startTime;

            await this.nodeMonitor.updateNodeHealth(this.nodeAddress, responseTime);

            // Report metrics
            this.metricsReporter.reportNodeHealth(this.nodeAddress, {
                isHealthy,
                score,
                responseTime
            });

            // Check thresholds and trigger alerts if necessary
            this.checkThresholds(score, responseTime);
        } catch (error) {
            console.error('Error checking node health:', error);
            this.metricsReporter.reportNodeError(this.nodeAddress);
        }
    }

    private checkThresholds(healthScore: number, responseTime: number): void {
        const { critical, warning } = config.monitoring.thresholds.nodeHealth;

        if (healthScore < critical) {
            this.triggerAlert('CRITICAL', `Node health score critical: ${healthScore}`);
        } else if (healthScore < warning) {
            this.triggerAlert('WARNING', `Node health score warning: ${healthScore}`);
        }

        if (responseTime > config.monitoring.thresholds.responseTime.critical) {
            this.triggerAlert('CRITICAL', `Response time critical: ${responseTime}ms`);
        } else if (responseTime > config.monitoring.thresholds.responseTime.warning) {
            this.triggerAlert('WARNING', `Response time warning: ${responseTime}ms`);
        }
    }

    private async triggerAlert(level: 'WARNING' | 'CRITICAL', message: string): Promise<void> {
        // Implement alert notifications (Slack, email, etc.)
        console.log(`[${level}] ${message}`);
    }
}