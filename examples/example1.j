//count down from 10 to zero


: xx dup . 1 - dup 0 > if xx then ; 10 xx .

// the putput will be:
// 10
// 9
// 8
// 7
// 6
// 5
// 4
// 3
// 2
// 1
// 0
