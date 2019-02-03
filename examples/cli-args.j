#!/usr/local/bin/force


os:argv @ .

[
['-x','--xray','y','pippo'],
['-h','--help','n'],
['-k','--kkk','?']
]
os:parse-args
