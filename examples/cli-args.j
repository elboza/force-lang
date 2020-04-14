#!/usr/local/bin/force


os:argv @ .

[
['-x','--xray','y','pippo'],
['-h','--help','n'],
['-k','--kkk','?']
]
os:parse-args .s

// run with:
// ./cli-args.j -x 99
// the putput will be:
// ["/usr/local/bin/node","/usr/local/bin/force","./cli-args.j","-x","99"]
// { argv: [], xray: '99' }