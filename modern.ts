import { initGameWonAd, initSideAd } from "./banners";
import { styleForNoPopup, styleForPopup } from "./dialogs";

export const globals = {initSideAd, initGameWonAd, styleForNoPopup, styleForPopup};

Object.entries(globals).forEach(([key, value]) => {
    window[key] = value;
});
