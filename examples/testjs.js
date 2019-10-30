module.exports= {
	foo:2,
	bar:"pluto",
	kk:()=>{return 2;},
	succ:(x)=>{return x+1;},
	add:(x,y)=>{return x+y;},
	kk2:function(){ return this.bar;},
	alvaro: function(){return "ww";},
	pp: function(){return Promise.resolve(2);}
}