var test = require('tap').test;
var parse = require('../');

test('it can parse empty graph', function (t) {
  var ast = parse('graph {}')[0];
  t.equals(ast.type, 'graph', 'graph type is there');
  t.ok(Array.isArray(ast.children), 'has children array...');
  t.equals(ast.children.length,  0, '...and it is empty');

  t.end();
});

test('it can parse huge graphs', function(t) {
  var linksCount = 10000;
  var lines = ['graph {'];
  for (var i = 0; i < linksCount; ++i) {
    lines.push(i + ' -> ' + (i + 1));
  }
  lines.push('}');
  var graph = lines.join('\n');
  var ast = parse(graph)[0];
  t.equals(ast.children.length, linksCount, 'All edge statements are here');
  t.end();
});

test('it can parse graphs with nodes', function(t) {
  var ast = parse('graph {a; b;}')[0];
  t.equals(ast.children.length, 2, 'Two nodes found');
  t.equals(ast.children[0].type, 'node_stmt', 'Correct type for node');
  t.equals(ast.children[1].type, 'node_stmt', 'Correct type for node');

  t.end();
});

test('it can parse graphs with edges', function(t) {
  var ast = parse('graph {a -> b; b->c}')[0];
  t.equals(ast.children.length, 2, 'Two edges found');
  t.equals(ast.children[0].type, 'edge_stmt', 'Correct type for edge');
  t.equals(ast.children[1].type, 'edge_stmt', 'Correct type for edge');

  t.end();
});

test('it can parse graphs with mixed nodes/edges', function(t) {
  var ast = parse('graph {a -> b; c}')[0];
  t.equals(ast.children.length, 2, 'Two types found');
  t.equals(ast.children[0].type, 'edge_stmt', 'Correct type for edge');
  t.equals(ast.children[1].type, 'node_stmt', 'Correct type for node');

  t.end();
});

test('it can parse graphs with subgraphs', function(t) {
  var ast = parse('graph {{b c}}')[0];
  t.equals(ast.children.length, 1, 'type is found');
  t.equals(ast.children[0].type, 'subgraph', 'Correct type for subgraph');
  t.equals(ast.children[0].children.length, 2, 'Correct number of children in subgraph');

  t.end();
});

test('it can parse anonymous subgraphs', function(t) {
  var ast = parse('graph { {} }')[0];
  t.equals(ast.type, 'graph', 'graph type is there');
  t.equals(ast.children.length, 1, 'type is found');
  t.equals(ast.children[0].type, 'subgraph', 'Correct type for subgraph');
  t.equals(ast.children[0].children.length, 0, 'Correct number of children in subgraph');

  t.end();
});

test('it can parse named subgraphs', function(t) {
  var ast = parse('graph { subgraph s1 {} }')[0];
  t.equals(ast.type, 'graph', 'graph type is there');
  t.equals(ast.children.length, 1, 'type is found');
  t.equals(ast.children[0].type, 'subgraph', 'Correct type for subgraph');
  t.equals(ast.children[0].children.length, 0, 'Correct number of children in subgraph');

  t.end();
});

test('it can parse multiple anonymous subgraphs', function(t) {
  var ast = parse('graph { {}{} }')[0];
  t.equals(ast.type, 'graph', 'graph type is there');
  t.equals(ast.children.length, 2, 'type is found');
  t.equals(ast.children[0].type, 'subgraph', 'Correct type for subgraph');
  t.equals(ast.children[1].type, 'subgraph', 'Correct type for subgraph');

  t.end();
});

test('it can parse multiple graphs', function (t) {
  var ast = parse('graph a {}\rgraph b {}');

  t.equals(ast.length, 2, 'two graphs');
  t.equals(ast[0].id, 'a', 'graph a is there');
  t.equals(ast[1].id, 'b', 'graph a is there');

  t.end();
});

test('it can read quoted strings', function (t) {
  var ast = parse('graph "G" {}')[0];
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 'G', 'graph id is there');
  t.ok(Array.isArray(ast.children), 'has children array...');
  t.equals(ast.children.length,  0, '...and it is empty');

  t.end();
});

test('it can read numerics', function (t) {
  var ast = parse('graph 42 {}')[0];
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 42, 'graph id is there');
  t.ok(Array.isArray(ast.children), 'has children array...');
  t.equals(ast.children.length,  0, '...and it is empty');

  t.end();
});

test('it can read unicode', function (t) {
  var ast = parse('graph こんにちは世界{}')[0];
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, 'こんにちは世界', 'graph id is there');
  t.ok(Array.isArray(ast.children), 'has children array...');
  t.equals(ast.children.length,  0, '...and it is empty');

  t.end();
});

test('it can handle anything within quotes', function (t) {
  var id = "A\t";
  var ast = parse('graph "' + id + '" {}')[0];
  t.equals(ast.type, 'graph', 'graph is there');
  t.equals(ast.id, id, 'graph id is there');
  t.ok(Array.isArray(ast.children), 'has children array...');
  t.equals(ast.children.length,  0, '...and it is empty');

  t.end();
});

test('it escapes only quotes', function (t) {
  // dot file spec tells us to escape only one sequence: \", the rest should be
  // shown as is.
  var id = 'A\\"';
  var ast = parse('graph "' + id + '" {}')[0];
  t.equals(ast.id, 'A"', 'graph id is there');

  // now let's render '\\':
  id = 'A\\\\';
  ast = parse('graph "' + id + '" {}')[0];
  t.equals(ast.id, 'A\\\\', 'graph id is there');

  t.end();
});

test('it ignore whitespace in attributes list', function (t) {
  // we have empty attributes list, and whitespace between them:
  var ast = parse('digraph { graph [\r]} ')[0];
  t.equals(ast.type, 'digraph', 'graph type is there');
  t.equals(ast.children[0].target, "graph", "attributes are there");
  t.end();
});
