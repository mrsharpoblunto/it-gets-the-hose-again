#!/bin/bash
if [ "$(whoami)" != "root" ]; then
	echo "Sorry, you are not root. Re-run this script using sudo"
	exit 1
fi

# generate a self signed ssl cert
ifconfig | grep 'inet ' | awk '{print $2}' | while read -r line
do
    if [[ $line != '127.0.0.1' ]]; then
        mkdir ssl
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -subj "/C=US/CN=$line" -keyout ssl/server.key -out ssl/server.crt
        break
    fi
done

# install dependencies
#apt-get install pwauth postgres
#wget https://nodejs.org/dist/v4.2.0/node-v4.2.0-linux-armv6l.tar.gz
#tar -xvf node-v4.2.0-linux-armv61.tar.gz
#cd node-v4.2.0-linux-armv61
#cp -R * /usr/local
#cd ../
#rm -rf node-v4.2.0-linux-armv61

# build the app
#npm install
#NODE_ENV=production ./node_modules/.bin/gulp clean
#NODE_ENV=production ./node_modules/.bin/gulp build
#npm prune --production

# provision the DB schema

# set the app-server to auto start on boot

# start the app daemon
#service itgetsthehoseweb start
