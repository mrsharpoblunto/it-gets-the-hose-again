#!/bin/bash
NODE_ENV=production yarn build

scp keys.js $1'/keys.json'
rsync -av dist/ $1
rsync -av lib/ $1
