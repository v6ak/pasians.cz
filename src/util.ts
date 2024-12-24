export function setClass(element: HTMLElement, className: string, shallBePresent: boolean) {
	if (shallBePresent) {
		element.classList.add(className);
	} else {
		element.classList.remove(className);
	}
}

export function isTestSite(){
	return !window.location.host.endsWith("pasians.cz");
}

export function instance(proto: any, attrs: any) {
	var maker: any = new Function(),
	    o,
	    p;

	maker.prototype = proto;
	o = new maker;
	if (typeof attrs === "object") {
		for (p in attrs) {
			if (attrs.hasOwnProperty(p)) {
				o[p] = attrs[p];
			}
		}
	}

	return o;
}

export function argsArray(args: any) {
	return Array.prototype.slice.call(args);
}

export function normalize(valOrFunction: any) {
	var val = typeof valOrFunction === "function" ? valOrFunction() : valOrFunction;

	return isNaN(val) ? undefined : val;
}
