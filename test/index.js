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
