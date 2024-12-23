const SPECIAL_KEYS = ['_on', '_style'];

type Events = { [key: string]: EventListenerOrEventListenerObject};
type Attrs = { [key: string]: string|boolean|number|null|undefined|Events };
type NonAttrs = { _on?: Events, _style: Partial<CSSStyleDeclaration> };
export type ExtendedAttrs = Attrs | NonAttrs;

export function el(name: string, attrs: ExtendedAttrs = {}, children: (Node|string)[] = []) {
    const el = document.createElement(name);
    Object.entries(attrs).filter(x => SPECIAL_KEYS.indexOf(x[0]) == -1).forEach(([attr, val]) => {
        if (typeof val == "boolean"){
            if(val) {
                el.setAttribute(attr, attr);
            }
        } else if(val !== null && val !== undefined) {
            el.setAttribute(attr, val.toString());
        }
    });
    Object.entries(attrs._on || {}).forEach(([event, handler]) =>
        el.addEventListener(event, handler)
    );
    Object.entries(attrs._style || {}).forEach(([name, value]) =>
        (el.style as any)[name] = value
    );
    el.append(...children);
    return el;
}
