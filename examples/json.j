var a       // define a variable 'a'
{x:2, y:"mystring", z:[22,33,44]} // create a json object
a !         // save it to the variable

a @ "x" m:@ .   // prints a.x (or a[x])

a @ "z" m:@ 1 a:@ .  // prints a.z[1]

a @ "y" m:@ .  // prints a.y (or a[y])
