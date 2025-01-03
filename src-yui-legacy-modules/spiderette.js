import { Klondike } from "../src/klondike";
import { Spider } from "../src/spider";
import { instance } from "../src/util";

YUI.add("spiderette", function (Y) {
	var Solitaire = Y.Solitaire,
	    Spiderette = Y.Solitaire.Spiderette = instance(Spider, {
		height: Klondike.height,
		deal: Klondike.deal,

		Tableau: instance(Spider.Tableau, {
			stackConfig: Klondike.Tableau.stackConfig
		}),
		Foundation: instance(Spider.Foundation, {
			stackConfig: Klondike.Foundation.stackConfig
		}),

		Deck: instance(Spider.Deck, {
			count: 1
		})
	    });
}, "0.0.1", {requires: ["klondike", "spider"]});
