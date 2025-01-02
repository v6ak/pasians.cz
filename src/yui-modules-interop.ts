export function use(...modules: string[]) {
	var Y: any, resolved: boolean = false;
	function resolve(yObj) {
		Y = yObj;
		resolved = true;
	}
	(YUI as any)({bootstrap: false}).use(...modules, resolve);
	if (resolved) {
		return Y;
	} else {
		throw new Error('not resolved: ' + modules);
	}
}
