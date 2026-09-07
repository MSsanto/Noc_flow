/* Desenvolvido por Matheus Santo */
(function () {
    'use strict';
    const config = window.NOCFLOW_CONFIG;
    if (!config || !Array.isArray(config.base?.records) || !config.templates) throw new Error('Configuração da operação inválida.');

    window.NocFlowConfig = {
        renderTemplate(name, values) {
            const template = config.templates[name];
            if (typeof template !== 'string') throw new Error('Modelo de comunicado não encontrado: ' + name);
            return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
        }
    };

    document.querySelector('.page-title h1').textContent = 'Ocorrências · ' + config.operationName;

    for (const id of ['updateOperadora', 'normOperadora']) {
        const select = document.getElementById(id);
        select.replaceChildren(new Option('Selecione...', ''));
        config.carriers.forEach(name => select.add(new Option(name, name)));
    }

    const severity = document.getElementById('alertSeverity');
    config.severities.forEach(name => severity.add(new Option(name, name)));
    severity.value = config.defaultSeverity;

    window.addEventListener('load', () => {
        if (!document.querySelector('link[data-nocflow-ux="1.1"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/ux-v1.1.css';
            link.dataset.nocflowUx = '1.1';
            document.head.appendChild(link);
        }

        if (!document.querySelector('script[data-nocflow-ux="1.1"]')) {
            const script = document.createElement('script');
            script.src = 'assets/js/ux-v1.1.js';
            script.dataset.nocflowUx = '1.1';
            script.onload = () => {
                if (document.querySelector('script[data-nocflow-version="1.1"]')) return;
                const bridge = document.createElement('script');
                bridge.src = 'assets/js/version-v1.1.js';
                bridge.dataset.nocflowVersion = '1.1';
                document.body.appendChild(bridge);
            };
            document.body.appendChild(script);
        }
    }, { once: true });
})();
