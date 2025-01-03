import { use } from "./yui-modules-interop";

const Y = use("solitaire"), Solitaire = Y.Solitaire;

	var whenWon = true,
	    autoPlayInterval = null,
	    autoPlayable = ["Klondike", "Klondike1T", "FortyThieves", "GClock", "Freecell", "FlowerGarden", "Yukon", "BakersGame", "BakersDozen", "Eightoff", "LaBelleLucie", "TheFan", "Alternations", "DoubleKlondike", "KingAlbert"];

	Y.on("endTurn", function () {
		if (!whenWon || autoPlayable.indexOf(Solitaire.game.name()) === -1) { return; }

		if (autoPlayInterval === null && isEffectivelyWon()) {
			Y.fire("autoPlay");
		}
	});

	Y.on("win", function () {
		clearInterval(autoPlayInterval);
		autoPlayInterval = null;
	});

	Y.on("autoPlay", function () {
		autoPlayInterval = setInterval(autoPlay, 130);
	});

	function autoPlay() {
		var played = false;

		Solitaire.game.eachStack(function (stack) {
			var field = stack.field;

			if (played || field === "foundation" || field === "deck") { return; }

			played = !stack.eachCard(function (card) {
				return !card.autoPlay();
			});
		});
	}

	function isEffectivelyWon() {
		var stop = false;

		Solitaire.game.eachStack(function (stack) {
			var field = stack.field,
			    prevRank = 14,
			    decending;

			if (stop || field !== "tableau" && field !== "waste") { return; }

			decending = stack.eachCard(function (card) {
				if (card.rank > prevRank || card.isFaceDown) {
					stop = true;
					return false;
				} else {
					prevRank = card.rank;
				}
			});
		});

		return !stop;
	}

	export const Autoplay = {
		enable: function () {
			whenWon = true;
		},

		disable: function () {
			whenWon = false;
		},

		isEnabled: function () {
			return whenWon;
		}
	};
