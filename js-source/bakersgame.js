import { instance } from "../src/util";
import { Freecell } from "../src/freecell";
import { use } from "../src/yui-modules-interop";

const Y = use();

export const BakersGame = instance(Freecell, {
	Card: instance(Freecell.Card, {
		validTableauTarget: function (card) {
			return card.suit === this.suit && card.rank === this.rank + 1;
		}
	})
});
