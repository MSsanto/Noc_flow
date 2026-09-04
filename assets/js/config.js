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
}) ();
