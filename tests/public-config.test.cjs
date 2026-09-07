const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadPublicConfig() {
  const source = fs.readFileSync(path.join(root, 'config', 'operation.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'config/operation.js' });
  return { config: sandbox.window.NOCFLOW_CONFIG, source };
}

test('public configuration is explicitly demonstrative', () => {
  const { config } = loadPublicConfig();
  assert.equal(config.version, '1.1.0');
  assert.equal(config.base.environment, 'DEMO');
  assert.match(config.operationName, /demonstra/i);
  assert.match(config.client.name, /demonstra/i);
  assert.match(config.client.legalName, /fict/i);
  assert.match(config.contacts.noc, /não informado|demonstra/i);
  assert.equal(config.base.records.length, 3);
  assert.ok(config.carriers.every(name => /fict/i.test(name)));
});

test('embedded records cannot look like real operational data', () => {
  const { config } = loadPublicConfig();
  for (const record of config.base.records) {
    assert.match(record.ibm, /^900000[1-9]$/);
    assert.match(record.centroCusto, /^DEMO-/);
    assert.match(record.cnpj, /fict/i);
    assert.match(record.telefone, /fict/i);
    assert.match(record.endereco, /fict/i);
    assert.match(record.unidade, /^Unidade /);

    for (const link of Object.values(record.links || {})) {
      assert.match(link.designacao, /^DEMO-LINK-/);
      assert.match(link.operadora, /fict/i);
    }
  }
});

test('workflow guidance remains generic and configurable', () => {
  const { config } = loadPublicConfig();
  const guidance = config.workflowGuidance;
  assert.ok(guidance && guidance.nextStepsBySituation);
  assert.ok(Array.isArray(guidance.additionalNormalizationActions));
  assert.ok(guidance.additionalNormalizationActions.includes('Energia elétrica restabelecida na localidade'));
  assert.ok(Object.values(guidance.nextStepsBySituation).every(options => Array.isArray(options) && options.length > 0));
});

test('v1.1 bootstrap, UX and metadata bridge scripts compile', () => {
  for (const relative of ['assets/js/config.js', 'assets/js/ux-v1.1.js', 'assets/js/version-v1.1.js']) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.doesNotThrow(() => new vm.Script(source, { filename: relative }));
  }
});

test('source files do not contain hard-coded secret assignments', () => {
  const files = [
    'config/operation.js',
    'assets/js/config.js',
    'assets/js/app.js',
    'assets/js/demo.js',
    'assets/js/operational-base.js',
    'assets/js/parser.js',
    'assets/js/shift.js',
    'assets/js/ux-v1.1.js',
    'assets/js/version-v1.1.js'
  ];
  const assignment = /\b(password|senha|token|secret|api[_-]?key|credencial)\b\s*[:=]\s*["'][^"']{4,}["']/i;
  for (const relative of files) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.doesNotMatch(source, assignment, `${relative} contém possível segredo hard-coded`);
  }
});
