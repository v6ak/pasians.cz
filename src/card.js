import { instance } from "./util";
import { use } from "./yui-modules-interop";

const Y = use('event-touch', 'async-queue', "save-manager", "dd", "dd-plugin", "dd-delegate", "anim", "transition", "async-queue", "cookie", "array-extras", "json-parse", "json-stringify");

export const Card = {
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
			
			return -offset - Card.width;
		},
		top: function () {
			var offset = Solitaire.container().getY();

			return -offset - Card.height;
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
			rh = Card.rankHeight;
			hh = Card.hiddenRankHeight;
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

		Y.Solitaire.Animation.init(this, to, fields);
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
