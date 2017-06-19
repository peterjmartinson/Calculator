var q = QUnit;

q.module('keyStroke()');
q.test('There is a module', function(assert) {
  assert.equal(typeof window.keyStroke, 'function', 'keyStroke is a function');
});

q.test('It returns a value', function(assert) {
  assert.equal(window.keyStroke('clear'), 'clear', 'it returns `clear`');
  assert.equal(window.keyStroke('pm'), 'pm', 'it returns `pm`');
  assert.equal(window.keyStroke(3), 3, 'it returns 3');
});

q.module('trim()');
q.test('It exists', function(assert) {
  assert.equal(typeof calculator.trim, 'function', 'trim is a function on C');
});

q.test('It returns a string', function(assert) {
  assert.equal(typeof calculator.trim(1), 'string', 'trim returns a string');
});

q.test('It returns a string of less than 10 characters', function(assert) {
  var a = [1.11111111, 1.111111111, 1.1111111111, 1.11111111111, 1.111111111111];
  for (let i = 0; i < a.length; i++) {
    assert.equal(calculator.trim(a[i]).length, 10);
  }
});

q.module('operate()');
q.test('It exists', function(assert) {
  assert.equal(typeof calculator.operate, 'function', 'operate is a function on C');
});
q.test('It performs the correct calculations', function(assert) {
  assert.equal(calculator.operate(1, '+', 1), '2', '1+1=2');
  assert.equal(calculator.operate(2, '-', 3), '-1', '2-3=-1');
  assert.equal(calculator.operate(3, '-', 2), '1', '3-2=1');
  assert.equal(calculator.operate(2, '*', 3), '6', '2*3=6');
  assert.equal(calculator.operate(10, '/', 5), '2', '10/5=2');
  assert.equal(calculator.operate(5, '/', 10), '0.5', '5/10=0.5');
  assert.equal(calculator.operate(1, '/', 0), 'DIV BY 0', 'DIV BY 0');
  assert.equal(calculator.operate('j', '/', 's'), 'NaN', 'NaN');
});

q.module('calState()');
q.test('It exists', function(assert) {
  assert.equal(typeof calculator.calState, 'function', 'calState is a function on C');
});
q.test('It returns the correct states', function(assert) {
  var A = 'empty',
      B = 'empty',
      c = 'empty',
      oA = 'empty',
      oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 1, 'state 1');
  A = 'empty';
  B = 'empty';
  c = 'empty';
  oA = '1';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 2, 'state 2');
  A = '1';
  B = '1';
  c = 'empty';
  oA = '1';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 3, 'state 3');
  A = '1';
  B = '1';
  c = 'empty';
  oA = '1';
  oB = '1';
  assert.equal(calculator.calState(A, B, c, oA, oB), 4, 'state 4');
  A = '1';
  B = '1';
  c = '1';
  oA = '1';
  oB = '1';
  assert.equal(calculator.calState(A, B, c, oA, oB), 5, 'state 5');
  A = 'DIV BY 0';
  B = 'empty';
  c = 'empty';
  oA = 'empty';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 6, 'state 6');
  A = 'empty';
  B = 'DIV BY 0';
  c = 'empty';
  oA = 'empty';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 6, 'state 6');
  A = 'ERROR';
  B = 'empty';
  c = 'empty';
  oA = 'empty';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 6, 'state 6');
  A = 'empty';
  B = 'ERROR';
  c = 'empty';
  oA = 'empty';
  oB = 'empty';
  assert.equal(calculator.calState(A, B, c, oA, oB), 6, 'state 6');
});
  
