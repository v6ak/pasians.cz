
//import sachyCz from './banners/chessorg_160x600_CZ.jpg'; // ?format=avif&imagetools
import mahjongCz from './banners/mahjong-cz-160px.jpg'; // ?format=avif&imagetools

import { el, ExtendedAttrs } from './dom';

function imageBanner(src: string, link: string) {
    return {html: () => el('a', {href: link, target: '_blank'}, [el('img', {src})])};
}

const ADSENSE_CLIENT_ID = "ca-pub-0355182625291866";    // duplicated in /public/ads.txt
let adsenseInit = false;


function adsenseBanner(insAttrs: ExtendedAttrs){
    return {
        html: () => el('ins', insAttrs),
        onInsert: () => {
            if (!adsenseInit) {
                document.body.append(el('script', {async: true, src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+ADSENSE_CLIENT_ID, crossorigin: "anonymous"}));
            }
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
    }

}

interface Banner {
    html: () => HTMLElement;
    onInsert?: () => void;
    weight: number;
    offline?: boolean;
}


export const SIDE_BANNERS: Banner[] = [
    // {...imageBanner(sachyCz, 'https://herna.sachy.cz'), weight: 100, offline: true},
    {...imageBanner(mahjongCz, 'https://mahjong.cz'), weight: 1, offline: true},
    {...adsenseBanner({
        class: "adsbygoogle",
        style: "display:inline-block;width:160px;height:600px",
        "data-ad-client": ADSENSE_CLIENT_ID,
        "data-ad-slot": "1241010006",
        "data-ad-format": "auto",
    }), weight: 9},
];

export const GAME_WON_BANNERS: Banner[] = [
    /*{...adsenseBanner({
        class: "adsbygoogle",
        style: "display:block",
        "data-ad-client": ADSENSE_CLIENT_ID,
        "data-ad-slot": …,
        "data-ad-format": "auto",
        "data-full-width-responsive": "true",
    }), weight: 5}*/
    {html: () => el('div', {}, ['TODO: banner']), weight: 1, offline: true},
]

function onlyApplicable(banners: Banner[]) {
    return (navigator.onLine === false)
        ? banners.filter(b => b.offline)
        : banners;
}

export function pickRandomBanner(banners: Banner[]): Banner|null {
    const totalWeight = onlyApplicable(banners).map(x => x.weight).reduce((x, y) => x+y);
    const randomValue = Math.random() * totalWeight;
    console.log({randomValue})
    let cumulativeWeight = 0;
    for (const banner of banners) {
        const weightMin = cumulativeWeight;
        const weightMax = cumulativeWeight + banner.weight;
        console.log({randomValue, weightMin, weightMax})
        if ((weightMin <= randomValue) && (randomValue < weightMax)) {
            return banner;
        }
        cumulativeWeight = weightMax;
    }
    return null;
}

export function insertBanner(container: HTMLElement, collection: Banner[]) {
    const banner = pickRandomBanner(collection);
    container.append(banner?.html() || '');
    (banner?.onInsert || (() => {}))()
}

export function initSideAd() {
    insertBanner(document.querySelector('#advBoxLeft')!, SIDE_BANNERS);
}

export function initGameWonAd(container: HTMLElement) {
    insertBanner(container, GAME_WON_BANNERS);
}
