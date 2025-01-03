import { use } from "../src/yui-modules-interop";

const Y = use("solitaire");
/*
 * automatically turn over the first open faceup card in a stack
 */
var enabled = true;

export const AutoTurnover = {
	enable: function () {
		enabled = true;
	},
	disable: function () {
		enabled = false;
	},
	isEnabled: function () {
		return enabled;
	}
}

Y.on("tableau:afterPop", function (stack) {
	if (!enabled) { return; }

	Y.Array.each(stack.cards, function (card) {
		if (card && card.isFaceDown && card.isFree()) {
			card.faceUp();
		}
	});
});
