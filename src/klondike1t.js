import { instance } from "../src/util";
import { Klondike } from "./klondike";
import { Solitaire } from "./solitaire";

export const Klondike1T = instance(Klondike, {
	name: () => "Klondike1T",

	cardsPerTurnOver: 1,

	redeal: Solitaire.noop,

	Waste: instance(Klondike.Waste, {
		Stack: instance(Solitaire.Stack)
	}),

	Deck: instance(Klondike.Deck, {
		Stack: instance(Klondike.Deck.Stack, {
			createNode: function () {
				Klondike.Deck.Stack.createNode.call(this);
				this.node.removeClass("playable");
			}
		})
	})
});
