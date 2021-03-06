module.exports={
	stringify: function(obj, prop) {
  	var placeholder = '____PLACEHOLDER____';
  	var fns = [];
  	var json = JSON.stringify(obj, function(key, value) {
  	  if (typeof value === 'function') {
  	    fns.push(value);
  	    return placeholder;
  	  }
  	  return value;
  	}, 0);
  	json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function(_) {
  	  return fns.shift();
  	});
  	//return 'this["' + prop + '"] = ' + json + ';';
  	return json;
	}
}