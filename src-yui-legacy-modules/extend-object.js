Object.prototype.mapToFloat = function () {
	var p;

	for (p in this) {
		if (this.hasOwnProperty(p)) {
			this[p] = parseFloat(this[p]);
		}
	}

	return this;
}

Object.prototype.mapAppend = function (str) {
	var p;

	for (p in this) {
		if (this.hasOwnProperty(p)) {
			this[p] += str;
		}
	}

	return this;
}
