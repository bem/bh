test:
	@./node_modules/.bin/mocha -u bdd -R spec

lint:
	@./node_modules/.bin/jshint lib techs

.PHONY: test lint
