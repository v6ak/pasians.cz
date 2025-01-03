import { instance } from "./util";
import { Spider } from "./spider";
import { use } from "./yui-modules-interop";

const Y = use("spider");

export const Spider1S = instance(Spider, {name: () => 'Spider1S'});
Spider1S.Deck = instance(Spider1S.Deck, {
	suits: ["s"],
	count: 8
});
