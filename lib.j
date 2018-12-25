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

: ddrop
	drop drop ;
: f+
	dup
	case
	dup is_num of n:+ endof
	endcase ;
