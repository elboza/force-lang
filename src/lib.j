: cr
	10 emit ;

: true
	T ;

: false
	F ;

: is_truthy
	is_falsy not ;

: nip
	swap drop ;

: ddup
	over over ;

: ndrop2
  dup is_num if
  'no number on TOS' throw else
  begin dup 0 > while 1 - swap drop repeat drop then
  ;

: ddrop
	drop drop ;

: f+
	case
	dup is_string of s:+ endof
	over is_string of s:+ endof
	dup is_list of a:+ endof
	dup is_num of n:+ endof
	endcase ;

: a:join
	s:join ;

: j:encode
	j:stringify ;

: j:decode
	j:parse ;

: a:nth \ (a n -- o)
	0 begin ddup > while >r >r a:tail r> r> 1 + repeat ddrop a:shift ;
