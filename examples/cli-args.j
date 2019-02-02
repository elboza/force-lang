#!/usr/local/bin/force

: os:parse-args

;

os:argv @ .

[
['x','xray','y','pippo'],
['h','help','n'],
['k','kkk','?']
]
os:parse-args
