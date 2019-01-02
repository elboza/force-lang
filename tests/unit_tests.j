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

