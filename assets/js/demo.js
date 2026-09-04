/* Demonstração sintética. Desenvolvido por Matheus Santo. */
(function () {
    document.getElementById('loadDemoBtn').addEventListener('click', () => {
        if (!window.confirm('Substituir as ocorrências locais do NOC Flow pelos exemplos fictícios? Exporte um backup se quiser conservar suas alterações.')) return;
        const now = new Date();
        const shift = window.NocFlowShift.getOperationalShift(now);
        const stamp = formatEventDateTime(now);
        const make = (index) => ({
            occurrenceId: 'demo-' + index,
            siteLocalidade: window.NOCFLOW_CONFIG.base.records[index - 1].unidade + ' - SP_' + (9000000 + index),
            dataHoraEvento: stamp, itsm: 'DEMO-ITSM-00' + index, numeroChamado: 'DEMO-00' + index,
            severidade: window.NOCFLOW_CONFIG.defaultSeverity, servicoImpactado: 'Conectividade WAN',
            ...window.NocFlowParser.getWanFields(new Set(['WAN 1'])),
            operadora: window.NOCFLOW_CONFIG.carriers[0], reportCategory: 'critical', reportResumo: '',
            sourceOrigin: 'local', isUpdated: false, sla: '', situacaoAtual: '', acoesRealizadas: '', proximosPassos: ''
        });
        const first = make(1);
        const second = {...make(2), isUpdated: true, dataHoraAtualizacao: stamp, reportCategory: 'update',
            situacaoAtual: 'Em análise pelo time interno', acoesRealizadas: 'Verificação simulada do enlace.', proximosPassos: 'Monitorar o serviço.'};
        const third = {...make(3), dataHoraNormalizacao: stamp, servicoAfetado: 'Conectividade WAN',
            causaIdentificada: 'Falha simulada de equipamento', acaoCorretivaRealizada: 'Reinicialização simulada', statusFinal: 'Normalizado'};
        const events = [['alert', first], ['alert', make(2)], ['update', second], ['alert', make(3)], ['normalization', third]]
            .map(([type, value], index) => ({...value, type, eventId: 'demo-event-' + index, shiftId: shift.id, timestampISO: now.toISOString()}));
        const storage = {
            nocflow_v1_ActiveAlerts: JSON.stringify([first, second]),
            ['nocflow_v1_Normalizations_' + shift.id]: JSON.stringify([third]),
            ['nocflow_v1_ShiftEvents_' + shift.id]: JSON.stringify(events),
            nocflow_v1_MigrationDone: '1'
        };
        // Only this application's occurrence keys are changed; other applications are untouched.
        const prefixes = ['nocflow_v1_ActiveAlerts', 'nocflow_v1_Normalizations_', 'nocflow_v1_ShiftEvents_', 'nocflow_v1_Metrics_'];
        Object.keys(localStorage).filter(key => prefixes.some(prefix => key.startsWith(prefix))).forEach(key => localStorage.removeItem(key));
        Object.entries(storage).forEach(([key, value]) => localStorage.setItem(key, value));
        setShiftLocalStorageKeys(); loadData(); renderAlerts(); renderNormalizations(); updateCounters();
    });
})();
