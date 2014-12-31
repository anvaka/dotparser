/*
 * Grammar to parse the graphviz dot/xdot language.
 *
 * This file is based on https://github.com/siefkenj/dotgraph
 */

start
  = graph

graph "graph"
  = _ strict:"strict"i? _ type:("graph"i / "digraph"i) _ id:ID? _ "{" children:stmt_list "}" _ {
      var ret = {type:type.toLowerCase(), children:children};
      if (strict) { ret.strict = true }
      if (id) { ret.id = id }
      return ret;
    }

stmt_list
  = _ v:(s:stmt _ ';'? _ v:stmt_list? {return [s].concat(v||[]);})?  { return v; }

stmt
  // an assignment as a statement e.g. 'label=4' is shorthand for 'graph [label=4]',
  // so let's just pretend that's what we wrote
  = left:ID _ '=' _ right:ID {
    return {
      type:'attr_stmt',
      target:'graph',
      attr_list:[{
        type:'attr',
        id:left,
        eq:right
      }]
    };
  }
  / attr_stmt
  / edge_stmt
  / subgraph
  / node_stmt
  / ID '=' ID

attr_stmt
  = target:('graph'i/'node'i/'edge'i) attr:attr_list {
     return {
       type:'attr_stmt',
       target:target,
       attr_list:attr
     };
  }

attr_list
  = _ '[' list:a_list? ']' _ rest:attr_list? {
    return (list || []).concat(rest || []);
  }

a_list
  = _ id:ID eq:(_ '=' _ id:ID {return id})? _ ','? rest:a_list? {
        return [{
          type:'attr',
          id:id,
          eq:eq || null
        }].concat(rest || []);
    }

edge_stmt
  = id:(subgraph / node_id) rhs:edgeRHS attr:attr_list? {
       var edge_list = [id];
       edge_list = edge_list.concat(rhs.map(function(v){return v.id}));

       return {
         type:'edge_stmt',
         edge_list:edge_list,
         attr_list:attr || []
       };
    }

edgeRHS
  = _ edgeop:('->'/'--') _ id:(subgraph / node_id) _ rest:edgeRHS? {
      return [{
        type:'edgeRHS',
        edgeop:edgeop,
        id:id
      }].concat(rest || []);
  }

node_stmt
  = id:node_id attr:attr_list? {
    return {
      type:'node_stmt',
      node_id:id,
      attr_list:attr || []
    };
  }

node_id
  = id:ID port:port? {
      return port ? {
        type:'node_id', id:id, port:port
      } : {
        type:'node_id', id:id
      };
  }

port 'port'
  = ':' id:ID pt:(':' pt:compass_pt {return pt})? {
    return {
      type:'port',
      id:id,
      compass_pt:pt || null
    };
  }
  //I think this rule is never used...
  / ':' pt:compass_pt {
    return {
      type:'port',
      compass_pt:pt || null
    }
  }

subgraph
  = g:('subgraph'i _ id:ID? _ {
        return id ? {
          type:'subgraph', id:id
        } : {
          type:'subgraph'
        }
      })? '{' s:stmt_list '}' {
        g = g || {
          type:'subgraph'
        };
        g.children = s || [];
        return g;
      }
  / 'subgraph'i _ id:ID {
      return {
        type:'subgraph',
        id:id,
        children:[]
      };
    }

compass_pt
  = 'n'/'ne'/'e'/'se'/'s'/'sw'/'w'/'nw'

ID
  = STRING
  / NUMBER
  / QUOTED_STRING
  / HTML_STRING

STRING
  = v:([a-zA-Z_][a-zA-Z0-9_]*) {
      return v[0]+v[1].join('');
    }

NUMBER "NUMBER"
  = n:("-"? ("." [0-9]+ / [0-9]+("." [0-9]*)?)) {
       return parseFloat(text());
    }

/* html strings are enclosed in <>. The inside of those strings is xml.  All we
 * care about is a balanced number of <'s and >'s, so we can simplify our life
 * a little by just matching balanced expressions, and then returning what's
 * inside the outermost <> pair
 */
HTML_STRING
  = v:html_raw_string {
      return {
        type:'id',
        value:v.slice(1,v.length-1),
        html:true
      };
    }

html_raw_string
  = '<' v:(html_char / html_raw_string)* '>' {
      return '<' + v.join('') + '>';
    }

html_char
  = v:(!('>'/'<') v:. { return v; })+ { return v.join(""); }

QUOTED_STRING
  = '"' '"' {return "";}
  / v:('"' chars ("\\" NEWLINE chars)? '"') rest:(_ '+' _ v:QUOTED_STRING {return v})? { return rest === null ? v[1] : (v[1] + rest); }

chars
  = chars:char+ { return chars.join(""); }

char
  = [^"\\\0-\x1F\x7f]
  / '\\"' { return '"'; }
  / '\\' NEWLINE { return ""; }
  / '\\' { return '\\'; }


COMMENT "COMMENT"
 = (BLOCK_COMMENT / C_COMMENT / MACRO_COMMENT)

BLOCK_COMMENT "BLOCK_COMMENT"
  = "/*" v:(!"*/" v:. {return v;})* "*/" { return v.join('') }

C_COMMENT "C_COMMENT"
  = "//" v:(![\n] v:. { return v; })* [\n]? { return v.join(''); }

MACRO_COMMENT "MACRO_COMMENT"
  = "#" v:(![\n] v:. { return v; })* [\n]? { return v.join(''); }


_ "WHITESPACE"
  = (WHITESPACE / COMMENT)*

NEWLINE
  = [\n\r]+

WHITESPACE
  = ([ \t] / NEWLINE)+
