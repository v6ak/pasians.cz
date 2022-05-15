# Adjust the path to YUI compressor on your machine
YUI_COMPRESSOR=~/Downloads/yuicompressor-2.4.8.jar

include yui.mk
YUI_FILES_PATHS=$(foreach name,$(YUI_FILES), intermediate/yui/$(YUI_VERSION)/$(name))


JS_PARTS=\
	intermediate/yui-all-min-cropped.js \
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

final: all
	# Copies only what is needed in the final site, without any source/intermediate files
	rm -rf final final.tmp
	mkdir final.tmp
	# We skip: js-source *.mk Makefile
	cp -ra \
		*.jpg *.png *.css air ancient_egyptians backgrounds classic dondorf font *.html jolly-royal js *.gif layouts mobile paris \
		final.tmp

	$(FINALIZE)


js/combined-min.js: $(JS_PARTS)
	cat $^ > $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)

intermediate/yui-all-min-cropped.js: $(YUI_FILES_PATHS) yui.mk
	cat $(YUI_FILES_PATHS) > $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)
intermediate/%.min.js: js-source/%.js $(YUI_COMPRESSOR)
	mkdir -p intermediate
	java -jar $(YUI_COMPRESSOR) $< -o $@.tmp
	$(ADD_SEPARATOR)
	$(FINALIZE)

intermediate/yui/$(YUI_VERSION)/%:
	dirname $@ | xargs mkdir -p
	wget https://unpkg.com/yui@$(YUI_VERSION)/$* -O $@.tmp
	$(FINALIZE)

.phony: all clean
