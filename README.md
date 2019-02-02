# Force lang
### (force-lang)

## naming the lang 
Force is a modern dialect of Forth written in NodeJS and can use the NodeJS packages universe.
It is called Force because of its assonance of Forth and since the Force is the main power of the Jedi the files have .j (or .jedi) extension. So Force is the Jedi programmers language !

## using Force as standalone interpreter
```bash
$ npm install force-lang -g

$ force -h

Usage: force [options]

Options:
  -V, --version      output the version number
  -f, --file [file]  input from file
  -x, --exec [text]  input from string
  -i, --shell        run repl
  -s, --stdin        input from stdin
  -h, --help         output usage information
```

## using Force in script
```text
$ cat example.j

#!/usr/local/bin/force -f

2 2 + .
```
## using Force as node module

```bash
$ npm i force-lang
```

```javascript
const force = require ('force-lang');

var x = '2 2 + .';

(async function(){
  await force.load_lib();
  force.exec(x);
})();
```

## language constructs
```text
( ... )       \ lambda func
example: ( 1 2 + )

see xxx       \ see function definition
example: see cr

... if ... else ... then
              \ if ( x -- )
              \ else ( -- )
              \ then ( -- )
example: T if "no" . else "yes" . then

... begin ... repeat ... while
              \ begin ( -- )
              \ repeat ( -- )
              \ while ( b -- )
example: 3 begin dup 0 > while 1 - repeat .

case
... of ... endof
... of ... endof
...
endcase
              \ case ( -- )
              \ of ( b -- )
              \ endof ( -- )
              \ endcase ( -- )
example:
33
case
 "foo" =  of "it's foo string" .           endof
 33 =     of "it's 33 number !!" .         endof
 10 <     of "it's a number minor fo 10" . endof
 T        of "default action..."           endof
endcase
\ ( 33 is not consumed has to be removed manually )
```

## standard lib
```text
bye           \ ( -- )
noop          \ ( -- )
.s            \ ( -- )
.e            \ ( -- )
words         \ ( -- )
emit          \ ( n -- )
.             \ ( x -- )
.?            \ ( x -- )
!             \ ( x v -- )
@             \ ( v -- x )
not           \ ( b -- b )
and           \ ( b -- b )
or            \ ( b -- b )
is_num        \ ( n -- b )
is_string     \ ( s -- b )
is_list       \ ( a -- b )
is_falsy      \ ( x -- b )
dup           \ ( x -- x x )
swap          \ ( x y -- y x )
drop          \ ( x -- )
ndrop         \ ( x n -- )
nbye          \ ( n -- )
over          \ ( x y -- x y x )
n:+           \ ( n n -- n )
n:-           \ ( n n -- n )
n:*           \ ( n n -- n )
n:/           \ ( n n -- n )
+             \ ( x y -- z )
-             \ ( x y -- z )
*             \ ( x y -- z )
/             \ ( x y -- z )
%             \ ( x y -- z )
handle        \ ( e -- )
throw         \ ( s -- ) or ( o -- )
s:+           \ ( s s -- s )
a:+           \ ( a a -- a )
included      \ ( s -- x )
a:@           \ ( a n -- x )
a:!           \ ( a n x -- a )
m:@           \ ( o s -- x )
m:!           \ ( o s x -- a )
a:length      \ ( a -- n )
a:push        \ ( a x -- a )
a:pop         \ ( a -- x )
m:keys        \ ( o -- a )
m:values      \ ( o -- a )
s:split       \ ( s s -- a )
s:join        \ ( a s -- s )
j:stringify   \ ( j -- s )
j:parse       \ ( s -- j )
s:@           \ ( s n -- s )
s:!           \ ( s n s -- s )
=             \ ( x y -- b )
===           \ ( x y -- b )
==            \ ( x y -- b )
<             \ ( x y -- b )
>             \ ( x y -- b )
<=            \ ( x y -- b )
>=            \ ( x y -- b )
f:slurp       \ ( s -- s )
net:request   \ ( o -- s )
j:require-js  \ ( s -- x )
!!            \ ( lambda -- ) or ( f_js -- ) or ( j s -- )
G:delete      \ ( s -- )
cr            \ ( -- )
true          \ ( -- b )
false         \ ( -- b )
is_truthy     \ ( x -- b )
nip           \ ( x y -- y )
ddup          \ ( x y -- x y x y )
ddrop         \ ( x y -- )
f+            \ ( x y -- z )
a:join        \ ( a s -- s )
j:encode      \ ( j -- s )
j:decode      \ ( s -- j )
rx:test       \ ( s srx -- b ) or (s j -- b )
rx:exec       \ ( s srx -- j ) or (s j -- j )
rx:match      \ ( s srx -- j ) or (s j -- j )
rx:search     \ ( s srx -- n ) or (s j -- n )
rx:replace    \ ( s s srx -- s ) or (s s j -- s )
a:shift       \ ( a -- x )
a:unshift     \ ( a x -- a )
a:each        \ ( a f -- )
```
