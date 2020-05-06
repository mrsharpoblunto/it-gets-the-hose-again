#!/bin/bash
if [ "$(whoami)" != "root" ]; then
	echo "Sorry, you are not root. Re-run this script using sudo"
	exit 1
fi

# install dependencies
apt-get install pwauth openssl libavahi-compat-libdnssd-dev nodejs npm
npm install -g yarn

# set the app-server to auto start on boot
cp scripts/systemd.conf /etc/systemd/system/itgetsthehose.service
cwd=$(pwd)
sed -i.bak 's|CWD|'"$cwd"'|g' /etc/systemd/system/itgetsthehose.service
rm /etc/systemd/system/itgetsthehose.service.bak
systemctl enable itgetsthehose
