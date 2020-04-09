: myAdder
 1 + ;

: myAdder
 2 + ;

 1 myAdder .
 'myAdder' G:delete
 1 myAdder .
 
 : handle
   drop // drop the error thrown
   "this is the stack now..." .
   .s
   "my custom handle" .
   // dont exit the program. return to main.
 ;

"22 + ." .
 22 + . // (+) will fail but 22 is still on TOS. (.)this will print 22
 "hi" .

'handle' G:delete  // restore standard error handler (will print the error and exit)
22 + .
 "hi again" .  // this is never executed.