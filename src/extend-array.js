if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/)  {  
    var len = this.length >>> 0;  
  
    var from = Number(arguments[1]) || 0;  
    from = (from < 0)  
         ? Math.ceil(from)  
         : Math.floor(from);  
    if (from < 0)  
      from += len;  
  
    for (; from < len; from++) {  
      if (from in this &&  
          this[from] === elt)  
        return from;  
    }  
    return -1;  
  };  
}

Array.prototype.flatten = function () {
	var result = [],
	    i,
	    len,
	    item,
	    proto = Array.prototype;

	for (i = 0, len = this.length; i < len; i++) {
		item = this[i];
		if (Object.prototype.toString.call(item) === "[object Array]") {
			proto.push.apply(result, proto.flatten.call(item));
		} else {
			result.push(item);
		}
	}
	return result;
};

Array.prototype.last = function () {
	return this[this.length - 1];
};

Array.prototype.deleteItem = function (item) {
	var i = this.indexOf(item);

	i !== -1 && this.splice(i, 1);
};

Array.prototype.shuffle = function () {
	var i = this.length,
	    r,
	    item,
	    temp;

	while (--i) {
		r = ~~(Math.random() * i);
		item = this[i];
		temp = this[r];
		this[r] = item;
		this[i] = temp;
	}
};
