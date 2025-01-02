import { use } from "./yui-modules-interop";

const Y = use('event-touch', 'async-queue', "save-manager", "dd", "dd-plugin", "dd-delegate", "anim", "transition", "async-queue", "cookie", "array-extras", "json-parse", "json-stringify");

export function CardDelegate(this: any, cfg: any) {
	(CardDelegate as any).superclass.constructor.call(this, cfg);
}

Y.extend(CardDelegate, Y.DD.Delegate, {
	getCard: function () {
		return this.get("currentNode").getData("target");
	}
});
