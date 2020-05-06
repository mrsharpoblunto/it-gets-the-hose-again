# it-gets-the-hose-again
It-Gets-The-Hose-Again is a Raspberry Pi (compatible with A,B,A+,B+,2, 3, 4, and Zero) controlled Garden sprinkler system that can be controlled via a built in web UI or by HomeKit compatible Apps. This repo includes the source & installation instructions for controller software as well as schematics for the hardware components that need to be added to your Pi in order for the software to control sprinkler hardware.

[Software](web/README.md)
-------------------------
The controller software is built on Node.js with React.js powering a web UI front end. The software allows a configurable watering schedule and uses [OpenWeatherMap](http://openweathermap.org) to save water by not watering if it is already raining. The controller software is also compatible with Apple [HomeKit](http://www.apple.com/ios/homekit) if you wish to control the sprinkler via HomeKit instead of via the web UI.

![The web UI on mobile](schedule-mobile.png)

[Hardware](hardware/README.md)
------------------------------
The hardware consists of a small circuit to allow the Pi to control a 24vAC solenoid water valve such as [this one](http://www.amazon.com/gp/product/B00002N8NV), and a 3 LED status panel. DC water valves or valves using different voltages etc should also work with this control circuit, though this has not been tested.

Version 1: Powered by an AC connection into the enclosure & separate 5v and 24v DC adapters for the Pi and solenoid valve.
![The assembled hardware](completed-assembly.png)

Version 2: Powered by a PoE+ connection into the enclosure with a 24v DC PoE+ splitter that powers the solenoid valve & an additional 24v->5v stepdown transformer for powering the Pi.
