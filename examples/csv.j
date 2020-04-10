// print the 2nd field of the row if the 1st is equal to number 2

"1:aaa:1234\n2:bbb:2222\n3:ccc:4444\n4:ddd:5555"
dup .
'\n' s:split
.s
( ':' s:split
dup
0 a:@ 2 == if
drop
else
1 a:@ .
then
) a:each

