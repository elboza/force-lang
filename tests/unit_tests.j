#!../src/force -f

: eq = ;

: assert
	.
	!!
	T = if "...failed" . 1 nbye else "...ok" . then ;

T T ( === )  "true is true" assert

F T ( === not )  "false is not true" assert

F F  ( === )  "false is false" assert

false false  ( === )  "false is false" assert

true true  ( === )  "true is true" assert

11 11 ( === )  "numbers eq" assert

"foo" "foo" ( === )  "string eq 'foo' is 'foo'" assert

[22,33,44] [22,33,44] ( === not ) "list eq '[22,33,44]' is '[22,33,44]'" assert

{foo:2,bar:3} {foo:2,bar:3} ( == not ) "object eq '{foo:2,bar:3}' is '{foo:2,bar:3}'" assert

[22,33,44] 1 a:@ 33 ( === ) "array at [22,33,44][1] is 33" assert

{foo:2,bar:3} "foo" 22 m:! "foo" m:@ 22 ( === ) "obj at obj.foo=22" assert

T if F else T then T ( === ) "if true cond" assert

F if T else F then T ( === ) "if false cond" assert

3 begin dup 0 > while 1 - repeat 0 ( === ) "while cond" assert

3 begin dup 0 = while 1 - repeat 3 ( === ) "while not enter loop" assert

33 case
dup 44 === of F endof
dup 33 === of T endof
T of F endof
endcase
T ( === ) "case of" assert

33 case
dup 44 === of F endof
dup 55 === of F endof
T of T endof
endcase
T ( === ) "case of default" assert

33 44 swap 33 ( === ) "swap" assert drop

33 44 drop 33 ( === ) "drop" assert

2 3 + 5 ( === ) "add" assert

3 2 - 1 ( === ) "minus" assert

"az" "qe" + "azqe" ( === ) "string plus" assert

// [22,33] [44,55] + [22,33,44,55] ( == ) "aray plus" assert

"qwerty" 1 s:@ "w" ( === ) "string at" assert

