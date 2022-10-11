install:
	npm ci

develop:
	npx webpack serve

publish:
	npm publish --dry-run

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .
