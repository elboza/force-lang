# Force lang
### (force-lang)

## naming the lang 
Force is a modern dialect of Forth written in NodeJS and can use the NodeJS packages universe.
It is called Force because of its assonance of Forth and since the Force is the main power of the Jedi the files have .j (or .jedi) extension. So Force is the Jedi programmers language !

## using Force as standalone interpreter
```bash
$ npm install force-lang -g

$ force -h

Usage: force [options] <file ...>

Options:
  -V, --version      output the version number
  -x, --exec [text]  input from string
  -i, --shell        run repl
  -s, --stdin        input from stdin (default action)
  -h, --help         output usage information
```

## using Force in script
```text
$ cat example.j

#!/usr/local/bin/force

2 2 + .
```
## using force in shell
```bash
echo "2 2 + ."|force
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
or using sync functions:
```javascript
const force = require ('force-lang');

var x = '2 2 + .';

force.load_lib_sync();
force.exec(x);
```
## repl multiline
in the force-lang repl `force -i` you can input multiline by appending `\` (backslash) at the end of the current line before enter

## language constructs
```text
( ... )       \ lambda func
example: ( 1 2 + )

see ...       \ see function definition
example: see cr

... if ... else ... then
              \ if ( x -- )
              \ else ( -- )
              \ then ( -- )
example: T if "no" . else "yes" . then

... begin ...while  ...repeat
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
 dup "foo" =  of "it's foo string" .           endof
 dup 33 =     of "it's 33 number !!" .         endof
 dup 10 <     of "it's a number minor fo 10" . endof
 T            of "default action..."           endof
endcase
\ ( 33 is not consumed has to be removed manually )
```
## functions prefix
functions name can be prefixed to give more meaningful name to the function and the type it act on.
For example `@` is applied to normal variables to get values, `a:@` applies to array, `m:@` applies to maps (hash).
The main prefixes are:
```text
n:    for numbers
s:    for string
j:    for json
net:  for network
a:    for array
m:    for maps (hash)
f:    for file
G:    for Globals
```
## functions signatures
in the comments of the stadard lib section is described the stack consumption and the type that the function requires.
```text
o       object (map)
a       array
b       boolean
n       number
s       string
j       json
srx     string regex
x       can be all types
y       can be all types
z       can be all types
lambda  lambda function
f_js    javascript function
p       promise
v       variable name
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
await         \ ( p -- x )
```
