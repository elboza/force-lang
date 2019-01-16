"../examples/testjs.js" j:require-js

var a          //declare variable a
a !            // assign the required js to the var a
a @            // put the content of the var a in TOS
"kk2" !! .     // execute method 'kk2' and print output

a @            // put the content of the var a in TOS
"kk" m:@ !! .  //put the value of 'kk' in TOS (its a function) and execute that function and print output
