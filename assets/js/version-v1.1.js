/* NOC Flow v1.1.0 — compatibilidade de metadados públicos. */
(function () {
    'use strict';

    const configuredVersion = `v${String(window.NOCFLOW_CONFIG?.version || '1.1.0').replace(/^v/i, '')}`;

    if (typeof window.createBackupPayload === 'function') {
        const originalCreateBackupPayload = window.createBackupPayload;
        window.createBackupPayload = function () {
            const payload = originalCreateBackupPayload();
            payload.nocflowVersion = configuredVersion;
            return payload;
        };
    }

    const metricsButton = document.getElementById('exportMetricsBtn');
    if (metricsButton && typeof window.renderMetrics === 'function' && typeof window.downloadTextFile === 'function') {
        metricsButton.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const metrics = window.renderMetrics();
            const payload = {
                nocflowVersion: configuredVersion,
                exportedAt: new Date().toISOString(),
                ...metrics,
                estimatesMinutesPerAction: window.NOCFLOW_CONFIG?.estimatesMinutesPerAction ?? null,
                note: 'Indicadores locais da demonstração; estimativas dependem de medição documentada.'
            };
            window.downloadTextFile(
                JSON.stringify(payload, null, 2),
                `NOC_Flow_metricas_${metrics.shiftId}.json`,
                'application/json;charset=utf-8'
            );
        }, true);
    }
})();
