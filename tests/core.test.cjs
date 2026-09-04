const {test} = require('node:test');
const assert = require('node:assert/strict');
const parser = require('../assets/js/parser.js');
const shift = require('../assets/js/shift.js');
test('WAN 1 and WAN 2 merge within one minute, but separate sites remain distinct', () => {
 const rows = parser.processAlertLines('04-09-2026 07:25:29 Monitoramento Unidade Aurora - SP_9000001 - WAN 1 com problemas!\n04-09-2026 07:25:59 Monitoramento Unidade Aurora - SP_9000001 - WAN 2 com problemas!\n04-09-2026 07:25:59 Monitoramento Unidade Horizonte - SP_9000002 - WAN 1 com problemas!');
 assert.equal(rows.length, 2);
 assert.equal(parser.getWanFields(rows[0].wanStatuses).wanStatus, 'WAN 1 e WAN 2');
});
test('midnight belongs to previous night shift; 06:00 opens day shift', () => {
 assert.equal(shift.getOperationalShift(new Date(2026,8,4,0,5)).id, '2026-09-03_NIGHT');
 assert.equal(shift.getOperationalShift(new Date(2026,8,4,6,0)).id, '2026-09-04_DAY');
});
test('malformed monitoring input produces no occurrence', () => {
 assert.deepEqual(parser.processAlertLines('texto incompleto'), []);
});
