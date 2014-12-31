var test = require('tap').test;
var parse = require('../');

test('it can parse empty graph', function (t) {
  var ast = parse('graph {}');
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.children, null, 'No graph');

  t.end();
});
