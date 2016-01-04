# it-gets-the-hose-again
It-Gets-The-Hose-Again is a Raspberry Pi (compatible with A,B,A+,B+ & Zero) controlled Garden sprinkler system that can be controlled via web UI or by HomeKit compatible Apps. This repo includes the source & installation instructions for controller software as well as schematics for the hardware components that need to be added to your Pi in order for the software to control sprinkler hardware.

[Software](web/README.md)
-------------------------
The controller software is built on Node.js with React.js/Redux powering a web UI front end. The software allows a configurable watering schedule and uses [OpenWeatherMap](http://openweathermap.org) to save water by not watering if it is already raining. The controller software is also compatible with Apples [HomeKit](http://www.apple.com/ios/homekit) if you wish to control the sprinkler via HomeKit instead of via the web UI.

[Hardware](hardware/README.md)
------------------------------
The hardware consists of a small circuit to allow the Pi to control a 24vAC solenoid water valve such as [this one](http://www.amazon.com/gp/product/B00002N8NV), and a 3 LED status panel. DC water valves or valves using different voltages etc should also work with this control circuit, though this has not been tested.
