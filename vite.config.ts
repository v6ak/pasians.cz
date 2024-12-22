import concat from '@vituum/vite-plugin-concat';

export default {
  plugins: [
    concat({
        input: [
            'index.js',
        ],
        files: {
            'index.js': [
                // YUI
                './node_modules/yui/yui/yui-min.js',
                './node_modules/yui/oop/oop-min.js',
                './node_modules/yui/event-custom-base/event-custom-base-min.js',
                './node_modules/yui/event-custom-complex/event-custom-complex-min.js',
                './node_modules/yui/event-base/event-base-min.js',
                './node_modules/yui/event-touch/event-touch-min.js',
                './node_modules/yui/dom-core/dom-core-min.js',
                './node_modules/yui/dom-base/dom-base-min.js',
                './node_modules/yui/selector-native/selector-native-min.js',
                './node_modules/yui/selector/selector-min.js',
                './node_modules/yui/node-core/node-core-min.js',
                './node_modules/yui/async-queue/async-queue-min.js',
                './node_modules/yui/dom-style/dom-style-min.js',
                './node_modules/yui/node-base/node-base-min.js',
                './node_modules/yui/event-delegate/event-delegate-min.js',
                './node_modules/yui/node-event-delegate/node-event-delegate-min.js',
                './node_modules/yui/pluginhost-base/pluginhost-base-min.js',
                './node_modules/yui/pluginhost-config/pluginhost-config-min.js',
                './node_modules/yui/node-pluginhost/node-pluginhost-min.js',
                './node_modules/yui/dom-screen/dom-screen-min.js',
                './node_modules/yui/node-screen/node-screen-min.js',
                './node_modules/yui/node-style/node-style-min.js',
                './node_modules/yui/attribute-core/attribute-core-min.js',
                './node_modules/yui/attribute-observable/attribute-observable-min.js',
                './node_modules/yui/attribute-extras/attribute-extras-min.js',
                './node_modules/yui/attribute-base/attribute-base-min.js',
                './node_modules/yui/base-core/base-core-min.js',
                './node_modules/yui/base-observable/base-observable-min.js',
                './node_modules/yui/base-base/base-base-min.js',
                './node_modules/yui/base-pluginhost/base-pluginhost-min.js',
                './node_modules/yui/base-build/base-build-min.js',
                './node_modules/yui/yui-throttle/yui-throttle-min.js',
                './node_modules/yui/classnamemanager/classnamemanager-min.js',
                './node_modules/yui/dd-ddm-base/dd-ddm-base-min.js',
                './node_modules/yui/event-synthetic/event-synthetic-min.js',
                './node_modules/yui/event-resize/event-resize-min.js',
                './node_modules/yui/dd-ddm/dd-ddm-min.js',
                './node_modules/yui/dd-ddm-drop/dd-ddm-drop-min.js',
                './node_modules/yui/selector-css2/selector-css2-min.js',
                './node_modules/yui/dd-drag/dd-drag-min.js',
                './node_modules/yui/dd-gestures/dd-gestures-min.js',
                './node_modules/yui/dd-proxy/dd-proxy-min.js',
                './node_modules/yui/dd-constrain/dd-constrain-min.js',
                './node_modules/yui/dd-drop/dd-drop-min.js',
                './node_modules/yui/dd-scroll/dd-scroll-min.js',
                './node_modules/yui/dd-drop-plugin/dd-drop-plugin-min.js',
                './node_modules/yui/event-mouseenter/event-mouseenter-min.js',
                './node_modules/yui/dd-delegate/dd-delegate-min.js',
                './node_modules/yui/cookie/cookie-min.js',
                './node_modules/yui/array-extras/array-extras-min.js',
                './node_modules/yui/color-base/color-base-min.js',
                './node_modules/yui/anim-base/anim-base-min.js',
                './node_modules/yui/anim-easing/anim-easing-min.js',
                './node_modules/yui/event-flick/event-flick-min.js',
                './node_modules/yui/event-move/event-move-min.js',
                './node_modules/yui/attribute-complex/attribute-complex-min.js',
                './node_modules/yui/event-focus/event-focus-min.js',
                './node_modules/yui/widget-base/widget-base-min.js',
                './node_modules/yui/widget-htmlparser/widget-htmlparser-min.js',
                './node_modules/yui/widget-skin/widget-skin-min.js',
                './node_modules/yui/widget-uievents/widget-uievents-min.js',
                './node_modules/yui/arraylist/arraylist-min.js',
                './node_modules/yui/widget-parent/widget-parent-min.js',
                './node_modules/yui/widget-child/widget-child-min.js',
                './node_modules/yui/tabview-base/tabview-base-min.js',
                './node_modules/yui/plugin/plugin-min.js',
                './node_modules/yui/event-simulate/event-simulate-min.js',
                './node_modules/yui/gesture-simulate/gesture-simulate-min.js',
                './node_modules/yui/node-event-simulate/node-event-simulate-min.js',
                './node_modules/yui/event-key/event-key-min.js',
                './node_modules/yui/node-focusmanager/node-focusmanager-min.js',
                './node_modules/yui/tabview/tabview-min.js',
                './node_modules/yui/json-parse/json-parse-min.js',
                './node_modules/yui/json-stringify/json-stringify-min.js',

                // our code
                './js-source/save-manager.js',
                './js-source/analytics.js',
                './js-source/ads.js',
                './js-source/solitaire.js',
                './js-source/util.js',
                './js-source/win-display.js',
                './js-source/iphone.js',
                './js-source/auto-stack-clear.js',
                './js-source/auto-turnover.js',
                './js-source/autoplay.js',
                './js-source/ie-opera-background-fix.js',
                './js-source/statistics.js',
                './js-source/display-seed-value.js',
                './js-source/solver-freecell.js',
                './js-source/agnes.js',
                './js-source/golf.js',
                './js-source/klondike.js',
                './js-source/klondike1t.js',
                './js-source/flowergarden.js',
                './js-source/fortythieves.js',
                './js-source/freecell.js',
                './js-source/grandclock.js',
                './js-source/montecarlo.js',
                './js-source/pyramid.js',
                './js-source/russian-solitaire.js',
                './js-source/spider.js',
                './js-source/spider1s.js',
                './js-source/spider2s.js',
                './js-source/spiderette.js',
                './js-source/tritowers.js',
                './js-source/will-o-the-wisp.js',
                './js-source/yukon.js',
                './js-source/simplesimon.js',
                './js-source/eightoff.js',
                './js-source/alternations.js',
                './js-source/bakersgame.js',
                './js-source/calculation.js',
                './js-source/bisley.js',
                './js-source/kingalbert.js',
                './js-source/application.js',
                './js-source/yui-breakout.js',  // well, maybe from YUI?

                /*
                    # ommited files:
                    # multiplicities:
                    # * analytics is there only once (it used to be twice there)
                    # The following files were at least a bit modified, but they seem unused.
                    # The modification might be a false positive caused by a different version of the minifier.
                    # * scorpion
                    # * bakersdozen
                    # * acesup
                    # * baroness
                    # * canfield
                    # * doubleklondike
                    # * thefan
                    # * labellelucie
                */
            ],
        },
    })
  ]
}

