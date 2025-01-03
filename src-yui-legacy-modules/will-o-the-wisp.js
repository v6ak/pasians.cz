import { Solitaire } from "../src/solitaire";
import { instance } from "../src/util";

YUI.add("will-o-the-wisp", function (Y) {

	var WillOTheWisp = Solitaire.WillOTheWisp = instance(Solitaire.Spiderette, {
		deal: function () {
			var deck = this.deck,
			    row;

			for (row = 0; row < 3; row++) {
				this.eachStack(function (stack) {
					var card = deck.pop();

					stack.push(card);
					if (row === 2) {
						card.faceUp();
						card.flipPostMove();
					}
				}, "tableau");
			}

			deck.createStack();
		}
	    });
}, "0.0.1", {requires: ["spiderette"]});
