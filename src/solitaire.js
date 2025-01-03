import { initSideAd } from "./banners";
import { argsArray, instance, setClass, normalize } from "./util";
import { CardDelegate } from './card-delegate';
import { SaveManager } from "./save-manager";
import { use } from "./yui-modules-interop";

let adsInitialized = false;

function loadAds(show) {
	if(show && !adsInitialized){
		initSideAd();
		adsInitialized = true;
	}
}

export var Game;

const Y = use('event-touch', 'async-queue', "dd", "dd-plugin", "dd-delegate", "anim", "transition", "async-queue", "cookie", "array-extras", "json-parse", "json-stringify");

export const Solitaire = {
	activeCard: null,
	moves: null,
	selector: "#solitaireBox",
	offset: {left: 15, top: 10},
	padding: {x: 0, y: 50},
	widthScale: 0,
	
	horizontalReservedSpace: function(){
		let computedContainerStyle = window.getComputedStyle(this.container()._node);
		let containerPaddingLeft = Number.parseFloat(computedContainerStyle.paddingLeft);
		let containerPaddingRight = Number.parseFloat(computedContainerStyle.paddingRight);
		return containerPaddingLeft + containerPaddingRight;
	},

	noop: function () {},

	name: function () {
		for (let p in Solitaire) {
			if (Solitaire.hasOwnProperty(p) && Solitaire[p] === Game) { return p; }
		}
	},

	container: function () {
		return Y.one(Solitaire.selector);
	},

	width: function () { return this.Card.base.width * this.widthScale; },
	height: function () { return this.Card.base.height * 4.2; },
	maxStackHeight: function () {
		return Solitaire.Application.windowHeight - 
			normalize(this.Tableau.stackConfig.layout.top) -
			normalize(Game.offset.top);
	},

	undo: function () {
		Y.fire("undo");
	},

	pushUndoStack: function () {
		Solitaire.moves.length && Undo.push(Solitaire.moves);
		Solitaire.moves = [];
	},

	pushMove: function (move) {
		var moves = Solitaire.moves;
		moves && moves.push(move);
	},

	serialize: function () {
		var serialized = [],
		    lengths = [],
		    data,
		    stacks,
		    i, len;

		Y.Array.each(this.fields, function (field) {
			stacks = this[field.toLowerCase()].stacks;

			for (i = 0, len = stacks.length; i < len; i++) {
				data = stacks[i].serialize();
				serialized.push(data);
				lengths.push(String.fromCharCode(data.length));
			}
		}, this);

		return [String.fromCharCode(serialized.length)].concat(lengths, serialized).join("");
	},

	stationary: function (callback) {
		var updatePosition = Game.Card.updatePosition;

		Game.Card.updatePosition = Solitaire.noop;
		callback.call(this);
		Game.Card.updatePosition = updatePosition;
	},

	unanimated: function (callback) {
		var anim = Solitaire.Animation,
		    animate = anim.animate;

		anim.animate = false;
		callback.call(this);
		anim.animate = animate;
	},

	withoutFlip: function (callback) {
		var anim = Solitaire.Animation,
		    card = Solitaire.Card,
		    flip = anim.flip,
		    setImageSrc = card.setImageSrc;

		if (!anim.animate) {
			callback.call(this);
			return;
		}

		anim.flip = card.setImageSrc = Solitaire.noop;

		callback.call(this);

		anim.flip = flip;
		card.setImageSrc = setImageSrc;
	},

	unserialize: function (serialized) {
		this.unanimated(function () {
			var numStacks = serialized.charCodeAt(0),
			    lengths = serialized.substr(1, numStacks),
			    offset = numStacks + 1,
			    data,
			    fields = this.fields, fieldIndex = -1,
			    stacks = [], stackIndex,
			    stack,
			    i,
			    length;

			for (i = 0, stackIndex = 0; i < numStacks; i++, stackIndex++, offset += length) {
				length = lengths.charCodeAt(i);
				data = serialized.substr(offset, length);

				if (stackIndex === stacks.length) {
					fieldIndex++;
					stacks = this[fields[fieldIndex].toLowerCase()].stacks;
					stackIndex = 0;
				}

				stack = stacks[stackIndex];
				stack.unserialize(data);
				stack.updateCardsPosition();
			}
		});
	},

	save: function (newGame) {
		var key;

		if (newGame) {
			key = "initial-game";
		}

		SaveManager.save(this.name(), this.serialize(), key);
	},

	loadGame: function (data) {
		this.unanimated(function () {
			this.setup(function () {
				this.unserialize(data);
			});
		});

		Y.fire("loadGame");

		this.save();
	},

	newGame: function () {
		SaveManager.clear();
		this.withoutFlip(function () {
			this.setup(this.deal);
		});

		Y.fire("newGame");
		this.save(true);
	},

	cleanup: function () {
		Y.Event.purgeElement(this.container());

		//remove custom events
		Y.detach("solitaire|*");

		this.eachStack(function (stack) {
			stack.cleanup();
		});
	},

	setup: function (callback) {
		window.Game = Game = Solitaire.game = this;

		Y.fire("beforeSetup");

		Solitaire.moves = null;
		Undo.clear();

		this.stationary(function () {
			this.init();
			Solitaire.Animation.initQueue();
			this.createStacks();
			this.createEvents();
			this.createDraggables();

			callback.call(this);

		});

		Solitaire.moves = [];
		Y.fire("afterSetup");

		Solitaire.Animation.dealing = true;

		Game.eachStack(function (s) {
			s.updateCardsStyle();
			s.updateCardsPosition();
		});

		Solitaire.Animation.dealing = false;
	},

	createEvents: function () {
		var container = Y.one(Solitaire.selector);

		container.delegate("dblclick", Game.autoPlay, ".card");
		container.delegate("contextmenu", Game.autoPlay, ".card");

		container.delegate("click", Game.Events.click, ".card");
		//container.delegate("touchend", Game.Events.click, ".card");

		Y.after("solitaire|endTurn", Game.Events.endTurn);
		Y.on("solitaire|undo", Game.Events.undo);
	},


	createDraggables: function () {
		var del = new CardDelegate({
			dragConfig: {
				dragMode: "intersect",
				groups: ["open"],
				clickPixelThresh: 0
			},
			container: Solitaire.selector,
			nodes: ".card"
		});
		
		del.dd.plug(Y.Plugin.DDProxy, {
			borderStyle: "none",
			moveOnEnd: false
		});

		del.on("drag:drag", Game.Events.drag);
		del.on("drag:mouseDown", Game.Events.dragCheck);
		del.on("drag:start", Game.Events.dragStart);
		del.on("drag:dropmiss", Game.Events.dragMiss);
		del.on("drag:drophit", Game.Events.drop);
		del.on("drag:end", Game.Events.dragEnd);
	},

	createField: function (field) {
		if (!field) { return; }

		var f = instance(field),
		    stackLayout,
		    stack,
		    stacks,
		    i, len;

		if (field.stackConfig) {
			stackLayout = field.stackConfig.layout;
			stacks = new Array(field.stackConfig.total);
			field.Stack.field = field.field;

			for (i = 0, len = stacks.length; i < len; i++) {

				stack = instance(field.Stack);
				stack.configLayout = stackLayout;

				stack.layout(Y.merge(stackLayout, {
					hoffset: i * stackLayout.hspacing || 0,
					voffset: i * stackLayout.vspacing || 0}), i);

				stacks[i] = stack;
			};
		}


		f.stacks = stacks;

		typeof f.init === "function" && f.init();

		return f;
	},

	createStacks: function () {
		this.eachStack(function (stack) {
			stack.cards = [];
			stack.createNode();
		});
	},

	eachStack: function (callback, fieldName) {
		Game && Y.Array.each(Game.fields, function (name) {
			var currentName = name.toLowerCase(),
			    field = Game[currentName],
			    fname = fieldName || currentName;

			fname === currentName && field.stacks && Y.Array.each(field.stacks, callback);
		});
	},
	
	sideAdWidth: function() {
		const el = document.querySelector('#advBoxLeft');
		let style = window.getComputedStyle(el);
		
		const result = Number.parseFloat(style.marginLeft) +
			Number.parseFloat(style.marginRight) +
			Number.parseFloat(style.width);
		
		this.sideAdWidth = function(){return result};
		return this.sideAdWidth();
	},

	resize: function (scale, width, height) {
		this.scale(scale);

		this.unanimated(function () {
			var maxLeft = 0;
			this.eachStack(function (stack, i) {
				var cards = stack.cards,
				    layout = stack.configLayout;

				stack.adjustRankHeight();
				stack.cards = [];
				stack.layout(Y.merge(layout, {
					hoffset: i * layout.hspacing || 0,
					voffset: i * layout.vspacing || 0}), i);

				stack.setImageSrc();
				stack.updateStyle();

				stack.setCards(cards.length, function (i) {
					var card = cards[i];

					if (card) {
						card.setImageSrc();
						card.updateStyle();
					}

					return card;
				});	

				stack.update();
				if (stack.left > maxLeft ) {
					maxLeft = stack.left;
				}
			});
			// limit size to what is needed
			let maxWidth = maxLeft + this.Card.width;
			const horizontalFreeSpace = document.body.clientWidth - maxWidth;
			const adWidth = this.sideAdWidth();
			const showSideAds = horizontalFreeSpace > adWidth;
			const needsSpaceForLeftAd = showSideAds && !(horizontalFreeSpace/2 > adWidth);
			setClass(document.body, 'side-ads', showSideAds);
			loadAds(showSideAds);
			function calcMarginLeft() {
				if (needsSpaceForLeftAd){
					const halfFreeSpace = (horizontalFreeSpace - adWidth)/2;
					//return adWidth + (halfFreeSpace >= 10 ? halfFreeSpace : 0); // make space for the ad and then center
					return adWidth;  // make space for the ad and then aligh left
				}else {
					// just center
					return null;
				}
			}
			
			this.container().setStyle('margin-left', calcMarginLeft());
			this.container().setStyle('max-width', maxWidth + "px");
		});
	},

	scale: function (scale) {
		var Card = Solitaire.Card,
		    base = Card.base,
		    prop;

		Card.scale = scale;

		for (prop in base) {
			if (base.hasOwnProperty(prop)) {
				Card[prop] = base[prop] * scale;
			}
		};
	},

	init: function () {
		var cancel = Solitaire.preventDefault,
		    minX, maxX,
		    fields;

		Y.on("selectstart", cancel, document);
		Y.on("contextmenu", function (e) {
			var target = e.target;

			if (target.hasClass("stack") || target.hasClass("card")) {
				e.preventDefault();
			}
		}, document);

		this.scale(1);

		fields = Game.fields.map(function (field) {
			return Game[field.toLowerCase()] = Game.createField(Game[field]);
		});
		
		// TODO: refactor this conditional into the above iteration
		if (Game.fields.indexOf("Deck" === -1)) {
			Game.deck = Game.createField(Game.Deck);
		}

		// find the game/card width ratio
		minX = Math.min.apply(Math, fields.map(function (f) {
			return f.stacks.map(function (s) { return s.left; });
		}).flatten());

		/*
		 * assume the leftmost point is the leftmost field
		 * if it isn't, you should override Solitaire.width
		 */
		maxX = Math.max.apply(Math, fields.map(function (f) {
			return f.stacks.map(function (s) { return s.left; });
		}).flatten()) + this.Card.width;

		this.widthScale = (maxX - minX) / this.Card.base.width;
	},

	preventDefault: function (e) {
		e.preventDefault();
	},

	autoPlay: function () {
		var card = typeof this.getCard === "function"
			? this.getCard()
			: this.getData("target");

		card.autoPlay();
	},

	isWon: function () {
		var foundations = this.foundation.stacks,
		    deck = this.deck,
		    total,
		    placed = 0,
		    i, len;

		total = deck.suits.length * 13 * deck.count;
		for (i = 0, len = foundations.length; i < len; i++) {
			placed += foundations[i].cards.length;
		}

		return placed === total;
	},

	win: function () {
		Y.fire("win");
		SaveManager.save(this.name());
	},

	endTurn: function () {
		Y.fire("endTurn");
	}
};

Solitaire.Events = {
		click: function (e) {
			var card = e.target.getData("target");

			if (card.dragging) { return; }

			card.dragging = false;
			card.turnOver(e);
			Solitaire.moves.reverse();
			Game.endTurn();
			e.preventDefault();
		},

		clickEmptyDeck: function () {
			Game.redeal();
			Solitaire.moves.reverse();
			Game.endTurn();
		},

		drag: function () {
			this.getCard().dragging = true;
		},

		dragCheck: function () {
			var card = this.getCard(),
			    stack = card.createProxyStack();

			if (!stack) { return; }

			Solitaire.activeCard = card;

			Game.eachStack(function (stack) {
				stack.updateDragGroups();
			});
		},

		dragStart: function () {
			var card = this.getCard(),
			    node = this.get("dragNode"),
			    proxy = card.createProxyNode();

			if (proxy) {
				node.setContent(proxy);
				!card.proxyStack && Y.one(".yui3-dd-shim").setStyle("cursor", "not-allowed");
			}
		},

		dragMiss: function () {
			var card = this.getCard();

			Game.unanimated(function () {
				card.updatePosition();
			});
		},

		dragEnd: function () {
			var target = this.getCard(),
			    root = Solitaire.container(),
			    fragment = new Y.Node(document.createDocumentFragment()),
			    dragNode,
			    node,

			    dragXY = this.dd.realXY,
			    containerXY = root.getXY(),

			    cards,
			    
			    stack,
			    proxyStack = target.proxyStack;

			target.dragging = false;
			dragNode = this.get("dragNode");
			node = dragNode.get("firstChild");

			node && node.remove();

			if (!proxyStack) { return; }

			cards = proxyStack.cards;
			stack = target.stack;

			proxyStack.left = dragXY[0] - containerXY[0];
			proxyStack.top = dragXY[1] - containerXY[1];

			Game.unanimated(function() {
				proxyStack.updateCardsPosition();
			});

			Y.Array.each(cards, function (card) {
				if (!card) { return; }

				card.proxyStack = null;
				fragment.append(card.node);
			});

			root.append(fragment);

			stack.updateCardsPosition();
		},

		drop: function (e) {
			if (!Solitaire.activeCard) { return; }

			var stack = Solitaire.activeCard.proxyStack,
			    target,
			    first;
		       
			if (stack) {
				first = stack.first();

				target = e.drop.get("node").getData("target");

				target = target.stack || target;

				if ((stack.cards.length === 1 && first.validTarget(target)) ||
				    stack.validTarget(target)) {

					target.pushStack(stack);
				}
			}

			Game.endTurn();
		},

		endTurn: function () {
			Solitaire.pushUndoStack();
			Solitaire.activeCard = null;
			Game.eachStack(function (s) {
				s.updateCardsStyle();
			});

			if (Game.isWon()) {
				Game.win();
			} else {
				Game.save();
			}
		},

		undo: function () {
			var args = argsArray(arguments);

			args.unshift("endTurn");
			Undo.undo();
			Y.fire.apply(Y, args);
		}
};

Solitaire.Deck = {
		count: 1,
		suits: ["c", "d", "h", "s"],

		init: function (seed) {
			var suits = this.suits,
			    suit, s,
			    rank,
			    count,
			    Card = Game.Card;

			this.cards = [];

			for (count = 0; count < this.count; count++) {
				for (rank = 1; rank <= 13; rank++ ) {
					for (s = 0; suit = suits[s]; s++) {
						this.cards.push(Card.create(rank, suit).faceDown());
					}
				}
			}

			if (seed === undefined) {
				this.cards.shuffle();
			} else {
				this.msSeededShuffle(seed);
			}
		},

		// shuffle the deck using the "Microsoft Number"
		msSeededShuffle: function (seed) {
			var cards = this.cards,
			    maxInt = Math.pow(2, 31),
			    rand,
			    temp,
			    i;

			for (i = cards.length; i > 1; i--) {
				// simulate x86 integer overflow
				seed = ((214013 * seed) % maxInt + 2531011) % maxInt;
				rand = (seed >> 16) & 0x7fff;

				item = cards[i - 1];
				temp = cards[rand % i];
				cards[i - 1] = temp;
				cards[rand % i] = item;
			}
		},

		createStack: function () {
			var i;

			for (i = this.cards.length - 1; i >= 0; i--) {
				this.stacks[0].push(this.cards[i]);
			}
		},

		last: function () {
			return this.cards.last();
		},

		pop: function () {
			return this.cards.pop();
		}
	};

Solitaire.Card = {
		zIndex: 1,
		index: -1,
		width: null,
		height: null,
		rankHeight: null,
		hiddenRankHeight: null,
		isFaceDown: false,
		positioned: false,
		scale: 1,
		stack: null,
		proxyStack: null,
		ghost: true,
		dragging: false,
		node: null,
		callback: null,
		left: 0,
		top: 0,

		base: {
		},

		origin: {
			left: function () {
				var offset = Solitaire.container().getX();
				
				return -offset - Solitaire.Card.width;
			},
			top: function () {
				var offset = Solitaire.container().getY();

				return -offset - Solitaire.Card.height;
			}
		},

		animSpeeds: {slow: 0.5, mid: 0.2, fast: 0.1},

		create: function (rank, suit) {
			var colors = {c: 0, s: 0, h: 1, d: 1};

			return instance(this, {rank: rank, suit: suit, color: colors[suit]});
		},

		truncatePosition: function () {
			this.left = Math.floor(this.left);
			this.top = Math.floor(this.top);
		},

		faceDown: function (undo) {
			this.isFaceDown = true;
			this.setRankHeight();
			Solitaire.Animation.flip(this);

			undo || Solitaire.pushMove({card: this, faceDown: true});

			return this;
		},

		faceUp: function (undo) {
			this.isFaceDown = false;
			this.setRankHeight();
			Solitaire.Animation.flip(this);

			undo || Solitaire.pushMove({card: this, faceDown: false});

			return this;
		},

		setRankHeight: function () {
			var stack = this.stack,
			    rh, hh;

			if (stack && stack.rankHeight) {
				rh = stack.rankHeight;
				hh = stack.hiddenRankHeight;
			} else {
				rh = Solitaire.Card.rankHeight;
				hh = Solitaire.Card.hiddenRankHeight;
			}

			this.rankHeight = this.isFaceDown ? hh : rh;
		},

		imageSrc: function () {
			var src = this.base.theme + "/";

			src += this.isFaceDown ?
				"facedown" :
				this.suit + this.rank;

			src += ".png";
			
			return src;
		},

		setImageSrc: function () {
			var n = this.node;

			n && n.setAttribute("src", this.imageSrc());
		},

		wrapperStyle: function () {
			return {
				left: this.left,
				top: this.top,
				width: Math.floor(this.width),
				height: Math.floor(this.height),
				borderRadius: this.borderRadius,
			};
		},

		updateStyle: function () {
			var n = this.node;
			const style = this.wrapperStyle();

			if (n) {
				n.setStyles(style);
				n.getDOMNode().style.borderRadius = style.borderRadius + 'px';
			}
			this.setRankHeight();
		},

		turnOver: function (e) {
			if (!this.isFaceDown) { return; }

			var stack = this.stack;

			if (stack.field === "deck") {
				Game.turnOver();
			} else if (this.isFree()) {
				this.faceUp();
			}

			e.stopPropagation();
		},

		autoPlay: function (simulate) {
			var origin = this.stack,
			    last = origin.last(),
			    stacks,
			    foundation,
			    i, len;

			if (this.isFaceDown || origin.field === "foundation") { return; }

			stacks = Game.foundation.stacks;
			for (i = 0, len = stacks.length; i < len; i++) {
				foundation = stacks[i];
				if (this.isFree() && this.validTarget(foundation)) {
					if (!simulate) {
						this.moveTo(foundation);
						origin.updateCardsPosition();
						origin.update();
						Game.endTurn();
					}

					return true;
				}
			}

			return false;
		},

		ensureDOM: function () {
			!this.node && this.createNode();
		},

		isFree: function () {
			return this === this.stack.last();
		},

		playable: function () {
			return this.stack.field === "deck" || (this.isFree() && (this.stack.field !== "foundation"));
		},

		createNode: function () {
			var node;

			node = this.node = Y.Node.create("<img class='card'>")
				.setData("target", this)
				.setAttribute("src", this.imageSrc())
				.plug(Y.Plugin.Drop);

			node.setStyles({left: -this.width, top: -this.height});
			this.setRankHeight();

			Solitaire.container().append(node);
		},
		
		destroyNode: function () {
			var n = this.node;

			n && n.clearData().destroy(true);
		},

		createProxyStack: function () {
			if (this.isFaceDown || this.stack.field === "foundation") {
				this.proxyStack = null;
				return null;
			}

			var stack = instance(this.stack, {
				proxy: true,
				stack: this.stack
			    }),
			    cards = stack.cards,
			    card,
			    i, len;

			stack.cards = [];
			stack.push(this, true);

			for (i = cards.indexOf(this) + 1, len = cards.length; i < len; i++) {
				card = cards[i];
				if (stack.validProxy(card)) {
					stack.push(card, true);
				} else {
					break;
				}
			}

			this.proxyStack = i === len ? stack : null;

			return this.proxyStack;
		},

		proxyCards: function () {
			return this.proxyStack.cards;
		},

		createProxyNode: function () {
			var node = Y.Node.create("<div>"),
			    stack = this.proxyStack;

			// if the card isn't playable, create ghost copy
			if (!stack) {
				if (!this.ghost) { return null; }

				node.setStyles({
					opacity: 0.6,
					top: -this.top,
					left: -this.left
				}).append(this.node.cloneNode(true));
			} else {
				node.setStyles({opacity: 1, top: -this.top, left: -this.left});

				Y.Array.each(this.proxyCards(), function (c) {
					c.proxyStack = stack;
					node.append(c.node);
				});
			}

			return node;
		},

		updatePosition: function (fields) {
			if (!this.node) { return; }

			var to = {left: Math.floor(this.left) + "px", top: Math.floor(this.top) + "px", zIndex: this.zIndex},
			    origin = this.origin;

			if (!this.positioned) {
				this.node.setStyles({left: normalize(origin.left), top: normalize(origin.top)});
			}

			Solitaire.Animation.init(this, to, fields);
		},

		pushPosition: function () {
			var index = this.index >= 0 ?
				this.index :
				this.stack.cards.indexOf(this);

			Solitaire.pushMove({
				card: this,
				index: index,
				from: this.stack
			});
		},

		moveTo: function (stack) {
			var origin = this.stack;

			this.pushPosition();
			origin.deleteItem(this);
			stack.push(this);

			Y.fire(origin.field + ":afterPop", origin);

			return this;
		},

		flipPostMove: function (delay) {
			var anim = Solitaire.Animation;

			if (delay === undefined) {
				delay = anim.interval * 20;
			}

			this.after(function () {
				anim.flip(this, delay);
			});
		},

		after: function (callback) {
			this.callback = callback;
		},

		runCallback: function () {
			if (this.callback) {
				this.callback.call(this);
				this.callback = null;
			}
		}
	};

Solitaire.Stack = {
		cards: null,
		node: null,
		images: {
			tableau: "freeslot.png",
			deck: "freeslot.png",
			reserve: "freeslot.png",
			foundation: "freeslot.png"
		},

		serialize: function () {
			var i, len,
			    cards = this.cards,
			    card,
			    suits = Game.deck.suits,
			    bite,
			    serialized = [];

			for (i = 0, len = cards.length; i < len; i++) {
				card = cards[i];
				if (card) {
					bite = suits.indexOf(card.suit) |
						card.rank << 2 |
						card.isFaceDown << 6; // type coersion!
				} else {
					bite = 128;
				}
				serialized.push(String.fromCharCode(bite));
			}

			return serialized.join("");
		},

		eachCard: function (callback) {
			var i, len,
			    cards = this.cards;

			for (i = 0, len = cards.length; i < len; i++) {
				if (cards[i]) {
					if (callback.call(this, cards[i], i) === false) { return false; }
				}
			}

			return true;
		},

		setCards: function (count, cardGen) {
			var i, len,
			    card, cards,
			    empty = instance(Game.Card, {
				updatePosition: Solitaire.noop,
				ensureDOM: Solitaire.noop
			    });

			cards = this.cards = [];

			for (i = 0; i < count; i++) {
				card = cardGen.call(this, i) || empty;
				this.push(card);
			}

			for (i = 0; i < count; i++) {
				if (cards[i] === empty) {
					cards[i] = null;
				}
			}
		},

		updateCardsPosition: function () {
			var cards = this.cards;

			Game.stationary(function () {
				this.proxy || this.adjustRankHeight();
				this.setCards(cards.length, function (i) {
					var card = cards[i];

					if (card) {
						card.stack = this;
						card.setRankHeight();
					}

					return card;
				});
			}.bind(this));

			this.eachCard(function (c) {
				c.updatePosition();
			});
		},

		updateCardsStyle: function () {
			var field = this.field;

			field === "foundation" || this.eachCard(function (c) {
				if (c.playable()) {
					c.node.addClass("playable");
				} else {
					c.node.removeClass("playable");
				}
			});
		},

		unserialize: function (serialized) {
			var deck = Game.deck,
			    Card = Game.Card;

			this.setCards(serialized.length, function (i) {
				var value,
				    card;

				value = serialized.charCodeAt(i);

				if (value === 128) {
					card = null;
				} else {
					card = Card.create(
						(value >> 2) & 15, // rank
						deck.suits[value & 3] // suit
					);

					value & 64 ? card.faceDown(true) : card.faceUp(true);
				}

				return card;
			});

			this.update();
		},

		imageSrc: function () {
			var basename = this.images[this.field];

			return basename ? Solitaire.Card.base.theme + "/" + basename : "trans.gif";
		},

		layout: function (layout) {
			var hoffset = layout.hoffset * Solitaire.Card.width,
			    voffset = layout.voffset * Solitaire.Card.height,
			    gameOffset = Game.offset,
			    self = this;

			Y.Array.each(["top", "left"], function (p) {
				self[p] = normalize(layout[p]);
			});

			this.left += hoffset + normalize(gameOffset.left);
			this.top += voffset + normalize(gameOffset.top);
		},

		deleteItem: function (card) {
			this.cards.deleteItem(card);
		},

		push: function (card, temp) {
			var last = this.last(),
			    to = this.field,
			    from = card.stack ? card.stack.field : "deck";

			if (last) { card.zIndex = last.zIndex + 1; }
			else if (to === "deck" || to === "foundation") { card.zIndex = 200; }
			else if (from === "deck") { card.zIndex = Game.Card.zIndex; }

			if (!temp) {
				card.stack = this;
				this.setCardPosition(card);
				card.truncatePosition();
				card.ensureDOM();
			}

			this.cards.push(card);
			temp || card.updatePosition({from: from, to: to});
		},

		pushStack: function (proxy) {
			var origin = Solitaire.activeCard.stack,
			    stack = this;

			/* save the card's index in the stack so we can properly undo this move */
			origin.eachCard(function (card, i) {
				card.index = i;
			});

			Game.stationary(function () {
				proxy.eachCard(function (card) {
					card.moveTo(stack);
					card.index = -1;
				});
				origin.eachCard(function (card) {
					card.index = -1;
				});
			});

			origin.updateCardsPosition();
			origin.update();

			Y.fire(stack.field + ":afterPush", stack);
		},

		adjustRankHeight: function () {
			var cards = this.cards,
			    card,
			    last = this.last(),
			    max = Game.maxStackHeight(),

			    sumHidden = 0,
			    sumVisible = 0,
			    sumRankHeights,

			    height = 0,
			    Card = Solitaire.Card,
			    countHidden = 0, countVisible = 0,
			    rhHidden, rhVisible,
			    i, len;

			if (cards.length <= 1) { return; }

			for (i = 0, len = cards.length - 1; i < len; i++) {
				// if gaps in the stack are allowed, the stack's layed out horizontally
				if (!cards[i]) { return; }

				if (cards[i].isFaceDown) {
					sumHidden += Card.hiddenRankHeight;
					countHidden++;
					height += Card.hiddenRankHeight;
				} else {
					sumVisible += Card.rankHeight;
					countVisible++;
					height += Card.rankHeight;
				}
			}

			if (last) {
				height += last.height;
				sumRankHeights = max - last.height;
			}

			if (height <= max) {
				this.rankHeight = 0;
				this.hiddenRankHeight = 0;
				return;
			}

			rhHidden = sumRankHeights * (sumHidden / (sumHidden + sumVisible)) / countHidden;
			rhVisible = sumRankHeights * (sumVisible / (sumHidden + sumVisible)) / countVisible;

			this.hiddenRankHeight = Math.floor(rhHidden);
			this.rankHeight = Math.floor(rhVisible);
		},

		first: function () { 
			return this.cards[0];
		},

		last: function () {
			return this.cards.last();
		},

		length: function () {
			return this.cards.length;
		},

		index: function () {
			return Game[this.field].stacks.indexOf(this);
		},

		next: function () {
			return Game[this.field].stacks[this.index() + 1];
		},

		setCardPosition: function (card) {
			card.top = this.top;
			card.left = isNaN(this.left) ? null : this.left;
		},

		wrapperStyle: function () {
			return {
				left: Math.floor(this.left),
				top: Math.floor(this.top),
				width: Math.floor(Solitaire.Card.width),
				height: Math.floor(Solitaire.Card.height)
			};
		},

		updateStyle: function () {
			var n = this.node;

			n && n.setStyles(this.wrapperStyle());
		},

		setImageSrc: function () {
			if (this.node) {
				this.node.setAttribute("src", this.imageSrc());
			}
		},

		createNode: function () {
			var node = this.node;

			node = this.node = Y.Node.create("<img class='stack'>")
				.set("draggable", false)
				.setData("target", this)
				.plug(Y.Plugin.Drop);

			this.setImageSrc();
			this.updateStyle();

			Solitaire.container().append(node);
		},

		cleanup: function () {
			var n = this.node;

			n && n.clearData().destroy(true);

			this.eachCard(function (c) {
				c.destroyNode();
			});
		},

		updateDragGroups: function () {
			var active = Solitaire.activeCard,
			    cards = this.cards,
			    last = this.last(),
			    drop,
			    i = cards.length - 1;

			this.eachCard(function (c) {
				c.node.drop.removeFromGroup("open");
			});

			if (active.validTarget(this)) {
				if (last) {
					last.node.drop.addToGroup("open");
				}
				this.node.drop.addToGroup("open");
			} else {
				this.node.drop.removeFromGroup("open");
			}
		},

		validCard: function () { return true; },

		validProxy: function (card) {
			return card && card.validTarget(this) && this.validCard(card);
		},

		update: function () {}
	};

Solitaire.Animation = {
		animate: true,
		dealing: false,
		duration: 0.5, // seconds
		flipDuration: 0.1, // seconds
		interval: 20, // milliseconds
		queue: new Y.AsyncQueue(),

		initQueue: function () {
			var q = this.queue;

			q.defaults.timeout = this.interval;
		},

		init: function (card, to, fields) {
			if (!this.animate) {
				card.node.setStyles(to);
				card.positioned = true;
				setTimeout(function () {
					card.runCallback();
				}, 0);
				return;
			}

			var node = card.node,
			    q = this.queue,
			    speeds = card.animSpeeds,
			    from = {top: node.getStyle("top"), left: node.getStyle("left")}.mapToFloat().mapAppend("px"),
			    zIndex = to.zIndex,
			    duration,
			    $this = this;
		       
			if (from.top === to.top && from.left === to.left) { return; }

			if (this.dealing) {
				duration = speeds.slow;
			} else if (!fields ||
			    fields.from === fields.to ||
			    fields.to === "waste" ||
			    fields.to === "foundation") {
				duration = speeds.fast;
			} else if (fields.from === "deck") {
				duration = speeds.slow;
			} else {
				duration = speeds.mid;
			}

			node.setStyle("zIndex", 500 + zIndex);
			delete to.zIndex;

			q.add(this.animFunction.bind(this).partial({
				left: to.left,
				top: to.top,
				easing: "ease-out",
				duration: duration,
			}, card, function () {
				card.positioned = true;
				node.setStyle("zIndex", card.zIndex);
			}));

			q.run();
		},

		animFunction: function () {},

		doTransition: function (properties, card, callback) {
			var node = card.node,
			    $this = this;

			node.transition(properties, function () {
				callback();
				$this.clearTransition(node);
				card.runCallback();
			});
		},

		doAnim: function (properties, card, callback) {
			var node = card.node,
			    duration = properties.duration,
			    map = {
				linear: "linear",
				"ease-out": "easeOut",
				"ease-in": "easeIn"
			    },
			    easing = Y.Easing[map[properties.easing]],
			    anim;

			delete properties.duration;
			delete properties.easing;

			anim = new Y.Anim({
				node: node,
				to: properties,
				duration: duration,
				easing: easing
			});

			anim.on("end", function () {
				callback();
				card.runCallback();
			});

			anim.run();
		},
	
		flip: function(card, delay) {
			if (!(this.animate && card.node)) {
				card.setImageSrc();
				return;
			}

			var $this = this;
			/* the CSS left style doesn't animate unless I dump this onto the event loop.
			 * I don't know why.
			 */
			setTimeout(function () {
				var node = card.node,
				    duration = $this.flipDuration,
				    easing = "linear",
				    left = Math.floor(card.left),
				    width = Math.floor(card.width);

				$this.animFunction({
					left: Math.floor(left + width / 2) + "px",
					width: 0,
					easing: easing,
					duration: duration
				}, card, function () {
					card.setImageSrc();
					$this.animFunction({
						left: left + "px",
						width: width + "px",
						easing: easing,
						duration: duration
					}, card, function () {
						card.updateStyle();
					});

				});
			}, delay || 0);
		},

		/*
		 * cleanup messy Transition CSS declarations left by YUI
		 */
		clearTransition: function (node) {
			var style = node._node.style;

			Y.Array.each(["Webkit", "Moz", "O", "MS"], function (prefix) {
				var property = prefix + "Transition";

				if (property in style) {
					style[property] = null;
				}
			});
		}
	};

Solitaire.Animation.animFunction = Solitaire.Animation.doAnim;

var Undo = {
	stack: null,

	clear: function () {
		this.stack = [];
	},

	push: function (moves) {
		//console.log('+', moves);
		this.stack.push(moves);
	},

	pop: function () {
		return this.stack.pop() || [];
		//console.log('-', u);
		//return u;//this.stack.pop() || [];
	},

	undo: function () {
		//console.log('u');
		var stacks;

		stacks = Y.Array.unique(Y.Array.map(this.pop(), this.act).flatten());

		Y.Array.each(stacks, function (stack) {
			if (stack) {
				stack.updateCardsPosition();
				stack.update(true);
			}
		});
	},

	act: function (move) {
		//console.log('a', move);
		if (typeof move === "function") {
			move();
			return [];
		}

		var from = move.from,
		    card = move.card,
		    to = card.stack,
		    cards = to.cards;

		if (from) {
			if (from === card.stack) {
				cards[cards.indexOf(card)] = null;
			} else {
				cards.deleteItem(card);
			}

			from.cards[move.index] = card;

			card.stack = from;

			Solitaire.container().append(card.node);
		}

		if ("faceDown" in move) {
			move.faceDown ? card.faceUp(true) : card.faceDown(true);
		}

		return [to, from];
	}
};
