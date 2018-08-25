// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
  mod(require("codemirror//lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
  define(["codemirror/lib/codemirror"], mod);
  else // Plain browser env
  mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode('cmips', function(_config, parserConfig) {
  // var ez80 = parserConfig.ez80;
  var keywords1, keywords2, keywords3;


  keywords1 = /^(ADDU?|SUBU?|AND|X?N?OR|S(L|R)LR?|SRA|SLTU?|JR|MULTU?|DIVU?|MF(HI|LO))\b/i;
  keywords2 = /^(ADDIU?|SUBIU|SLTIU?|(L|S)HW|B(EQ|NE)|SYS)\b/i;
  keywords3 = /^J(AL|ump)?\b/i;
  var variables = /^(\$[0-8]|\$ra|\$sp)\b/i;
//  var variables2 = /^(n?[zc]|p[oe]?|m)\b/i;
  //var errors = /^([hl][xy]|i[xy][hl]|slia|sll)\b/i;
  var numbers = /^(0x[\da-f]+|0[0-7]|0b[01]+|-?\d+)\b/i;

  return {
    startState: function() {
      return {
        context: 0
      };
    },
    token: function(stream, state) {
      if (!stream.column())
        state.context = 0;

      if (stream.eatSpace())
        return null;

      var w;
      stream.eatWhile(/\S/);
      w = stream.current();

      if (/(\/\/|#)/.test(w)) {
        stream.skipToEnd();
        return 'comment';
      }else if (/^\w+\b:/.test(w)) {
        stream.skipToEnd();
        return 'def';
      }else if (keywords1.test(w)) {
        // state.context = 1;
        return 'keyword';
      } else if (keywords2.test(w)) {
        // state.context = 2;
        return 'keyword';
      }else if (keywords3.test(w)) {
        // state.context = 2;
        return 'keyword';
      } else if (variables.test(w)) {
        return 'variable';
      } else if (numbers.test(w)) {
        return 'number';
      }


 
      return null;



    }


  };
});

CodeMirror.defineMIME("text/x-cmips", { name: "cmips", cmips: true });

});
