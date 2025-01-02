export const yui = (YUI as any)({fetchCSS: false, bootstrap: false});

export function use(...modules: string[]) {
	var Y: any, resolved: boolean = false;
	function resolve(yObj) {
		Y = yObj;
		resolved = true;
	}
	yui.use(...modules, resolve);
	if (resolved) {
		return Y;
	} else {
		throw new Error('not resolved: ' + modules);
	}
}
