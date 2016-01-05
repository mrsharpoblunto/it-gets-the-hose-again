#!/bin/bash
if [ "$(whoami)" != "root" ]; then
	echo "Sorry, you are not root. Re-run this script using sudo"
	exit 1
fi

# install dependencies
apt-get install pwauth openssl libavahi-compat-libdnssd-dev
if !(command -v node >/dev/null 2>&1) then
    wget https://nodejs.org/dist/v4.2.0/node-v4.2.0-linux-armv6l.tar.gz
    tar -xvf node-v4.2.0-linux-armv6l.tar.gz
    cd node-v4.2.0-linux-armv6l
    cp -R * /usr/local
    cd ../
    rm -rf node-v4.2.0-linux-armv6l
fi

# set the app-server to auto start on boot
cp upstart.conf /etc/init/itgetsthehose.conf
cwd=$(pwd)
sed -i.bak 's|CWD|'"$cwd"'|g' /etc/init/itgetsthehose.conf
