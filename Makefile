YUI_COMPRESSOR=~/Downloads/yuicompressor-2.4.8.jar
JS_PARTS=\
	intermediate/yui-all-min-cropped.js \
	intermediate/yui-breakout.min.js \
	intermediate/save-manager.min.js \
	intermediate/analytics.min.js \
	intermediate/ads.min.js \
	intermediate/solitaire.min.js \
	intermediate/util.min.js \
	intermediate/win-display.min.js \
	intermediate/iphone.min.js \
	intermediate/auto-stack-clear.min.js \
	intermediate/auto-turnover.min.js \
	intermediate/autoplay.min.js \
	intermediate/ie-opera-background-fix.min.js \
	intermediate/statistics.min.js \
	intermediate/display-seed-value.min.js \
	intermediate/solver-freecell.min.js \
	intermediate/agnes.min.js \
	intermediate/golf.min.js \
	intermediate/klondike.min.js \
	intermediate/klondike1t.min.js \
	intermediate/flowergarden.min.js \
	intermediate/fortythieves.min.js \
	intermediate/freecell.min.js \
	intermediate/grandclock.min.js \
	intermediate/montecarlo.min.js \
	intermediate/pyramid.min.js \
	intermediate/russian-solitaire.min.js \
	intermediate/spider.min.js \
	intermediate/spider1s.min.js \
	intermediate/spider2s.min.js \
	intermediate/spiderette.min.js \
	intermediate/tritowers.min.js \
	intermediate/will-o-the-wisp.min.js \
	intermediate/yukon.min.js \
	intermediate/simplesimon.min.js \
	intermediate/eightoff.min.js \
	intermediate/alternations.min.js \
	intermediate/bakersgame.min.js \
	intermediate/calculation.min.js \
	intermediate/bisley.min.js \
	intermediate/kingalbert.min.js \
	intermediate/application.min.js \
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


#ADD_SEPARATOR=echo >> $@.tmp
ADD_SEPARATOR=

FINALIZE=mv $@.tmp $@


all: js/combined-min.js
clean:
	rm -rf js/combined-min.js intermediate

js/combined-min.js: $(JS_PARTS)
	cat $^ > $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)
intermediate/yui-all-min-cropped.js: js-source/yui-all-min.js
	mkdir -p intermediate
	cat $< | sed -n '1,/YUI\.add("event-touch"/ p' | sed '/YUI\.add("event-touch"/ s#/\*$$##' | head -c -1 > $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)
intermediate/%.min.js: js-source/%.js $(YUI_COMPRESSOR)
	mkdir -p intermediate
	java -jar $(YUI_COMPRESSOR) $< -o $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)
	
