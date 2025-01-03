import { instance } from "../src/util";
import { Freecell } from "../src/freecell";
import { Y } from "../src/yui-modules-interop";

export const BakersGame = instance(Freecell, {
	Card: instance(Freecell.Card, {
		validTableauTarget: function (card) {
			return card.suit === this.suit && card.rank === this.rank + 1;
		}
	})
});
