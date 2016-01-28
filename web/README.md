The controller software is built on [Node.js](https://nodejs.org) on the backend and Uses [React.js](https://facebook.github.io/react/) & [Redux](https://github.com/rackt/redux) for the frontend web UI. The software is also compatible with Apples HomeKit using [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) if you want to use an IOS based controller app rather than the built in scheduling functionality exposed by the web UI.

Building & Installation
=======================
While it is possible to build the application on the Pi itself, it is *much* faster to install only the runtime dependancies on the Pi, and actually build the application on another OSX or Linux machine before rsyncing over the built assets.

##### On your Dev machine
* Install Node.js for your platform (OSX or Linux is recommended)
* Run ```npm install -g gulp```
* Run ```npm install```
* Run ```cp keys.default.js keys.js```
* Edit keys.js in your favourite text editor and add your Google Maps & OpenWeatherMap API keys. These keys are required and the web app will not work correctly without them

 ###### Getting a OpenWeatherMap API key
 Go to [openweathermap.org](http://openweathermap.org) and sign up for a free account. Once signed up, go to home.openweathermap.org and copy the Api key from the setup tab into the ```OPEN_WEATHER_API_KEY``` variable in keys.js

 ###### Getting Google Maps API key
 Go to [console.developers.google.com](https://console.developers.google.com/) and go to the Api manager page. Enable the 'Google Static Maps' API on the overview tab, then go to the credentials page and generate a new browser API key. Copy this key into the ```GOOGLE_MAPS_API_KEY``` in keys.js

##### Then on the Pi
* clone or copy this repository to your Raspberry Pi
* cd into the web folder
* Run ```sudo ./install_deps_on_pi.sh```
* Run ```./install_on_pi.sh``` (This will most likely take a long time)

##### Then back on your Dev machine
* run ```deploy_to_pi.sh user@raspberry-pi-ip:/path/to/web/app/folder/you/were/in/on/the/previous/step```. This will rsync the built application to the pi (it will also ask you for the pi users password a couple of times if you have not set up passwordless SSH).

##### Then on the Pi
* Run ```sudo systemctl start itgetsthehose``` (Note install_deps_on_pi will have set this service to auto start on boot)

##### Finally, On any device
* You should now be able to browse to https://&lt;my-raspberry-pi-ip&gt;/ and enter a valid Linux username/password for your Pi (by default pi/raspberry) and see the webUI
* If you want to register the Pi with a HomeKit controller app, you will need to enter a pin code - this can be seen on the settings page of the web UI 

Development
===========

Development on the Raspberry Pi hardware can be somewhat painful, so this application has been built with having a development environment on OSX or Linux systems in mind. To facilitate this, the software can run in one of two modes - Development or Production. It is recommended to only use production mode when running on the Pi itself, as production mode enables a number of features which are inconvenient for development including HTTPS, authentication (using pwauth), and minified frontend resources. The mode can be controlled by setting the ```NODE_ENV``` environment variable to either development/production (development is the default).


If you ran the install steps above, you should now have a working development environment set up. To build and run the application run 

```
gulp build
gulp serverw
```

The build command only needs to be run once - this builds some frontend vendor dependancies and does not need to be re-run. The serverw command starts up the application server and watches for changes and restarts/hot-reloads as changes are detected. You should now be able to browse to the web UI on http://localhost:3001/.

To run the tests, run

```
gulp tests
```

And to have the tests watch for file changes, run

```
gulp testsw
```
