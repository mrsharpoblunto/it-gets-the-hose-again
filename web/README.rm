Installation
============

1) clone or copy this repository to your Raspberry Pi
2) Run ```sudo ./install.sh```
3) Run ```cp keys.default.js keys.js```
4) Edit keys.js in your favourite text editor and add your Google Maps & OpenWeatherMap API keys. These keys are required and the web app will not work correctly without them

    * Getting a OpenWeatherMap API key
    Go to openweathermap.org and sign up for a free account. Once signed up, go to home.openweathermap.org and copy the Api key from the setup tab into the ```OPEN_WEATHER_API_KEY``` variable in keys.js

    * Getting Google Maps API key
    Go to console.developers.google.com and go to the Api manager page. Enable the 'Google Static Maps' API on the overview tab, then go to the credentials page and generate a new browser API key. Copy this key into the ```GOOGLE_MAPS_API_KEY``` in keys.js

5) Run ```sudo service start itgetsthehoseagain```
6) browse to https://<my-raspberry-pi-ip> and enter a valid Linux username/password for your Pi (by default pi/raspberry)

Development
===========

Development on the Raspberry Pi hardware can be somewhat painful, so this application has been built with having a dev environment on OSX or Linux systems in mind. Setting up a working dev environment can be done by following these steps.

1) Install Node.js for your platform (OSX or Linux is recommended)
2) Run ```npm install -g gulp```
3) Run ```npm install```

You should now have a working dev environment set up. To build and run the application run 

```gulp build```
```gulp serverw```

The build command only needs to be run once - this builds some frontend vendor dependancies and does not need to be re-run. The serverw command starts up the application server and watches for changes and restarts/hot-reloads as changes are detected.
