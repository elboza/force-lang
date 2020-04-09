"hi" .
: handle // redefine my custom error handler
drop // drop error message
"my first custom error" .
;

"my first error" throw
'handle' G:delete //remove my custom error handler

"my second error" throw
"bye bye" . // this is never executed (standard error handler will exit the program)