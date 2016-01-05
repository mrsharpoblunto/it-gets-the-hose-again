#!/bin/bash
NODE_ENV=production ./node_modules/.bin/gulp clean
NODE_ENV=production ./node_modules/.bin/gulp build

scp keys.js $1'/keys.js'
rsync -av public $1

NODE_ENV=production ./node_modules/.bin/gulp clean
