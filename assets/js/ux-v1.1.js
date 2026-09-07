/* NOC Flow v1.1.0 — camada pública de UX. Desenvolvido por Matheus Santo. */
(function () {
    'use strict';

    const config = window.NOCFLOW_CONFIG || {};
    const shiftApi = window.NocFlowShift || {};
    const q = (selector, root = document) => root.querySelector(selector);
    const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

    function applyVersionBranding() {
        const version = String(config.version || '1.1.0').replace(/^v/i, '');
        document.title = `NOC Flow v${version} · Demonstração`;

        const brandVersion = q('.brand-copy strong span');
        if (brandVersion) brandVersion.textContent = `v${version}`;

        const mobileBrand = q('.mobile-brand');
        if (mobileBrand && mobileBrand.firstChild) mobileBrand.firstChild.nodeValue = `NOC Flow v${version} `;

        const sidebarNote = q('.sidebar-note');
        if (sidebarNote && sidebarNote.firstChild) sidebarNote.firstChild.nodeValue = `NOC Flow v${version} · DEMONSTRAÇÃO`;

        const safeNote = q('.base-safe-note');
        if (safeNote) safeNote.textContent = '🔒 Esta demonstração contém apenas dados operacionais fictícios. Credenciais, segredos, tokens e cadastros reais não fazem parte do projeto público.';
    }

    function createShiftBadge() {
        const topActions = q('.top-actions');
        if (!topActions || !shiftApi.getOperationalShift) return;
        let badge = q('#currentShiftBadge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'currentShiftBadge';
            badge.className = 'ux-shift-badge';
            topActions.insertBefore(badge, topActions.firstChild);
        }
        const update = () => {
            const shift = shiftApi.getOperationalShift(new Date());
            badge.textContent = `Plantão ${shift.label}`;
            badge.title = 'Turno operacional calculado localmente pelo NOC Flow';
        };
        update();
        setInterval(update, 60 * 1000);
    }

    function showToast(message, tone = 'success') {
        let container = q('#nocFlowToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'nocFlowToastContainer';
            container.className = 'ux-toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `ux-toast ${tone}`;
        toast.textContent = String(message || 'Operação concluída.');
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 240);
        }, 3200);
    }

    function installRoutineToasts() {
        if (typeof window.showModal !== 'function') return;
        const original = window.showModal;
        const routine = new Set(['Sucesso', 'Atualização registrada', 'Normalização registrada', 'Backup criado']);
        window.showModal = function (title, message) {
            if (routine.has(String(title))) {
                showToast(message || title, 'success');
                return;
            }
            return original(title, message);
        };
    }

    function makeNavGroup(label, nodes) {
        const group = document.createElement('nav');
        group.className = 'nav-group ux-nav-group';
        const heading = document.createElement('div');
        heading.className = 'nav-label';
        heading.textContent = label;
        group.appendChild(heading);
        nodes.filter(Boolean).forEach(node => group.appendChild(node));
        return group;
    }

    function backupBeforeReset() {
        const storage = {};
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key && key.startsWith('nocflow_v1_')) storage[key] = localStorage.getItem(key);
        }
        const payload = {
            schema: 'nocflow-public-backup',
            schemaVersion: 1,
            nocFlowVersion: config.version || '1.1.0',
            exportedAt: new Date().toISOString(),
            storage
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date();
        const pad = value => String(value).padStart(2, '0');
        link.href = url;
        link.download = `NOC_Flow_backup_antes_reinicio_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    function installResetShiftButton(systemGroup) {
        if (!systemGroup || q('#resetShiftBtn')) return;
        const divider = document.createElement('div');
        divider.className = 'ux-system-divider';
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'resetShiftBtn';
        button.className = 'nav-btn ux-danger-nav';
        button.innerHTML = '<span class="nav-icon">↻</span><span class="nav-text">Reiniciar plantão</span>';
        systemGroup.appendChild(divider);
        systemGroup.appendChild(button);

        button.addEventListener('click', () => {
            const shift = shiftApi.getOperationalShift ? shiftApi.getOperationalShift(new Date()) : null;
            const shiftId = shift ? shift.id : '';
            const confirmed = window.confirm(
                'Reiniciar o plantão atual?\n\n' +
                'Será feito um backup JSON automático antes da limpeza. Alertas ativos e os registros do turno atual serão removidos. A Base Operacional e o tema serão preservados.'
            );
            if (!confirmed) return;

            try {
                backupBeforeReset();
                const keys = [
                    'nocflow_v1_ActiveAlerts',
                    shiftId ? `nocflow_v1_Normalizations_${shiftId}` : '',
                    shiftId ? `nocflow_v1_ShiftEvents_${shiftId}` : '',
                    shiftId ? `nocflow_v1_Metrics_${shiftId}` : ''
                ].filter(Boolean);
                keys.forEach(key => localStorage.removeItem(key));
                localStorage.setItem('nocflow_v1_MigrationDone', '1');

                if (typeof window.setShiftLocalStorageKeys === 'function') window.setShiftLocalStorageKeys();
                if (typeof window.loadData === 'function') window.loadData();
                if (typeof window.renderAlerts === 'function') window.renderAlerts();
                if (typeof window.renderNormalizations === 'function') window.renderNormalizations();
                if (typeof window.updateCounters === 'function') window.updateCounters();
                showToast('Plantão reiniciado. Base Operacional e tema foram preservados.', 'success');
            } catch (error) {
                console.error('Falha ao reiniciar plantão:', error);
                if (typeof window.showModal === 'function') window.showModal('Erro', 'Não foi possível reiniciar o plantão. Exporte um backup manual e tente novamente.');
            }
        });
    }

    function reorganizeSidebar() {
        const sidebar = q('.sidebar');
        const footer = q('.sidebar-footer', sidebar || document);
        if (!sidebar || !footer || sidebar.dataset.uxReorganized === '1') return;

        const dashboard = q('[data-scroll="dashboard"]', sidebar);
        const newAlert = q('[data-workflow="alert"]', sidebar);
        const updateForm = q('[data-scroll="updateFormSection"]', sidebar);
        const normForm = q('[data-scroll="normalizationFormSection"]', sidebar);
        const active = q('[data-tab-nav="initial"]', sidebar);
        const updated = q('[data-tab-nav="updated"]', sidebar);
        const norms = q('[data-tab-nav="normalizations"]', sidebar);
        const base = q('#openOperationalBaseBtn', sidebar);
        const shift = q('#openShiftReportBtn', sidebar);
        const metrics = q('#openMetricsBtn', sidebar);
        const csv = q('#exportAllDataCsvBtn', sidebar);
        const backup = q('#backupDataBtn', sidebar);
        const restore = q('#restoreDataBtn', sidebar);
        const restoreInput = q('#restoreDataInput', sidebar);

        qa(':scope > .nav-group', sidebar).forEach(group => group.remove());

        const operationGroup = makeNavGroup('Operação', [dashboard, newAlert, updateForm, normForm, active, updated, norms]);
        const supportGroup = makeNavGroup('Apoio ao plantão', [base, shift]);
        const dataGroup = makeNavGroup('Dados', [metrics, csv]);
        const systemGroup = makeNavGroup('Sistema', [backup, restore, restoreInput]);
        installResetShiftButton(systemGroup);

        [operationGroup, supportGroup, dataGroup, systemGroup].forEach(group => sidebar.insertBefore(group, footer));
        sidebar.dataset.uxReorganized = '1';
    }

    function installNavigationState() {
        const operationalButtons = qa('.sidebar .nav-btn').filter(button =>
            button.matches('[data-scroll], [data-workflow], [data-tab-nav]')
        );
        function activate(button) {
            operationalButtons.forEach(item => item.classList.remove('active'));
            if (button) button.classList.add('active');
        }

        operationalButtons.forEach(button => button.addEventListener('click', () => {
            activate(button);
            let target = null;
            if (button.dataset.scroll) target = q(`#${button.dataset.scroll}`);
            if (button.dataset.workflow === 'alert') target = q('#alertFormSection');
            if (button.dataset.tabNav) target = q('#occurrencesWorkspace');
            if (target) {
                target.classList.add('ux-focus-target');
                setTimeout(() => target.classList.remove('ux-focus-target'), 1200);
            }
        }));
    }

    function installDashboardShortcuts() {
        const cards = qa('.stats-grid .stat-card');
        const targets = ['initial', 'updated', 'normalizations'];
        cards.slice(0, 3).forEach((card, index) => {
            const tabName = targets[index];
            card.classList.add('ux-clickable');
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Abrir ${card.querySelector('.stat-label')?.textContent || 'lista'}`);
            const open = () => q(`[data-tab-nav="${tabName}"]`)?.click();
            card.addEventListener('click', open);
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        });
    }

    function installSearchScope() {
        const search = q('#occurrenceSearch');
        const labels = {
            initial: 'Buscar em Alertas Ativos...',
            updated: 'Buscar em Atualizações...',
            normalizations: 'Buscar em Normalizações...'
        };
        if (!search) return;
        const refresh = () => {
            const active = q('.tab-btn[data-tab].active');
            search.placeholder = labels[active?.dataset.tab] || 'Buscar na lista atual...';
        };
        qa('.tab-btn[data-tab], [data-tab-nav]').forEach(button => button.addEventListener('click', () => setTimeout(refresh, 0)));
        refresh();
    }

    function installSortState() {
        const groups = [
            ['sortInitialAlertsByDateBtn', 'sortInitialAlertsByTimeBtn', 'sortInitialAlertsBySiteBtn'],
            ['sortUpdatedAlertsByDateBtn', 'sortUpdatedAlertsByTimeBtn', 'sortUpdatedAlertsBySiteBtn'],
            ['sortNormalizationsByDateBtn', 'sortNormalizationsByTimeBtn', 'sortNormalizationsBySiteBtn']
        ];
        groups.forEach(ids => {
            const buttons = ids.map(id => q(`#${id}`)).filter(Boolean);
            const select = button => buttons.forEach(item => item.classList.toggle('ux-selected', item === button));
            if (buttons[0]) select(buttons[0]);
            buttons.forEach(button => button.addEventListener('click', () => select(button)));
        });
    }

    function installContextualNextSteps() {
        const situation = q('#updateSituacaoAtual');
        const nextSteps = q('#updateProximosPassos');
        const guidance = config.workflowGuidance?.nextStepsBySituation || {};
        if (!situation || !nextSteps) return;

        function sync() {
            const selected = situation.value;
            const options = Array.isArray(guidance[selected]) ? [...guidance[selected]] : [];
            nextSteps.replaceChildren();
            if (!selected) {
                nextSteps.add(new Option('Selecione primeiro a Situação Atual', ''));
                nextSteps.disabled = true;
                return;
            }
            nextSteps.disabled = false;
            nextSteps.add(new Option('Selecione os próximos passos', ''));
            if (!options.includes('Outros')) options.push('Outros');
            options.forEach(text => nextSteps.add(new Option(text, text)));
        }

        situation.addEventListener('change', sync);
        sync();
    }

    function installNormalizationActions() {
        const select = q('#normAction');
        const additions = config.workflowGuidance?.additionalNormalizationActions || [];
        if (!select) return;
        additions.forEach(text => {
            const exists = [...select.options].some(option => option.value === text || option.textContent === text);
            if (!exists) select.add(new Option(text, text));
        });
    }

    function installMatchFeedback() {
        if (typeof window.findActiveOccurrenceMatch !== 'function') return;

        function attach(kind) {
            const isUpdate = kind === 'update';
            const site = q(isUpdate ? '#updateSite' : '#normSite');
            const itsm = q(isUpdate ? '#updateItsm' : '#normItsm');
            const protocol = q(isUpdate ? '#updateNumeroChamado' : '#normNumeroChamado');
            if (!site || !itsm || !protocol) return;

            const feedback = document.createElement('div');
            feedback.className = 'ux-match-feedback';
            site.parentElement.appendChild(feedback);

            const refresh = () => {
                const values = { site: site.value.trim(), itsm: itsm.value.trim(), numeroChamado: protocol.value.trim() };
                if (!values.site && !values.itsm && !values.numeroChamado) {
                    feedback.textContent = '';
                    feedback.className = 'ux-match-feedback';
                    return;
                }
                const match = window.findActiveOccurrenceMatch(values);
                if (match?.alert) {
                    feedback.textContent = '✓ Ocorrência ativa localizada';
                    feedback.className = 'ux-match-feedback success';
                } else if (match?.ambiguous) {
                    feedback.textContent = '⚠ Mais de uma correspondência possível';
                    feedback.className = 'ux-match-feedback warning';
                } else {
                    feedback.textContent = '⚠ Nenhuma ocorrência ativa localizada — o registro seguirá a regra atual';
                    feedback.className = 'ux-match-feedback warning';
                }
            };
            [site, itsm, protocol].forEach(input => {
                input.addEventListener('input', refresh);
                input.addEventListener('change', refresh);
            });
        }

        attach('update');
        attach('normalization');
    }

    function init() {
        applyVersionBranding();
        createShiftBadge();
        reorganizeSidebar();
        installNavigationState();
        installDashboardShortcuts();
        installSearchScope();
        installSortState();
        installContextualNextSteps();
        installNormalizationActions();
        installMatchFeedback();
        installRoutineToasts();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
