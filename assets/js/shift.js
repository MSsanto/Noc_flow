

(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.NocFlowShift = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function pad2(value) {
        return String(value).padStart(2, '0');
    }

    function getDateKey(date = new Date()) {
        return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    }

    function parseLocalBoundary(dateKey, timeText) {
        const [year, month, day] = String(dateKey).split('-').map(Number);
        const [hour, minute] = String(timeText).split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, 0, 0);
    }

    function formatDateBr(dateKey) {
        const [year, month, day] = String(dateKey).split('-');
        return `${day}/${month}/${year}`;
    }

    function getOperationalShift(date = new Date()) {
        const stamp = new Date(date);
        const hour = stamp.getHours();
        const base = new Date(stamp.getFullYear(), stamp.getMonth(), stamp.getDate(), 12, 0, 0, 0);
        let kind;

        if (hour >= 6 && hour < 18) {
            kind = 'DAY';
        } else {
            kind = 'NIGHT';
            if (hour < 6) base.setDate(base.getDate() - 1);
        }

        const baseDateKey = getDateKey(base);
        const start = parseLocalBoundary(baseDateKey, kind === 'DAY' ? '06:00' : '18:00');
        const end = new Date(start);
        end.setHours(end.getHours() + 12);

        return {
            id: `${baseDateKey}_${kind}`,
            kind,
            baseDateKey,
            start,
            end,
            label: `${kind === 'DAY' ? 'Diurno' : 'Noturno'} · ${formatDateBr(baseDateKey)} · ${kind === 'DAY' ? '06:00–18:00' : '18:00–06:00'}`
        };
    }

    function currentShiftWindow(shift = getOperationalShift()) {
        return {
            dateKey: shift.baseDateKey,
            startTime: shift.kind === 'DAY' ? '06:00' : '18:00',
            endTime: shift.kind === 'DAY' ? '18:00' : '06:00'
        };
    }

    return { pad2, getDateKey, parseLocalBoundary, formatDateBr, getOperationalShift, currentShiftWindow };
});


