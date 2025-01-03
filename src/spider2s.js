import { instance } from "./util";
import { Spider } from "./spider";

export const Spider2S = instance(Spider, {name: () => 'Spider2S'});
Spider2S.Deck = instance(Spider2S.Deck, {
	suits: ["s", "h"],
	count: 4
});
