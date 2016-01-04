Controller hardware
===================

Water valve controller
----------------------
This circuit allows the Pi to control a 24vAC solenoid water valve. Because the Pi can only drive up to 5vDC (or 3.3v from its GPIO ports) A relay is used to switch the 24v power supply to the valve on and off. By default it is assumed that the valve switch will be controlled by GPIO port 22 (though this can be configured by editing the lib/config.js file in the controller software)

![Controller circuit](controller.png?raw=true)

LED Status panel
----------------
This is optional, though useful (especially if the Pi & controller circuit is going to be kept in a sealed waterproof container). It consists of 3 status LEDs, one which shows if the Pi is currently powered up, one which shows whether the controller software is running (uses GPIO port 27 by default), and one which shows whether the valve is currently open (uses GPIO port 22 by default).

![Status circuit](status.png?raw=true)
