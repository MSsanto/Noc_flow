

// NOC Flow v1.0.0 - desenvolvido por Matheus Santo
        // Release candidate local: continuidade 12x36, backup, métricas e testes do parser.

        const NOCFLOW_VERSION = 'v1.0.0';
        const WAN_GROUP_WINDOW_MS = 60 * 1000;
        const ACTIVE_ALERTS_KEY = 'nocflow_v1_ActiveAlerts';
        const NORMALIZATIONS_PREFIX = 'nocflow_v1_Normalizations_';
        const SHIFT_LOG_PREFIX = 'nocflow_v1_ShiftEvents_';
        const METRICS_PREFIX = 'nocflow_v1_Metrics_';
        const MIGRATION_MARKER_KEY = 'nocflow_v1_MigrationDone';
        const METRIC_ESTIMATES_MINUTES = window.NOCFLOW_CONFIG.estimatesMinutesPerAction;

        let localStorageActiveAlertsKey = ACTIVE_ALERTS_KEY;
        let localStorageNormalizationsKey;
        let currentShiftId = '';

        let activeAlerts = [];
        let normalizations = [];

        let currentInitialAlertSortCriteria = 'date';
        let currentUpdatedAlertSortCriteria = 'date';
        let currentNormalizationSortCriteria = 'date';

        // DOM
        const addAlertBtn = document.getElementById('addAlertBtn');
        const addNormalizationBtn = document.getElementById('addNormalizationBtn');
        const addUpdateBtn = document.getElementById('addUpdateBtn');
        const initialAlertsContainer = document.getElementById('initialAlertsContainer');
        const updatedAlertsContainer = document.getElementById('updatedAlertsContainer');
        const normalizationsContainer = document.getElementById('normalizationsContainer');
        const noInitialAlerts = document.getElementById('noInitialAlerts');
        const noUpdatedAlerts = document.getElementById('noUpdatedAlerts');
        const noNormalizations = document.getElementById('noNormalizations');
        const exportAllDataCsvBtn = document.getElementById('exportAllDataCsvBtn');
        const backupDataBtn = document.getElementById('backupDataBtn');
        const restoreDataBtn = document.getElementById('restoreDataBtn');
        const restoreDataInput = document.getElementById('restoreDataInput');
        const openMetricsBtn = document.getElementById('openMetricsBtn');
        const activeSitesList = document.getElementById('activeSitesList');

        const updateSiteInput = document.getElementById('updateSite');
        const updateItsmInput = document.getElementById('updateItsm');
        const updateNumeroChamadoInput = document.getElementById('updateNumeroChamado');
        const updateOperadoraSelect = document.getElementById('updateOperadora');
        const updateWanStatusSelect = document.getElementById('updateWanStatus');
        const updateSlaInput = document.getElementById('updateSla');
        const updateReportCategorySelect = document.getElementById('updateReportCategory');
        const updateReportResumoInput = document.getElementById('updateReportResumo');
        const updateSituacaoAtualSelect = document.getElementById('updateSituacaoAtual');
        const updateAcoesRealizadasInput = document.getElementById('updateAcoesRealizadas');
        const updateProximosPassosSelect = document.getElementById('updateProximosPassos');

        const normSiteInput = document.getElementById('normSite');
        const normItsmInput = document.getElementById('normItsm');
        const normNumeroChamadoInput = document.getElementById('normNumeroChamado');
        const normOperadoraSelect = document.getElementById('normOperadora');
        const normWanStatusSelect = document.getElementById('normWanStatus');
        const normCauseSelect = document.getElementById('normCause');
        const normActionSelect = document.getElementById('normAction');

        const sortInitialAlertsByDateBtn = document.getElementById('sortInitialAlertsByDateBtn');
        const sortInitialAlertsByTimeBtn = document.getElementById('sortInitialAlertsByTimeBtn');
        const sortInitialAlertsBySiteBtn = document.getElementById('sortInitialAlertsBySiteBtn');
        const sortUpdatedAlertsByDateBtn = document.getElementById('sortUpdatedAlertsByDateBtn');
        const sortUpdatedAlertsByTimeBtn = document.getElementById('sortUpdatedAlertsByTimeBtn');
        const sortUpdatedAlertsBySiteBtn = document.getElementById('sortUpdatedAlertsBySiteBtn');
        const sortNormalizationsByDateBtn = document.getElementById('sortNormalizationsByDateBtn');
        const sortNormalizationsByTimeBtn = document.getElementById('sortNormalizationsByTimeBtn');
        const sortNormalizationsBySiteBtn = document.getElementById('sortNormalizationsBySiteBtn');

        const goToInitialAlertsBtn = document.getElementById('goToInitialAlertsBtn');
        const goToUpdatedAlertsBtn = document.getElementById('goToUpdatedAlertsBtn');
        const goToNormalizationsBtn = document.getElementById('goToNormalizationsBtn');

        const messageModal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const decisionModal = document.getElementById('decisionModal');
        const decisionTitle = document.getElementById('decisionTitle');
        const decisionMessage = document.getElementById('decisionMessage');
        const decisionNote = document.getElementById('decisionNote');
        const decisionConfirmBtn = document.getElementById('decisionConfirmBtn');
        const decisionCancelBtn = document.getElementById('decisionCancelBtn');
        let pendingDecisionAction = null;

        const currentDateTimeSpan = document.getElementById('currentDateTime');
        const activeAlertsCountSpan = document.getElementById('activeAlertsCount');
        const updatedAlertsCountSpan = document.getElementById('updatedAlertsCount');
        const normalizationsCountSpan = document.getElementById('normalizationsCount');

        const openShiftReportBtn = document.getElementById('openShiftReportBtn');
        const shiftReportModal = document.getElementById('shiftReportModal');
        const closeShiftReportBtn = document.getElementById('closeShiftReportBtn');
        const shiftReportDateInput = document.getElementById('shiftReportDate');
        const shiftStartTimeInput = document.getElementById('shiftStartTime');
        const shiftEndTimeInput = document.getElementById('shiftEndTime');
        const generateShiftReportBtn = document.getElementById('generateShiftReportBtn');
        const shiftReportPreview = document.getElementById('shiftReportPreview');
        const shiftReportMeta = document.getElementById('shiftReportMeta');
        const copyShiftReportBtn = document.getElementById('copyShiftReportBtn');
        const downloadShiftReportBtn = document.getElementById('downloadShiftReportBtn');
        const exportShiftCsvBtn = document.getElementById('exportShiftCsvBtn');

        const metricsModal = document.getElementById('metricsModal');
        const closeMetricsBtn = document.getElementById('closeMetricsBtn');
        const metricsShiftLabel = document.getElementById('metricsShiftLabel');
        const metricAlerts = document.getElementById('metricAlerts');
        const metricUpdates = document.getElementById('metricUpdates');
        const metricNormalizations = document.getElementById('metricNormalizations');
        const metricReports = document.getElementById('metricReports');
        const metricActions = document.getElementById('metricActions');
        const metricTimeSaved = document.getElementById('metricTimeSaved');
        const exportMetricsBtn = document.getElementById('exportMetricsBtn');

        function showModal(title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            messageModal.classList.remove('hidden');
        }

        function hideModal() {
            messageModal.classList.add('hidden');
        }

        modalCloseBtn.addEventListener('click', hideModal);
        messageModal.addEventListener('click', (event) => {
            if (event.target === messageModal) hideModal();
        });

        function hideDecisionModal() {
            decisionModal.classList.add('hidden');
            pendingDecisionAction = null;
        }

        function showDecisionModal({ title, message, note, confirmText, tone = 'orange', onConfirm }) {
            decisionTitle.textContent = title;
            decisionMessage.textContent = message;
            decisionNote.textContent = note || '';
            decisionNote.style.display = note ? 'block' : 'none';
            decisionConfirmBtn.textContent = confirmText;
            decisionConfirmBtn.classList.remove('orange', 'green');
            decisionConfirmBtn.classList.add(tone === 'green' ? 'green' : 'orange');
            pendingDecisionAction = typeof onConfirm === 'function' ? onConfirm : null;
            decisionModal.classList.remove('hidden');
        }

        decisionCancelBtn.addEventListener('click', hideDecisionModal);
        decisionConfirmBtn.addEventListener('click', () => {
            const action = pendingDecisionAction;
            decisionModal.classList.add('hidden');
            pendingDecisionAction = null;
            if (action) action();
        });
        decisionModal.addEventListener('click', event => { if (event.target === decisionModal) hideDecisionModal(); });

        async function copyToClipboard(textToCopy, targetElement) {
            let copied = false;
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    copied = true;
                } catch (error) {
                    console.warn('Clipboard API indisponível; usando fallback.', error);
                }
            }

            if (!copied) {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = textToCopy;
                tempTextArea.style.position = 'fixed';
                tempTextArea.style.opacity = '0';
                document.body.appendChild(tempTextArea);
                tempTextArea.focus();
                tempTextArea.select();
                copied = document.execCommand('copy');
                document.body.removeChild(tempTextArea);
            }

            if (!copied) {
                showModal('Erro', 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
                return;
            }

            const oldFeedback = targetElement.querySelector('.copy-feedback');
            if (oldFeedback) oldFeedback.remove();

            const feedbackSpan = document.createElement('span');
            feedbackSpan.textContent = 'Copiado!';
            feedbackSpan.classList.add('copy-feedback');
            targetElement.appendChild(feedbackSpan);
            requestAnimationFrame(() => feedbackSpan.classList.add('show'));
            setTimeout(() => {
                feedbackSpan.classList.remove('show');
                setTimeout(() => feedbackSpan.remove(), 350);
            }, 1500);
        }

        function pad2(value) {
            return String(value).padStart(2, '0');
        }

        function getDateKey(date = new Date()) {
            return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
        }

        function formatEventDateTime(date) {
            return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
        }

        function formatLocaleDateTime(date = new Date()) {
            return date.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }

        function parseDateTime(dateString) {
            const value = String(dateString || '').trim().replace(',', '');
            const fullDateTimeMatch = value.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
            if (fullDateTimeMatch) {
                const [, day, month, year, hours, minutes, seconds] = fullDateTimeMatch.map(Number);
                return new Date(year, month - 1, day, hours, minutes, seconds);
            }

            const timeOnlyMatch = value.match(/^(\d{2}):(\d{2}):(\d{2})$/);
            if (timeOnlyMatch) {
                const now = new Date();
                const [, hours, minutes, seconds] = timeOnlyMatch.map(Number);
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
            }

            return new Date(0);
        }

        function parseTimeOnlyString(dateString) {
            const timeMatch = String(dateString || '').match(/(\d{2}:\d{2}:\d{2})$/);
            return timeMatch ? timeMatch[1] : '';
        }

        const { getOperationalShift, currentShiftWindow, formatDateBr } = window.NocFlowShift || {};

        if (typeof getOperationalShift !== 'function' || typeof currentShiftWindow !== 'function') {
            throw new Error('NOC Flow Shift não carregado. Verifique assets/js/shift.js.');
        }

        function setShiftLocalStorageKeys(date = new Date()) {
            const shift = getOperationalShift(date);
            currentShiftId = shift.id;
            localStorageActiveAlertsKey = ACTIVE_ALERTS_KEY;
            localStorageNormalizationsKey = `${NORMALIZATIONS_PREFIX}${currentShiftId}`;
            return shift;
        }

        function safeParseArray(raw, fallback = []) {
            if (!raw) return fallback;
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : fallback;
            } catch (error) {
                console.error('Falha ao ler dados do localStorage:', error);
                return fallback;
            }
        }

        function createOccurrenceId() {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
            return `occ_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        }

        function ensureDataShape() {
            activeAlerts = activeAlerts.map(alert => ({
                occurrenceId: alert.occurrenceId || createOccurrenceId(),
                itsm: alert.itsm || '',
                sla: alert.sla || '',
                reportCategory: alert.reportCategory || 'critical',
                reportResumo: alert.reportResumo || '',
                operadora: alert.operadora || '',
                sourceOrigin: alert.sourceOrigin || 'local',
                ...alert
            }));
            normalizations = normalizations.map(norm => ({
                occurrenceId: norm.occurrenceId || createOccurrenceId(),
                itsm: norm.itsm || '',
                sla: norm.sla || '',
                operadora: norm.operadora || '',
                wanStatus: norm.wanStatus || 'WAN',
                reportResumo: norm.reportResumo || '',
                sourceOrigin: norm.sourceOrigin || 'local',
                ...norm
            }));
        }

        function getShiftLogKey(shiftId) {
            return `${SHIFT_LOG_PREFIX}${shiftId}`;
        }

        function readShiftEvents(shiftId) {
            return safeParseArray(localStorage.getItem(getShiftLogKey(shiftId)));
        }

        function writeShiftEvents(shiftId, events) {
            try {
                localStorage.setItem(getShiftLogKey(shiftId), JSON.stringify(events));
            } catch (error) {
                console.error('Falha ao salvar histórico de turno:', error);
            }
        }

        function snapshotOccurrence(source) {
            return JSON.parse(JSON.stringify(source || {}));
        }

        function appendShiftEvent(type, source, occurredAt = new Date()) {
            const timestamp = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
            const shift = getOperationalShift(timestamp);
            const events = readShiftEvents(shift.id);
            events.push({
                eventId: createOccurrenceId(),
                type,
                shiftId: shift.id,
                timestampISO: timestamp.toISOString(),
                occurrenceId: source.occurrenceId || createOccurrenceId(),
                ...snapshotOccurrence(source)
            });
            writeShiftEvents(shift.id, events);
        }

        function dedupeOccurrences(items) {
            const map = new Map();
            items.forEach(item => {
                const key = item.occurrenceId || `${normalizeSiteForMatch(item.siteLocalidade)}|${item.dataHoraEvento || ''}`;
                if (!key) return;
                const previous = map.get(key);
                if (!previous || parseDateTime(item.dataHoraAtualizacao || item.dataHoraEvento) >= parseDateTime(previous.dataHoraAtualizacao || previous.dataHoraEvento)) {
                    map.set(key, item);
                }
            });
            return [...map.values()];
        }

        function persistCurrentData() {
            try {
                localStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(activeAlerts));
                localStorage.setItem(localStorageNormalizationsKey, JSON.stringify(normalizations));
            } catch (error) {
                console.error('Falha ao salvar dados:', error);
                showModal('Erro de armazenamento', 'Não foi possível salvar os dados no navegador. Faça um backup JSON e verifique o armazenamento local.');
            }
        }

        function rolloverShiftStorageIfNeeded() {
            const shift = getOperationalShift();
            if (!currentShiftId) {
                setShiftLocalStorageKeys();
                return;
            }
            if (shift.id === currentShiftId) return;

            // A mudança operacional ocorre somente às 06:00 ou 18:00. Meia-noite não encerra turno.
            persistCurrentData();
            setShiftLocalStorageKeys();
            activeAlerts = safeParseArray(localStorage.getItem(ACTIVE_ALERTS_KEY));
            normalizations = safeParseArray(localStorage.getItem(localStorageNormalizationsKey));
            ensureDataShape();
            persistCurrentData();
            renderAlerts();
            renderNormalizations();
        }

        function saveData() {
            rolloverShiftStorageIfNeeded();
            persistCurrentData();
            updateCounters();
        }

        function loadData() {
            // Validação isolada: não importar dados do NOC Flow operacional.
            localStorage.setItem(MIGRATION_MARKER_KEY, '1');
            activeAlerts = safeParseArray(localStorage.getItem(ACTIVE_ALERTS_KEY));
            normalizations = safeParseArray(localStorage.getItem(localStorageNormalizationsKey));
            ensureDataShape();
            updateCounters();
        }

        function sortAlertsArray(alertsArray, criteria) {
            alertsArray.sort((a, b) => {
                if (criteria === 'date') {
                    const delta = parseDateTime(b.dataHoraEvento) - parseDateTime(a.dataHoraEvento);
                    return delta || String(a.siteLocalidade).localeCompare(String(b.siteLocalidade), 'pt-BR');
                }
                if (criteria === 'time') {
                    const timeComparison = parseTimeOnlyString(b.dataHoraEvento).localeCompare(parseTimeOnlyString(a.dataHoraEvento));
                    return timeComparison || (parseDateTime(b.dataHoraEvento) - parseDateTime(a.dataHoraEvento));
                }
                if (criteria === 'site') {
                    const siteComparison = String(a.siteLocalidade).localeCompare(String(b.siteLocalidade), 'pt-BR');
                    return siteComparison || (parseDateTime(b.dataHoraEvento) - parseDateTime(a.dataHoraEvento));
                }
                return 0;
            });
        }

        function sortNormalizationsArray(normalizationsArray, criteria) {
            normalizationsArray.sort((a, b) => {
                if (criteria === 'date') {
                    const delta = parseDateTime(b.dataHoraNormalizacao) - parseDateTime(a.dataHoraNormalizacao);
                    return delta || String(a.siteLocalidade).localeCompare(String(b.siteLocalidade), 'pt-BR');
                }
                if (criteria === 'time') {
                    const timeComparison = parseTimeOnlyString(b.dataHoraNormalizacao).localeCompare(parseTimeOnlyString(a.dataHoraNormalizacao));
                    return timeComparison || (parseDateTime(b.dataHoraNormalizacao) - parseDateTime(a.dataHoraNormalizacao));
                }
                if (criteria === 'site') {
                    const siteComparison = String(a.siteLocalidade).localeCompare(String(b.siteLocalidade), 'pt-BR');
                    return siteComparison || (parseDateTime(b.dataHoraNormalizacao) - parseDateTime(a.dataHoraNormalizacao));
                }
                return 0;
            });
        }

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

        function extractSiteCode(site) {
            const match = String(site || '').match(/\b[A-Z]{2,5}_\d+\b/i);
            return match ? match[0].toLowerCase() : '';
        }

        function getSiteBaseKey(site) {
            return normalizeSiteForMatch(site)
                .replace(/-[a-z]{2,5}_\d+\b.*$/i, '')
                .replace(/-[a-z]{2,5}$/i, '')
                .replace(/-+$/, '');
        }

        function findAlertMatch(siteInput) {
            const input = String(siteInput || '').trim();
            if (!input) return { alert: null, index: -1, ambiguous: false };

            const exactKey = normalizeSiteForMatch(input);
            let index = activeAlerts.findIndex(alert => normalizeSiteForMatch(alert.siteLocalidade) === exactKey);
            if (index !== -1) return { alert: activeAlerts[index], index, ambiguous: false };

            const inputCode = extractSiteCode(input);
            if (inputCode) {
                const codeMatches = activeAlerts
                    .map((alert, alertIndex) => ({ alert, alertIndex }))
                    .filter(item => extractSiteCode(item.alert.siteLocalidade) === inputCode);
                if (codeMatches.length === 1) {
                    return { alert: codeMatches[0].alert, index: codeMatches[0].alertIndex, ambiguous: false };
                }
                if (codeMatches.length > 1) return { alert: null, index: -1, ambiguous: true };
            }

            const baseKey = getSiteBaseKey(input);
            const baseMatches = activeAlerts
                .map((alert, alertIndex) => ({ alert, alertIndex }))
                .filter(item => getSiteBaseKey(item.alert.siteLocalidade) === baseKey);

            if (baseMatches.length === 1) {
                return { alert: baseMatches[0].alert, index: baseMatches[0].alertIndex, ambiguous: false };
            }
            return { alert: null, index: -1, ambiguous: baseMatches.length > 1 };
        }

        function normalizeIdentifier(value) {
            return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
        }

        function findActiveOccurrenceMatch({ site = '', itsm = '', numeroChamado = '' } = {}) {
            const itsmKey = normalizeIdentifier(itsm);
            if (itsmKey) {
                const matches = activeAlerts
                    .map((alert, index) => ({ alert, index }))
                    .filter(item => normalizeIdentifier(item.alert.itsm) === itsmKey);
                if (matches.length === 1) return { ...matches[0], ambiguous: false };
                if (matches.length > 1) return { alert: null, index: -1, ambiguous: true };
            }

            const protocolKey = normalizeIdentifier(numeroChamado);
            if (protocolKey) {
                const matches = activeAlerts
                    .map((alert, index) => ({ alert, index }))
                    .filter(item => normalizeIdentifier(item.alert.numeroChamado) === protocolKey);
                if (matches.length === 1) return { ...matches[0], ambiguous: false };
                if (matches.length > 1) return { alert: null, index: -1, ambiguous: true };
            }

            if (String(site || '').trim()) return findAlertMatch(site);
            return { alert: null, index: -1, ambiguous: false };
        }

        function displaySite(site) {
            return formatSiteForDisplay(site) || 'Não informado';
        }

        function occurrenceLabel(item) {
            const site = formatSiteForDisplay(item?.siteLocalidade);
            if (site) return site;
            const itsm = String(item?.itsm || '').trim();
            if (itsm) return itsm;
            const protocol = String(item?.numeroChamado || '').trim();
            if (protocol) return `Chamado ${protocol}`;
            return 'Ocorrência sem site';
        }

        function refreshActiveSitesDatalist() {
            activeSitesList.innerHTML = '';
            const seen = new Set();
            activeAlerts.forEach(alert => {
                const site = formatSiteForDisplay(alert.siteLocalidade);
                const key = normalizeSiteForMatch(site);
                if (seen.has(key)) return;
                seen.add(key);
                const option = document.createElement('option');
                option.value = site;
                activeSitesList.appendChild(option);
            });
        }

        function makeButton(label, classNames, handler) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.className = classNames;
            button.addEventListener('click', handler);
            return button;
        }

        function createCommunicationCard({ className, content, title, actions = [] }) {
            const card = document.createElement('div');
            card.classList.add(className, 'bg-white', 'p-4', 'rounded-md', 'shadow-sm', 'relative');

            if (title) {
                const heading = document.createElement('h3');
                heading.className = 'text-lg font-semibold text-gray-900 mb-1';
                heading.textContent = title;
                card.appendChild(heading);
            }

            const pre = document.createElement('pre');
            pre.className = 'text-sm text-gray-900 whitespace-pre-wrap';
            pre.textContent = content;
            card.appendChild(pre);

            const buttons = document.createElement('div');
            buttons.className = 'mt-3 flex flex-wrap gap-2';
            buttons.appendChild(makeButton(
                'Copiar',
                'px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out text-xs',
                () => copyToClipboard(content, card)
            ));

            actions.forEach(action => buttons.appendChild(makeButton(action.label, action.className, action.handler)));
            card.appendChild(buttons);
            return card;
        }

        function prefillUpdateForm(alert) {
            updateSiteInput.value = formatSiteForDisplay(alert.siteLocalidade);
            updateItsmInput.value = alert.itsm || '';
            updateNumeroChamadoInput.value = alert.numeroChamado || '';
            updateOperadoraSelect.value = alert.operadora || '';
            updateWanStatusSelect.value = alert.wanStatus || '';
            updateSlaInput.value = alert.sla || '';
            updateReportCategorySelect.value = alert.reportCategory === 'critical' ? 'critical' : 'update';
            updateReportResumoInput.value = alert.reportResumo || '';
            document.getElementById('updateFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                (updateNumeroChamadoInput.value ? updateSituacaoAtualSelect : updateNumeroChamadoInput).focus();
            }, 350);
        }

        function prefillNormalizationForm(alert) {
            normSiteInput.value = formatSiteForDisplay(alert.siteLocalidade);
            normItsmInput.value = alert.itsm || '';
            normNumeroChamadoInput.value = alert.numeroChamado || '';
            normOperadoraSelect.value = alert.operadora || '';
            normWanStatusSelect.value = alert.wanStatus || '';
            document.getElementById('normalizationFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                (normNumeroChamadoInput.value ? normCauseSelect : normNumeroChamadoInput).focus();
            }, 350);
        }

        function removeOccurrenceFromShiftHistory(occurrenceId) {
            if (!occurrenceId) return;
            const matchingKeys = [];
            for (let index = 0; index < localStorage.length; index++) {
                const key = localStorage.key(index);
                if (key && key.startsWith(SHIFT_LOG_PREFIX)) matchingKeys.push(key);
            }

            matchingKeys.forEach(key => {
                const events = safeParseArray(localStorage.getItem(key));
                const filtered = events.filter(event => event.occurrenceId !== occurrenceId);
                if (filtered.length !== events.length) {
                    try {
                        if (filtered.length) localStorage.setItem(key, JSON.stringify(filtered));
                        else localStorage.removeItem(key);
                    } catch (error) {
                        console.error('Falha ao remover ocorrência do histórico de turno:', error);
                    }
                }
            });
        }

        function deleteUnopenedAlert(alert) {
            if (!alert || alert.isUpdated) return;
            const formattedSite = formatSiteForDisplay(alert.siteLocalidade);
            const confirmed = window.confirm(
                `Apagar o alerta de "${formattedSite}"?\n\n` +
                'Use esta opção quando o alerta normalizou antes da abertura do chamado. ' +
                'Ele será removido dos alertas ativos e da passagem de turno, sem gerar uma normalização.'
            );
            if (!confirmed) return;

            const index = activeAlerts.findIndex(item => item.occurrenceId === alert.occurrenceId);
            if (index === -1) {
                showModal('Alerta não encontrado', 'A ocorrência já não está mais na lista de alertas ativos.');
                return;
            }

            activeAlerts.splice(index, 1);
            removeOccurrenceFromShiftHistory(alert.occurrenceId);
            saveData();
            renderAlerts();
            showModal('Alerta apagado', `O alerta de "${formattedSite}" foi removido sem gerar normalização.`);
        }

        function renderAlerts() {
            initialAlertsContainer.innerHTML = '';
            updatedAlertsContainer.innerHTML = '';

            const initialAlerts = activeAlerts.filter(alert => !alert.isUpdated);
            const updatedAlerts = activeAlerts.filter(alert => alert.isUpdated);
            sortAlertsArray(initialAlerts, currentInitialAlertSortCriteria);
            sortAlertsArray(updatedAlerts, currentUpdatedAlertSortCriteria);

            initialAlerts.forEach(alert => {
                const formattedSite = formatSiteForDisplay(alert.siteLocalidade);
                const alertContent = window.NocFlowConfig.renderTemplate("alert", {...alert, site: formattedSite, numeroChamado: alert.numeroChamado || alert.itsm || ""});

                initialAlertsContainer.appendChild(createCommunicationCard({
                    className: 'alert-card',
                    title: `${formattedSite} · ${alert.wanStatus || 'WAN'}`,
                    content: alertContent,
                    actions: [
                        {
                            label: '🔄 Atualizar',
                            className: 'px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition text-xs',
                            handler: () => prefillUpdateForm(alert)
                        },
                        {
                            label: '✅ Normalizar',
                            className: 'px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition text-xs',
                            handler: () => prefillNormalizationForm(alert)
                        },
                        {
                            label: '🗑 Apagar',
                            className: 'px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition text-xs',
                            handler: () => deleteUnopenedAlert(alert)
                        }
                    ]
                }));
            });

            updatedAlerts.forEach(alert => {
                const formattedSite = displaySite(alert.siteLocalidade);
                const alertContent = window.NocFlowConfig.renderTemplate("update", {...alert, site: formattedSite, numeroChamado: alert.numeroChamado || alert.itsm || ""});

                updatedAlertsContainer.appendChild(createCommunicationCard({
                    className: 'update-card',
                    title: `${occurrenceLabel(alert)} · Atualização`,
                    content: alertContent,
                    actions: [
                        {
                            label: '🔄 Atualizar novamente',
                            className: 'px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition text-xs',
                            handler: () => prefillUpdateForm(alert)
                        },
                        {
                            label: '✅ Normalizar',
                            className: 'px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition text-xs',
                            handler: () => prefillNormalizationForm(alert)
                        }
                    ]
                }));
            });

            noInitialAlerts.style.display = initialAlerts.length ? 'none' : 'block';
            noUpdatedAlerts.style.display = updatedAlerts.length ? 'none' : 'block';
            refreshActiveSitesDatalist();
            updateCounters();
        }

        function renderNormalizations() {
            normalizationsContainer.innerHTML = '';
            sortNormalizationsArray(normalizations, currentNormalizationSortCriteria);

            normalizations.forEach(norm => {
                const formattedSite = displaySite(norm.siteLocalidade);
                const normContent = window.NocFlowConfig.renderTemplate("normalization", {...norm, site: formattedSite, numeroChamado: norm.numeroChamado || norm.itsm || ""});

                normalizationsContainer.appendChild(createCommunicationCard({
                    className: 'normalization-card',
                    title: `${occurrenceLabel(norm)} - Normalizado`,
                    content: normContent
                }));
            });

            noNormalizations.style.display = normalizations.length ? 'none' : 'block';
            updateCounters();
        }

        const { processAlertLines, getWanFields } = window.NocFlowParser || {};

        if (typeof processAlertLines !== 'function' || typeof getWanFields !== 'function') {
            throw new Error('NOC Flow Parser não carregado. Verifique assets/js/parser.js.');
        }

        function createFormattedAlert(groupedAlert) {
            const wanFields = getWanFields(groupedAlert.wanStatuses);
            if (!wanFields) return null;

            return {
                occurrenceId: createOccurrenceId(),
                dataHoraEvento: formatEventDateTime(groupedAlert.eventDate),
                siteLocalidade: groupedAlert.siteLocalidade,
                itsm: '',
                numeroChamado: '',
                sla: '',
                severidade: document.getElementById('alertSeverity').value,
                servicoImpactado: 'Conectividade WAN',
                ...wanFields,
                operadora: '',
                reportCategory: 'critical',
                reportResumo: '',
                sourceOrigin: 'local',
                isUpdated: false,
                dataHoraAtualizacao: '',
                situacaoAtual: '',
                acoesRealizadas: '',
                proximosPassos: ''
            };
        }

        addAlertBtn.addEventListener('click', () => {
            const rawInput = document.getElementById('alertRawInput').value.trim();
            if (!rawInput) {
                showModal('Atenção', 'Por favor, cole o(s) alerta(s) completo(s) no campo.');
                return;
            }

            const groupedAlerts = processAlertLines(rawInput);
            if (!groupedAlerts.length) {
                showModal('Erro', 'Nenhum alerta válido encontrado no texto fornecido. Verifique o formato.');
                return;
            }

            let alertsAddedCount = 0;
            let alertsSkippedCount = 0;

            groupedAlerts.forEach(groupedAlert => {
                const newAlert = createFormattedAlert(groupedAlert);
                if (!newAlert) return;

                const newDate = parseDateTime(newAlert.dataHoraEvento);
                const isDuplicate = activeAlerts.some(alert =>
                    normalizeSiteForMatch(alert.siteLocalidade) === normalizeSiteForMatch(newAlert.siteLocalidade) &&
                    Math.abs(parseDateTime(alert.dataHoraEvento).getTime() - newDate.getTime()) <= WAN_GROUP_WINDOW_MS
                );

                if (isDuplicate) {
                    alertsSkippedCount++;
                } else {
                    activeAlerts.push(newAlert);
                    appendShiftEvent('alert', newAlert);
                    alertsAddedCount++;
                }
            });

            saveData();
            renderAlerts();
            document.getElementById('alertRawInput').value = '';

            if (alertsAddedCount > 0) {
                let message = `${alertsAddedCount} novo(s) alerta(s) adicionado(s) com sucesso!`;
                if (alertsSkippedCount) message += ` (${alertsSkippedCount} duplicata(s) ignorada(s)).`;
                showModal('Sucesso', message);
            } else {
                showModal('Atenção', `Nenhum novo alerta adicionado. ${alertsSkippedCount} alerta(s) duplicado(s) foram ignorado(s).`);
            }
        });

        function resolveSituacaoAtual() {
            const selected = updateSituacaoAtualSelect.value;
            const operadora = updateOperadoraSelect.value;
            if (selected === '__ABRINDO_OPERADORA__') {
                return operadora ? `Abrindo chamado com a operadora "${operadora}"` : null;
            }
            if (selected === '__AGUARDANDO_OPERADORA__') {
                return operadora ? `Aguardando atuação da operadora "${operadora}"` : null;
            }
            return selected || null;
        }

        function clearUpdateForm() {
            updateSiteInput.value = '';
            updateItsmInput.value = '';
            updateNumeroChamadoInput.value = '';
            updateOperadoraSelect.value = '';
            updateWanStatusSelect.value = '';
            updateSlaInput.value = '';
            updateReportCategorySelect.value = 'update';
            updateReportResumoInput.value = '';
            updateSituacaoAtualSelect.value = '';
            updateAcoesRealizadasInput.value = '';
            updateProximosPassosSelect.value = '';
        }

        function applyUpdateToOccurrence(alertToUpdate, data, { sourceOrigin = null } = {}) {
            alertToUpdate.isUpdated = true;
            alertToUpdate.dataHoraAtualizacao = data.dataHoraAtualizacao;
            if (data.updateSite) alertToUpdate.siteLocalidade = data.updateSite;
            if (data.updateItsm) alertToUpdate.itsm = data.updateItsm;
            if (data.updateNumeroChamado) alertToUpdate.numeroChamado = data.updateNumeroChamado;
            if (data.updateSla) alertToUpdate.sla = data.updateSla;
            alertToUpdate.reportCategory = data.updateReportCategory;
            alertToUpdate.reportResumo = data.updateReportResumo;
            alertToUpdate.situacaoAtual = data.situacaoAtual;
            alertToUpdate.acoesRealizadas = data.updateAcoesRealizadas;
            alertToUpdate.proximosPassos = data.updateProximosPassos;
            if (data.operadora) alertToUpdate.operadora = data.operadora;
            if (data.wanStatus) alertToUpdate.wanStatus = data.wanStatus;
            if (sourceOrigin) alertToUpdate.sourceOrigin = sourceOrigin;
            appendShiftEvent('update', alertToUpdate);
            saveData();
            renderAlerts();
            clearUpdateForm();
            return occurrenceLabel(alertToUpdate);
        }

        function createIndependentOccurrenceFromUpdate(data) {
            const wanStatus = data.wanStatus || 'WAN';
            const sintoma = wanStatus === 'WAN 1' ? 'Failed (WAN 1)' : wanStatus === 'WAN 2' ? 'Failed (WAN 2)' : wanStatus === 'WAN 1 e WAN 2' ? 'Failed (WAN 1) e Failed (WAN 2)' : 'Failed (WAN)';
            const occurrence = {
                occurrenceId: createOccurrenceId(),
                dataHoraEvento: formatEventDateTime(new Date()),
                siteLocalidade: data.updateSite || '',
                itsm: data.updateItsm || '',
                numeroChamado: data.updateNumeroChamado || '',
                sla: data.updateSla || '',
                severidade: document.getElementById('alertSeverity').value,
                servicoImpactado: 'Conectividade WAN',
                servidorEquipamentoAfetado: wanStatus === 'WAN 1 e WAN 2' ? 'WAN 1 e WAN 2 (Links de Internet)' : `${wanStatus} (Link de Internet)`,
                sintomaObservado: sintoma,
                analiseInicial: 'Ocorrência registrada manualmente sem alerta local vinculado',
                acoesImediatas: 'Tratativa já em andamento',
                wanStatus,
                operadora: data.operadora || '',
                reportCategory: data.updateReportCategory,
                reportResumo: data.updateReportResumo,
                sourceOrigin: 'manual',
                isUpdated: false,
                dataHoraAtualizacao: '',
                situacaoAtual: '',
                acoesRealizadas: '',
                proximosPassos: ''
            };
            activeAlerts.push(occurrence);
            return occurrence;
        }

        addUpdateBtn.addEventListener('click', () => {
            const data = {
                updateSite: updateSiteInput.value.trim(),
                updateItsm: updateItsmInput.value.trim(),
                updateNumeroChamado: updateNumeroChamadoInput.value.trim(),
                operadora: updateOperadoraSelect.value,
                wanStatus: updateWanStatusSelect.value || 'WAN',
                updateSla: updateSlaInput.value.trim(),
                updateReportCategory: updateReportCategorySelect.value,
                updateReportResumo: updateReportResumoInput.value.trim(),
                updateAcoesRealizadas: updateAcoesRealizadasInput.value.trim(),
                updateProximosPassos: updateProximosPassosSelect.value.trim(),
                situacaoAtual: resolveSituacaoAtual(),
                dataHoraAtualizacao: formatLocaleDateTime()
            };

            const hasIdentifier = Boolean(data.updateSite || data.updateItsm || data.updateNumeroChamado);
            if (!hasIdentifier) {
                showModal('Identificação necessária', 'Informe pelo menos um identificador da ocorrência: Site / Localidade, Chamado ITSM ou Chamado / Protocolo da Operadora.');
                return;
            }
            if (!updateSituacaoAtualSelect.value || !data.updateAcoesRealizadas || !data.updateProximosPassos) {
                showModal('Atenção', 'Preencha Situação Atual, Ações Realizadas e Próximos Passos para registrar a atualização.');
                return;
            }
            if (!data.situacaoAtual) {
                showModal('Atenção', 'Selecione a operadora para a situação escolhida.');
                updateOperadoraSelect.focus();
                return;
            }

            const match = findActiveOccurrenceMatch({
                site: data.updateSite,
                itsm: data.updateItsm,
                numeroChamado: data.updateNumeroChamado
            });

            if (match.alert) {
                if (!updateWanStatusSelect.value) data.wanStatus = match.alert.wanStatus || 'WAN';
                const label = applyUpdateToOccurrence(match.alert, data);
                showModal('Sucesso', `Atualização de "${label}" registrada com sucesso.`);
                return;
            }

            // Nenhum alerta local é necessário: cria uma ocorrência independente diretamente em Atualizações.
            const independent = createIndependentOccurrenceFromUpdate(data);
            const label = applyUpdateToOccurrence(independent, data, { sourceOrigin: 'manual' });
            const extra = match.ambiguous ? ' Havia mais de uma ocorrência local semelhante, por isso o registro foi mantido independente.' : '';
            showModal('Atualização registrada', `A atualização de "${label}" foi registrada sem vínculo obrigatório com um alerta local.${extra}`);
        });

        function clearNormalizationForm() {
            normSiteInput.value = '';
            normItsmInput.value = '';
            normNumeroChamadoInput.value = '';
            normOperadoraSelect.value = '';
            normWanStatusSelect.value = '';
            normCauseSelect.value = '';
            normActionSelect.value = '';
        }

        function registerNormalization({ existingAlert = null, matchIndex = -1, externalData = null }) {
            const siteFinal = existingAlert ? (existingAlert.siteLocalidade || '') : (externalData.site || '');
            const numeroChamado = externalData ? (externalData.numeroChamado || '') : (normNumeroChamadoInput.value.trim() || existingAlert.numeroChamado || '');
            const wanStatus = existingAlert ? (normWanStatusSelect.value || existingAlert.wanStatus || 'WAN') : (externalData.wanStatus || 'WAN');
            const newNormalization = {
                occurrenceId: existingAlert ? existingAlert.occurrenceId : createOccurrenceId(),
                dataHoraNormalizacao: formatLocaleDateTime(),
                siteLocalidade: siteFinal,
                itsm: existingAlert ? (normItsmInput.value.trim() || existingAlert.itsm || '') : (externalData.itsm || ''),
                numeroChamado,
                operadora: existingAlert ? (normOperadoraSelect.value || existingAlert.operadora || '') : (externalData.operadora || ''),
                sla: existingAlert ? (existingAlert.sla || '') : '',
                wanStatus,
                reportResumo: existingAlert ? (existingAlert.reportResumo || '') : '',
                situacaoAtual: existingAlert ? (existingAlert.situacaoAtual || '') : '',
                acoesRealizadas: existingAlert ? (existingAlert.acoesRealizadas || '') : '',
                proximosPassos: existingAlert ? (existingAlert.proximosPassos || '') : '',
                sourceOrigin: existingAlert ? (existingAlert.sourceOrigin || 'local') : 'manual-closure',
                servicoAfetado: `Conectividade WAN (${wanStatus})`,
                causaIdentificada: normCauseSelect.value,
                acaoCorretivaRealizada: normActionSelect.value,
                statusFinal: 'Normalizado'
            };
            if (matchIndex !== -1) activeAlerts.splice(matchIndex, 1);
            normalizations.push(newNormalization);
            appendShiftEvent('normalization', newNormalization);
            saveData();
            renderAlerts();
            renderNormalizations();
            clearNormalizationForm();
            return newNormalization;
        }

        addNormalizationBtn.addEventListener('click', () => {
            const normSite = normSiteInput.value.trim();
            const normItsm = normItsmInput.value.trim();
            const normNumeroChamado = normNumeroChamadoInput.value.trim();
            const normOperadora = normOperadoraSelect.value;
            const normWanStatus = normWanStatusSelect.value || 'WAN';
            const normCause = normCauseSelect.value;
            const normAction = normActionSelect.value;

            const hasIdentifier = Boolean(normSite || normItsm || normNumeroChamado);
            if (!hasIdentifier) {
                showModal('Identificação necessária', 'Informe pelo menos um identificador da ocorrência: Site / Localidade, Chamado ITSM ou Chamado / Protocolo da Operadora.');
                return;
            }
            if (!normCause || !normAction) {
                showModal('Atenção', 'Preencha Causa Identificada e Ação Corretiva para registrar a normalização.');
                return;
            }

            const match = findActiveOccurrenceMatch({
                site: normSite,
                itsm: normItsm,
                numeroChamado: normNumeroChamado
            });

            if (match.alert) {
                if (normSite) match.alert.siteLocalidade = normSite;
                if (normItsm) match.alert.itsm = normItsm;
                if (normOperadora) match.alert.operadora = normOperadora;
                if (normWanStatusSelect.value) match.alert.wanStatus = normWanStatusSelect.value;
                if (normNumeroChamado) match.alert.numeroChamado = normNumeroChamado;
                const result = registerNormalization({ existingAlert: match.alert, matchIndex: match.index });
                showModal('Normalização registrada', `"${occurrenceLabel(result)}" foi normalizado e removido das ocorrências ativas.`);
                return;
            }

            // Normalização avulsa: nenhum alerta local ou nome de unidade é obrigatório.
            const externalData = {
                site: normSite,
                itsm: normItsm,
                numeroChamado: normNumeroChamado,
                operadora: normOperadora,
                wanStatus: normWanStatus
            };
            const result = registerNormalization({ externalData });
            const extra = match.ambiguous ? ' Havia mais de uma ocorrência local semelhante, então nenhuma delas foi encerrada automaticamente.' : '';
            showModal('Normalização registrada', `A normalização de "${occurrenceLabel(result)}" foi registrada sem vínculo obrigatório com um alerta local.${extra}`);
        });

        function csvValue(value) {
            const text = String(value ?? '').replace(/\r?\n/g, ' ').trim();
            return `"${text.replace(/"/g, '""')}"`;
        }

        function convertToCsvString(data, headers) {
            const rows = [headers.map(csvValue).join(',')];
            data.forEach(row => rows.push(headers.map(header => csvValue(row[header])).join(',')));
            return rows.join('\n');
        }

        function downloadCsvFile(csvString, filename) {
            const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 500);
        }

        exportAllDataCsvBtn.addEventListener('click', () => {
            const now = new Date();
            const filenameTimestamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}_${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
            const filename = `ocorrencias_nocflow_v1_${filenameTimestamp}.csv`;

            const activeAlertHeaders = [
                'occurrenceId', 'dataHoraEvento', 'siteLocalidade', 'itsm', 'numeroChamado', 'sla', 'severidade',
                'servicoImpactado', 'servidorEquipamentoAfetado', 'sintomaObservado',
                'analiseInicial', 'acoesImediatas', 'wanStatus', 'operadora', 'sourceOrigin', 'reportCategory', 'reportResumo', 'isUpdated',
                'dataHoraAtualizacao', 'situacaoAtual', 'acoesRealizadas', 'proximosPassos'
            ];
            const normalizationHeaders = [
                'occurrenceId', 'dataHoraNormalizacao', 'siteLocalidade', 'itsm', 'numeroChamado', 'operadora', 'sourceOrigin', 'sla', 'wanStatus', 'servicoAfetado',
                'causaIdentificada', 'acaoCorretivaRealizada', 'statusFinal'
            ];

            const combinedCsvContent = [
                'Alertas Ativos',
                convertToCsvString(activeAlerts, activeAlertHeaders),
                '',
                'Normalizações',
                convertToCsvString(normalizations, normalizationHeaders)
            ].join('\n');

            downloadCsvFile(combinedCsvContent, filename);
        });


        function localDateInputValue(date = new Date()) {
            return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
        }

        function parseLocalDateTime(dateKey, timeText) {
            const [year, month, day] = String(dateKey).split('-').map(Number);
            const [hour, minute] = String(timeText || '00:00').split(':').map(Number);
            return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
        }

        function nextDateKey(dateKey) {
            const date = parseLocalDateTime(dateKey, '12:00');
            date.setDate(date.getDate() + 1);
            return getDateKey(date);
        }

        function getEventsForWindow(dateKey, startTime, endTime) {
            const start = parseLocalDateTime(dateKey, startTime || '00:00');
            let end = parseLocalDateTime(dateKey, endTime || '23:59');
            if (end <= start) end.setDate(end.getDate() + 1);

            const allEvents = [];
            for (let index = 0; index < localStorage.length; index++) {
                const key = localStorage.key(index);
                if (!key || !key.startsWith(SHIFT_LOG_PREFIX)) continue;
                safeParseArray(localStorage.getItem(key)).forEach(event => allEvents.push(event));
            }

            const seen = new Set();
            return allEvents.filter(event => {
                const stamp = new Date(event.timestampISO || 0);
                if (stamp < start || stamp > end) return false;
                const unique = event.eventId || `${event.type}|${event.occurrenceId}|${event.timestampISO}`;
                if (seen.has(unique)) return false;
                seen.add(unique);
                return true;
            }).sort((a, b) => new Date(a.timestampISO) - new Date(b.timestampISO));
        }

        function latestByOccurrence(events, type) {
            const map = new Map();
            events.filter(event => event.type === type).forEach(event => {
                const key = event.occurrenceId || normalizeSiteForMatch(event.siteLocalidade);
                const previous = map.get(key);
                if (!previous || new Date(event.timestampISO) >= new Date(previous.timestampISO)) map.set(key, event);
            });
            return [...map.values()];
        }

        function markdownEscapeInline(text) {
            return String(text || '').replace(/\r?\n/g, ' ').trim();
        }

        function wanToLinkText(wanStatus) {
            const value = String(wanStatus || 'WAN').toUpperCase();
            if (value.includes('WAN 1') && value.includes('WAN 2')) return 'Links 1 e 2';
            if (value.includes('WAN 1')) return 'Link 1';
            if (value.includes('WAN 2')) return 'Link 2';
            return 'Link WAN';
        }

        function reportSiteHeader(item) {
            const site = formatSiteForDisplay(item.siteLocalidade);
            const itsm = markdownEscapeInline(item.itsm);
            const protocol = markdownEscapeInline(item.numeroChamado);
            if (site && itsm) return `**${site} (${itsm}):**`;
            if (site) return `**${site}:**`;
            if (itsm) return `**${itsm}:**`;
            if (protocol) return `**Chamado ${protocol}:**`;
            return '**Ocorrência não identificada:**';
        }

        function autoReportNarrative(item, type) {
            if (markdownEscapeInline(item.reportResumo)) return markdownEscapeInline(item.reportResumo);
            const parts = [];
            const link = wanToLinkText(item.wanStatus);
            if (type !== 'normalization') parts.push(`${link} inoperante.`);

            if (item.numeroChamado) parts.push(`Chamado **${markdownEscapeInline(item.numeroChamado)}**.`);
            if (item.situacaoAtual) parts.push(`Situação: ${markdownEscapeInline(item.situacaoAtual)}.`);
            if (item.acoesRealizadas) parts.push(`Ações realizadas: ${markdownEscapeInline(item.acoesRealizadas)}.`);
            if (item.sla) parts.push(`SLA: ${markdownEscapeInline(item.sla)}.`);
            if (item.proximosPassos && type !== 'normalization') parts.push(`Próximos passos: ${markdownEscapeInline(item.proximosPassos)}.`);

            if (type === 'alert' && !item.numeroChamado) {
                parts.push(markdownEscapeInline(item.acoesImediatas || 'Abertura de chamado com a operadora em andamento.') + '.');
            }
            if (type === 'normalization') {
                parts.unshift(`${link} normalizado.`);
                if (item.causaIdentificada) parts.push(`Causa identificada: ${markdownEscapeInline(item.causaIdentificada)}.`);
                if (item.acaoCorretivaRealizada) parts.push(`Ação corretiva: ${markdownEscapeInline(item.acaoCorretivaRealizada)}.`);
            }
            return parts.join(' ').replace(/\.\s*\./g, '.');
        }

        function groupByOperator(items) {
            const groups = new Map();
            items.forEach(item => {
                const operator = markdownEscapeInline(item.operadora) || 'Sem operadora definida';
                const key = operator.toLocaleUpperCase('pt-BR');
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(item);
            });
            return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
        }

        function renderReportSection(title, items, type) {
            const lines = [`### **${title}**`, ''];
            if (!items.length) {
                lines.push('- Nenhum registro no período.', '');
                return lines;
            }
            groupByOperator(items).forEach(([operator, group]) => {
                lines.push(`- **${operator}:**`);
                group.sort((a, b) => String(a.siteLocalidade).localeCompare(String(b.siteLocalidade), 'pt-BR')).forEach(item => {
                    lines.push(`  - ${reportSiteHeader(item)} ${autoReportNarrative(item, type)}`);
                });
            });
            lines.push('');
            return lines;
        }

        function buildShiftReport() {
            const dateKey = shiftReportDateInput.value || localDateInputValue();
            const startTime = shiftStartTimeInput.value || '06:00';
            const endTime = shiftEndTimeInput.value || '18:00';
            const events = getEventsForWindow(dateKey, startTime, endTime);

            const latestUpdates = latestByOccurrence(events, 'update');
            const updatedIds = new Set(latestUpdates.map(event => event.occurrenceId));
            const rawAlerts = latestByOccurrence(events, 'alert').filter(event => !updatedIds.has(event.occurrenceId));
            const criticalUpdates = latestUpdates.filter(event => (event.reportCategory || 'update') === 'critical');
            const regularUpdates = latestUpdates.filter(event => (event.reportCategory || 'update') === 'update');
            const normalizationsForShift = latestByOccurrence(events, 'normalization');
            const critical = [...criticalUpdates, ...rawAlerts];

            const [year, month, day] = dateKey.split('-');
            const dateBr = `${day}/${month}/${year}`;
            const lines = [`Relatório de Passagem de Turno - ${dateBr}`, ''];
            lines.push(...renderReportSection('1. 🚨 Incidentes Críticos e Desastres', critical, 'update'));
            lines.push(...renderReportSection('2. 🔄 Atualizações de Chamados e Operadoras', regularUpdates, 'update'));
            lines.push(...renderReportSection('3. ✅ Normalizações', normalizationsForShift, 'normalization'));

            shiftReportPreview.value = lines.join('\n').trim();
            shiftReportMeta.textContent = `${events.length} evento(s) · ${startTime}–${endTime}`;
            return { events, dateKey, startTime, endTime };
        }

        function downloadTextFile(content, filename, mime = 'text/plain;charset=utf-8') {
            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 500);
        }

        function metricStorageKey(shiftId) {
            return `${METRICS_PREFIX}${shiftId}`;
        }

        function readMetricExtras(shiftId) {
            try {
                const raw = localStorage.getItem(metricStorageKey(shiftId));
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (error) {
                console.error('Falha ao ler métricas adicionais:', error);
                return {};
            }
        }

        function writeMetricExtras(shiftId, data) {
            try {
                localStorage.setItem(metricStorageKey(shiftId), JSON.stringify(data));
            } catch (error) {
                console.error('Falha ao salvar métricas adicionais:', error);
            }
        }

        function recordMetricAction(action, amount = 1, shiftId = getOperationalShift().id) {
            const metrics = readMetricExtras(shiftId);
            metrics[action] = Number(metrics[action] || 0) + amount;
            writeMetricExtras(shiftId, metrics);
        }

        function calculateShiftMetrics(shift = getOperationalShift()) {
            const windowInfo = currentShiftWindow(shift);
            const events = getEventsForWindow(windowInfo.dateKey, windowInfo.startTime, windowInfo.endTime);
            const counts = events.reduce((acc, event) => {
                if (event.type === 'alert') acc.alerts += 1;
                if (event.type === 'update') acc.updates += 1;
                if (event.type === 'normalization') acc.normalizations += 1;
                return acc;
            }, { alerts: 0, updates: 0, normalizations: 0 });
            const extras = readMetricExtras(shift.id);
            const reports = Number(extras.shiftReportsGenerated || 0);
            const actions = counts.alerts + counts.updates + counts.normalizations + reports;
            const estimatedMinutes = METRIC_ESTIMATES_MINUTES ? (
                counts.alerts * METRIC_ESTIMATES_MINUTES.alert +
                counts.updates * METRIC_ESTIMATES_MINUTES.update +
                counts.normalizations * METRIC_ESTIMATES_MINUTES.normalization +
                reports * METRIC_ESTIMATES_MINUTES.shiftReport
            ) : null;
            return { ...counts, reports, actions, estimatedMinutes, shiftId: shift.id, shiftLabel: shift.label, window: windowInfo };
        }

        function formatMinutes(minutes) {
            const rounded = Math.round(Number(minutes || 0));
            if (rounded < 60) return `${rounded} min`;
            const hours = Math.floor(rounded / 60);
            const rest = rounded % 60;
            return rest ? `${hours}h ${rest}min` : `${hours}h`;
        }

        function renderMetrics() {
            const metrics = calculateShiftMetrics();
            metricsShiftLabel.textContent = metrics.shiftLabel;
            metricAlerts.textContent = metrics.alerts;
            metricUpdates.textContent = metrics.updates;
            metricNormalizations.textContent = metrics.normalizations;
            metricReports.textContent = metrics.reports;
            metricActions.textContent = metrics.actions;
            metricTimeSaved.textContent = metrics.estimatedMinutes === null ? 'Não medido' : formatMinutes(metrics.estimatedMinutes);
            return metrics;
        }

        function openMetrics() {
            renderMetrics();
            metricsModal.classList.remove('hidden');
        }

        function closeMetrics() {
            metricsModal.classList.add('hidden');
        }

        function collectNocFlowStorage() {
            const storage = {};
            for (let index = 0; index < localStorage.length; index++) {
                const key = localStorage.key(index);
                if (key && key.toLowerCase().startsWith('nocflow_v1_')) storage[key] = localStorage.getItem(key);
            }
            return storage;
        }

        function createBackupPayload() {
            return {
                schema: 'nocflow-local-backup',
                schemaVersion: 1,
                nocflowVersion: NOCFLOW_VERSION,
                exportedAt: new Date().toISOString(),
                operationalShift: getOperationalShift().id,
                storage: collectNocFlowStorage()
            };
        }

        function exportBackupJson() {
            persistCurrentData();
            const payload = createBackupPayload();
            const now = new Date();
            const stamp = `${getDateKey(now)}_${pad2(now.getHours())}${pad2(now.getMinutes())}`;
            downloadTextFile(JSON.stringify(payload, null, 2), `NOC Flow_backup_${stamp}.json`, 'application/json;charset=utf-8');
            showModal('Backup criado', `${Object.keys(payload.storage).length} registro(s) locais incluídos no backup JSON.`);
        }

        function restoreBackupPayload(payload) {
            if (!payload || payload.schema !== 'nocflow-local-backup' || payload.schemaVersion !== 1 || typeof payload !== 'object' || !payload.storage || typeof payload.storage !== 'object' || Array.isArray(payload.storage)) {
                throw new Error('Estrutura de backup inválida.');
            }
            const entries = Object.entries(payload.storage).filter(([key, value]) =>
                typeof key === 'string' && key.toLowerCase().startsWith('nocflow_v1_') && typeof value === 'string'
            );
            if (!entries.length) throw new Error('O arquivo não contém dados reconhecidos do NOC Flow.');

            const confirmed = window.confirm(
                `Restaurar ${entries.length} registro(s) do backup?\n\n` +
                'Os dados locais do NOC Flow com as mesmas chaves serão substituídos. Recomenda-se exportar um backup antes de continuar.'
            );
            if (!confirmed) return false;

            const currentAppKeys = [];
            for (let index = 0; index < localStorage.length; index++) {
                const key = localStorage.key(index);
                if (key && key.startsWith('nocflow_v1_')) currentAppKeys.push(key);
            }
            currentAppKeys.forEach(key => localStorage.removeItem(key));
            entries.forEach(([key, value]) => localStorage.setItem(key, value));
            if (!Object.prototype.hasOwnProperty.call(payload.storage, ACTIVE_ALERTS_KEY)) {
                localStorage.removeItem(MIGRATION_MARKER_KEY);
            }
            setShiftLocalStorageKeys();
            loadData();
            renderAlerts();
            renderNormalizations();
            updateCounters();
            return true;
        }

        function openShiftReport() {
            if (!shiftReportDateInput.value) {
                const shift = getOperationalShift();
                const windowInfo = currentShiftWindow(shift);
                shiftReportDateInput.value = windowInfo.dateKey;
                shiftStartTimeInput.value = windowInfo.startTime;
                shiftEndTimeInput.value = windowInfo.endTime;
            }
            shiftReportModal.classList.remove('hidden');
            buildShiftReport();
        }

        function closeShiftReport() {
            shiftReportModal.classList.add('hidden');
        }

        openShiftReportBtn.addEventListener('click', openShiftReport);
        closeShiftReportBtn.addEventListener('click', closeShiftReport);
        shiftReportModal.addEventListener('click', event => { if (event.target === shiftReportModal) closeShiftReport(); });
        generateShiftReportBtn.addEventListener('click', () => { buildShiftReport(); recordMetricAction('shiftReportsGenerated'); });
        copyShiftReportBtn.addEventListener('click', () => {
            const text = shiftReportPreview.value.trim();
            if (!text) return showModal('Atenção', 'Gere o relatório antes de copiar.');
            copyToClipboard(text, shiftReportPreview.parentElement);
        });
        downloadShiftReportBtn.addEventListener('click', () => {
            const text = shiftReportPreview.value.trim();
            if (!text) return showModal('Atenção', 'Gere o relatório antes de baixar.');
            const dateKey = shiftReportDateInput.value || localDateInputValue();
            downloadTextFile(text, `passagem_de_turno_${dateKey}.md`, 'text/markdown;charset=utf-8');
        });
        exportShiftCsvBtn.addEventListener('click', () => {
            const data = buildShiftReport();
            if (!data.events.length) return showModal('Atenção', 'Não há eventos registrados no período selecionado para exportar.');
            const headers = [
                'timestampISO','type','sourceOrigin','reportCategory','siteLocalidade','itsm','numeroChamado','operadora','wanStatus','sla',
                'situacaoAtual','acoesRealizadas','proximosPassos','causaIdentificada','acaoCorretivaRealizada','statusFinal','reportResumo'
            ];
            const csv = convertToCsvString(data.events, headers);
            downloadCsvFile(csv, `passagem_de_turno_${data.dateKey}_${data.startTime.replace(':','')}-${data.endTime.replace(':','')}.csv`);
        });

        openMetricsBtn.addEventListener('click', openMetrics);
        closeMetricsBtn.addEventListener('click', closeMetrics);
        metricsModal.addEventListener('click', event => { if (event.target === metricsModal) closeMetrics(); });
        exportMetricsBtn.addEventListener('click', () => {
            const metrics = renderMetrics();
            const payload = {
                nocflowVersion: NOCFLOW_VERSION,
                exportedAt: new Date().toISOString(),
                ...metrics,
                estimatesMinutesPerAction: METRIC_ESTIMATES_MINUTES,
                note: 'Estimativa inicial para piloto; validar com medição real do processo.'
            };
            downloadTextFile(JSON.stringify(payload, null, 2), `NOC Flow_metricas_${metrics.shiftId}.json`, 'application/json;charset=utf-8');
        });

        backupDataBtn.addEventListener('click', exportBackupJson);
        restoreDataBtn.addEventListener('click', () => restoreDataInput.click());
        restoreDataInput.addEventListener('change', async () => {
            const file = restoreDataInput.files && restoreDataInput.files[0];
            restoreDataInput.value = '';
            if (!file) return;
            try {
                const payload = JSON.parse(await file.text());
                if (restoreBackupPayload(payload)) showModal('Backup restaurado', 'Os dados locais foram restaurados e a interface foi atualizada.');
            } catch (error) {
                console.error('Falha ao restaurar backup:', error);
                showModal('Backup inválido', error.message || 'Não foi possível ler o arquivo de backup.');
            }
        });

        sortInitialAlertsByDateBtn.addEventListener('click', () => { currentInitialAlertSortCriteria = 'date'; renderAlerts(); });
        sortInitialAlertsByTimeBtn.addEventListener('click', () => { currentInitialAlertSortCriteria = 'time'; renderAlerts(); });
        sortInitialAlertsBySiteBtn.addEventListener('click', () => { currentInitialAlertSortCriteria = 'site'; renderAlerts(); });
        sortUpdatedAlertsByDateBtn.addEventListener('click', () => { currentUpdatedAlertSortCriteria = 'date'; renderAlerts(); });
        sortUpdatedAlertsByTimeBtn.addEventListener('click', () => { currentUpdatedAlertSortCriteria = 'time'; renderAlerts(); });
        sortUpdatedAlertsBySiteBtn.addEventListener('click', () => { currentUpdatedAlertSortCriteria = 'site'; renderAlerts(); });
        sortNormalizationsByDateBtn.addEventListener('click', () => { currentNormalizationSortCriteria = 'date'; renderNormalizations(); });
        sortNormalizationsByTimeBtn.addEventListener('click', () => { currentNormalizationSortCriteria = 'time'; renderNormalizations(); });
        sortNormalizationsBySiteBtn.addEventListener('click', () => { currentNormalizationSortCriteria = 'site'; renderNormalizations(); });

        goToInitialAlertsBtn.addEventListener('click', () => { if (window.activateOccurrenceTab) window.activateOccurrenceTab('initial'); setTimeout(() => document.getElementById('occurrencesWorkspace').scrollIntoView({ behavior: 'smooth', block: 'start' }), 20); });
        goToUpdatedAlertsBtn.addEventListener('click', () => { if (window.activateOccurrenceTab) window.activateOccurrenceTab('updated'); setTimeout(() => document.getElementById('occurrencesWorkspace').scrollIntoView({ behavior: 'smooth', block: 'start' }), 20); });
        goToNormalizationsBtn.addEventListener('click', () => { if (window.activateOccurrenceTab) window.activateOccurrenceTab('normalizations'); setTimeout(() => document.getElementById('occurrencesWorkspace').scrollIntoView({ behavior: 'smooth', block: 'start' }), 20); });

        function updateCounters() {
            const initialAlerts = activeAlerts.filter(alert => !alert.isUpdated);
            const updatedAlerts = activeAlerts.filter(alert => alert.isUpdated);
            activeAlertsCountSpan.textContent = initialAlerts.length;
            updatedAlertsCountSpan.textContent = updatedAlerts.length;
            normalizationsCountSpan.textContent = normalizations.length;
        }

        function updateDateTime() {
            currentDateTimeSpan.textContent = formatLocaleDateTime();
            rolloverShiftStorageIfNeeded();
        }

        setShiftLocalStorageKeys();
        loadData();
        renderAlerts();
        renderNormalizations();
        updateDateTime();
        setInterval(updateDateTime, 1000);
    

        // --- NOC Flow v1.0.0 Visual UI: tema, abas, busca, relatórios e contadores espelhados ---
        (function initVisualUI() {
            const root = document.documentElement;
            const themeToggle = document.getElementById('themeToggle');
            const themeIcon = document.getElementById('themeIcon');
            const savedTheme = localStorage.getItem('nocflow_v1_Theme');
            const preferredDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

            function applyTheme(theme) {
                const normalized = theme === 'dark' ? 'dark' : 'light';
                root.setAttribute('data-theme', normalized);
                localStorage.setItem('nocflow_v1_Theme', normalized);
                themeIcon.textContent = normalized === 'dark' ? '☀' : '☾';
                themeToggle.title = normalized === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
                themeToggle.setAttribute('aria-label', themeToggle.title);
            }
            applyTheme(savedTheme || (preferredDark ? 'dark' : 'light'));
            themeToggle.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

            const tabs = [...document.querySelectorAll('.tab-btn[data-tab]')];
            const panels = [...document.querySelectorAll('.occurrence-panel[data-panel]')];
            const search = document.getElementById('occurrenceSearch');

            window.activateOccurrenceTab = function(tabName) {
                tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
                panels.forEach(panel => panel.classList.toggle('panel-hidden', panel.dataset.panel !== tabName));
                filterCurrentPanel();
            };

            tabs.forEach(btn => btn.addEventListener('click', () => window.activateOccurrenceTab(btn.dataset.tab)));
            document.querySelectorAll('[data-tab-nav]').forEach(btn => btn.addEventListener('click', () => {
                window.activateOccurrenceTab(btn.dataset.tabNav);
                document.getElementById('occurrencesWorkspace').scrollIntoView({behavior:'smooth', block:'start'});
            }));
            document.querySelectorAll('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.scroll);
                if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
            }));
            document.querySelectorAll('[data-workflow="alert"]').forEach(btn => btn.addEventListener('click', () => document.getElementById('alertFormSection').scrollIntoView({behavior:'smooth',block:'start'})));

            function currentPanel() { return panels.find(panel => !panel.classList.contains('panel-hidden')); }
            function filterCurrentPanel() {
                const panel = currentPanel();
                if (!panel) return;
                const term = (search.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
                const cards = panel.querySelectorAll('.alert-card, .update-card, .normalization-card');
                cards.forEach(card => {
                    const haystack = card.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
                    card.style.display = !term || haystack.includes(term) ? '' : 'none';
                });
            }
            search.addEventListener('input', filterCurrentPanel);

            const originalUpdateCounters = updateCounters;
            updateCounters = function() {
                originalUpdateCounters();
                const initial = activeAlerts.filter(alert => !alert.isUpdated).length;
                const updated = activeAlerts.filter(alert => alert.isUpdated).length;
                const norm = normalizations.length;
                const mappings = [
                    ['sidebarActiveCount', initial], ['sidebarUpdatedCount', updated], ['sidebarNormCount', norm],
                    ['tabInitialCount', initial], ['tabUpdatedCount', updated], ['tabNormCount', norm],
                    ['totalOccurrencesCount', activeAlerts.length + norm]
                ];
                mappings.forEach(([id, value]) => { const el=document.getElementById(id); if(el) el.textContent=value; });
                filterCurrentPanel();
            };
            updateCounters();

            // Reapply search after render calls replace the card DOM.
            const oldRenderAlerts = renderAlerts;
            renderAlerts = function(){ oldRenderAlerts(); updateCounters(); };
            const oldRenderNormalizations = renderNormalizations;
            renderNormalizations = function(){ oldRenderNormalizations(); updateCounters(); };
        })();


