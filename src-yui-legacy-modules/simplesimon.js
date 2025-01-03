import { Solitaire } from "../src/solitaire";
import { Spider } from "../src/spider";
import { instance } from "../src/util";

YUI.add("simple-simon", function (Y) {
	var SimpleSimon = Solitaire.SimpleSimon = instance(Spider, {
		fields: ["Foundation", "Tableau"],

		deal: function () {
			var card,
			    stack = 0,
			    stacks = this.tableau.stacks,
			    last = stacks.length,
			    delay = Solitaire.Animation.interval * 10;

			while (card = this.deck.pop()) {
				stacks[stack].push(card);
				card.faceUp();
				card.flipPostMove(delay);
				stack++;
				if (stack === last) {
					stack = 0;
					last--;
				}
			}
		},

		turnOver: Solitaire.noop,
		Deck: instance(Solitaire.Deck),
		Foundation: instance(Spider.Foundation),

		Card: instance(Spider.Card, {
			origin: {
				left: function () {
					return Solitaire.Card.width * 6;
				},
				top: function () {
					return Solitaire.container().get("winHeight") - Solitaire.Card.height * 1.25;
				}
			}
		})
	});

	SimpleSimon.Foundation.stackConfig = {
		total: 4,
		layout: {
			hspacing: 1.25,
			top: 0,
			left: function () { return Solitaire.Card.width * 3.75; }
		}
	};
}, "0.0.1", {requires: ["spider"]});
