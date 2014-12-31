var test = require('tap').test;
var parse = require('../');

test('it can parse empty graph', function (t) {
  var ast = parse('graph {}');
  t.equals(ast.type, 'graph', 'graph type is there');
  t.equals(ast.children, null, 'No children');

  t.end();
});

test('it can read quoted strings', function (t) {
  var ast = parse('graph "G" {}');
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 'G', 'graph id is there');
  t.equals(ast.children, null, 'No children');

  t.end();
});

test('it can read numerics', function (t) {
  var ast = parse('graph 42 {}');
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 42, 'graph id is there');
  t.equals(ast.children, null, 'No children');

  t.end();
});

test('it can read unicode', function (t) {
  var ast = parse('graph こんにちは世界{}');
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 'こんにちは世界', 'graph id is there');
  t.equals(ast.children, null, 'No children');

  t.end();
});

test('it can handle anything within quotes', function (t) {
  var id = "A\t";
  var ast = parse('graph "' + id + '" {}');
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, id, 'graph id is there');
  t.equals(ast.children, null, 'No children');

  t.end();
});

test('it escapes only quotes', function (t) {
  // dot file spec tells us to escape only one sequence: \", the rest should be
  // shown as is.
  var id = 'A\\"';
  var ast = parse('graph "' + id + '" {}');
  t.equals(ast.id, 'A"', 'graph id is there');

  // now let's render '\\':
  id = 'A\\\\';
  ast = parse('graph "' + id + '" {}');
  t.equals(ast.id, 'A\\\\', 'graph id is there');

  t.end();
});
