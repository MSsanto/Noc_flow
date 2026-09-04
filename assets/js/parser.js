

(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.NocFlowParser = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const DEFAULT_GROUP_WINDOW_MS = 60 * 1000;

    function formatSiteForDisplay(siteString) {
        return String(siteString || '').trim();
    }

    function normalizeSiteForMatch(site) {
        return formatSiteForDisplay(site)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[’'`]/g, '')
            .replace(/\s*-\s*/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseAlertTimestamp(timestamp, now = new Date()) {
        const value = String(timestamp || '').trim();
        let match = value.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})\s*(\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
            const [, day, month, year, hours, minutes, seconds] = match.map(Number);
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        match = value.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
            const [, hours, minutes, seconds] = match.map(Number);
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
        }
        return null;
    }

    function normalizeMonitoringClipboard(rawInput) {
        return String(rawInput || '')
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/\[([^\]]+)\]\((?:\\.|[^)])*\)/g, '$1')
            .replace(/\\([_&():])/g, '$1')
            .replace(/&nbsp;|&#x20;/gi, ' ');
    }

    function processAlertLines(rawInput, options = {}) {
        const now = options.now instanceof Date ? options.now : new Date();
        const groupWindowMs = Number.isFinite(options.groupWindowMs) ? options.groupWindowMs : DEFAULT_GROUP_WINDOW_MS;
        const normalizedInput = normalizeMonitoringClipboard(rawInput);
        const lineRegex = /((?:\d{2}[-\/]\d{2}[-\/]\d{4}\s*)?\d{2}:\d{2}:\d{2}).*?Monitoramento\s*(?:\|\s*)?(.*?)\s*-\s*(WAN\s*[12])\s+com\s+problemas!/i;
        const groups = [];

        normalizedInput.split(/\r?\n/).forEach(line => {
            const cleanedLine = line.trim().replace(/\s+/g, ' ');
            if (!cleanedLine) return;

            const match = cleanedLine.match(lineRegex);
            if (!match) return;

            const eventDate = parseAlertTimestamp(match[1], now);
            const siteLocalidade = match[2]
                .replace(/^\|\s*/, '')
                .replace(/\s*\|\s*$/, '')
                .trim();
            const wanStatus = match[3].replace(/\s+/g, ' ').toUpperCase();
            if (!eventDate || !siteLocalidade) return;

            const siteKey = normalizeSiteForMatch(siteLocalidade);
            let group = groups.find(candidate =>
                candidate.siteKey === siteKey &&
                Math.abs(candidate.eventDate.getTime() - eventDate.getTime()) <= groupWindowMs
            );

            if (!group) {
                group = {
                    eventDate,
                    siteKey,
                    siteLocalidade,
                    wanStatuses: new Set()
                };
                groups.push(group);
            } else if (eventDate < group.eventDate) {
                group.eventDate = eventDate;
            }

            group.wanStatuses.add(wanStatus);
        });

        return groups;
    }

    function getWanFields(wanStatuses) {
        if (wanStatuses.has('WAN 1') && wanStatuses.has('WAN 2')) {
            return {
                servidorEquipamentoAfetado: 'WAN 1 e WAN 2 (Links de Internet)',
                sintomaObservado: 'Failed (WAN 1) e Failed (WAN 2)',
                analiseInicial: 'Link inoperante, validando queda de energia na localidade',
                acoesImediatas: 'Validando queda de energia na localidade com o consultor de unidade',
                wanStatus: 'WAN 1 e WAN 2'
            };
        }
        if (wanStatuses.has('WAN 1')) {
            return {
                servidorEquipamentoAfetado: 'WAN 1 (Link de Internet)',
                sintomaObservado: 'Failed (WAN 1)',
                analiseInicial: 'Link inoperante',
                acoesImediatas: 'Abrindo chamado com a operadora',
                wanStatus: 'WAN 1'
            };
        }
        if (wanStatuses.has('WAN 2')) {
            return {
                servidorEquipamentoAfetado: 'WAN 2 (Link de Internet)',
                sintomaObservado: 'Failed (WAN 2)',
                analiseInicial: 'Link inoperante',
                acoesImediatas: 'Abrindo chamado com a operadora',
                wanStatus: 'WAN 2'
            };
        }
        return null;
    }

    return {
        DEFAULT_GROUP_WINDOW_MS,
        formatSiteForDisplay,
        normalizeSiteForMatch,
        parseAlertTimestamp,
        normalizeMonitoringClipboard,
        processAlertLines,
        getWanFields
    };
});


