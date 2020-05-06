#!/bin/bash
NODE_ENV=production yarn build

scp keys.json $1'/keys.json'
rsync -av dist/ $1/dist
rsync -av lib/ $1/lib
