#!/usr/local/bin/node

var joystick = new (require('joystick'))(0, 3500, 350);
var arDrone = require('ar-drone');

var drone = arDrone.createClient();
var droneStatus = 'landed';

// BEGIN DANNY
var g_deadZone = { // Configure each deadzones here
    'leftX':  8000,
    'leftY':  8000,
    'rightX': 8000,
    'rightY': 8000
}
var g_rightX = null; // var init - don't change
var g_rightY = null; // var init - don't change
// END DANNY

//Record to usb
drone.config('video:video_on_usb', 'TRUE')


var buttons = {
    0: 'a',
    1: 'b',
    2: 'x',
    3: 'y',
    4: 'lb',
    5: 'rb',
    6: 'start',
    7: 'xbox',
    8: 'right_stick',
    9: 'left_stick',
    10: 'select',
}

var axis = {
    0: 'left_x',
    1: 'left_y',
    2: 'lt',
    3: 'right_x',
    4: 'right_y',
    5: 'rt',
    6: 'cross_x',
    7: 'cross_y'

}

var axisLimits = {
    'min': -32767,
    'max': 32767
}

var flipTime = 750;

start = function(event) {
    console.log('tlathoaeu')
}

buttonAction = function(event) {
    if (event.init) {
        console.log('init button ' + event.number + ' : ' + buttons[event.number]);
    } else {
        console.log(event);
        switch (buttons[event.number]) {
            case 'start':
                if (event.value == 1) {
                    if (droneStatus == 'landed') {
                        drone.takeoff();
                        droneStatus = 'flying';
                    } else {
                        drone.land();
                        droneStatus = 'landed';
                    }
                    console.log(droneStatus);
                }
                break;
            case 'xbox':
                // emergency !
                drone.disableEmergency();
                droneStatus= 'Emergency Reset';
                console.log(droneStatus);
                break;
            case 'a':
                drone.stop();
                break;
            case 'y':
                drone.calibrate(0);    
                break;
            case 'rb':
                drone.animate('wave', 5000);      
                break;        
        }
        
    }
}


axisAction = function(event) {
    if (event.init) {
        console.log('init axis ' + event.number + ' : ' + axis[event.number]);
    } else {

        console.log ('event.value = ' + event.value +'');
        switch (axis[event.number]) {
        case 'right_y':

            // BEGIN DANNY
            g_rightY = event.value;
            if (Math.abs(g_rightX) < g_deadZone.rightX &&
                Math.abs(g_rightY) < g_deadZone.rightY) {
                console.log ('drone.stop()');
                drone.stop();
                break;
            }
            // END DANNY

            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                console.log ('drone.front(' + s +')');
                drone.front(s);
            } else {
                s = event.value / axisLimits.max;
                console.log ('drone.back(' + s +')');
                drone.back(s);
            }
            //console.log('front/back', s);
            break;
        case 'right_x':

            // BEGIN DANNY
            g_rightX = event.value;
            if (Math.abs(g_rightX) < g_deadZone.rightX &&
                Math.abs(g_rightY) < g_deadZone.rightY) {
                console.log ('drone.stop()');
                drone.stop();
                break;
            }
            // END DANNY

            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                console.log ('drone.left(' + s +')');
                drone.left(s);
                
            } else {
                s = event.value / axisLimits.max;
                console.log ('drone.right(' + s +')');
                drone.right(s);
                
            }
            //console.log('left/right', s);
            break;
        case 'left_y':

            // BEGIN DANNY
            if (Math.abs(event.value) < g_deadZone.leftY) {
                console.log ('leftY in deadzone');
                break;
            }
            // END DANNY

            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                drone.up(s);
            } else {
                s = event.value / axisLimits.max;
                drone.down(s);
            }
            console.log('altitude', s);
            break;
        case 'left_x':

            // BEGIN DANNY
            if (Math.abs(event.value) < g_deadZone.leftX) {
                console.log ('leftX in deadzone');
                break;
            }
            // END DANNY

            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                console.log('counterClockwise', s);
                drone.counterClockwise(s);
            } else {
                s = event.value / axisLimits.max;
                console.log('clockwise', s);
                drone.clockwise(s);
            }
            // console.log('clockwise', s);
            break;
        case 'cross_x':
            var action = null;
            if (event.value > (axisLimits.max / 2)) {
                action = 'flipRight';
                drone.stop();
            } else if (event.value < (axisLimits.min / 2)) {
                action = 'flipLeft';
                drone.stop();
            }
            
            if (action) {
                drone.animate(action, flipTime);
                console.log(action);
            }
            break;
        case 'cross_y':
            var action = null;
            if (event.value > (axisLimits.max / 2)) {
                action = 'flipBehind';
                drone.stop();
            } else if (event.value < (axisLimits.min / 2)) {
                action = 'flipAhead';
                drone.stop();
            }
            if (action) {
                drone.animate(action, flipTime);
                console.log(action);
            }
            break;
        default:
            console.log(event);
            break;
        }
    }
}

joystick.on('button', buttonAction);
joystick.on('axis', axisAction);



//                            \\\//   Everything from here
//                           -(o o)-   down can be removed.
//========================oOO==(_)==OOo=======================

axisActionTest = function(event) {
    if (event.init) {
        console.log('init axis ' + event.number + ' : ' + axis[event.number]);
    } else {

        //console.log ('g_rightY = ' + g_rightY + '     g_rightX = ' + g_rightX);

        //console.log ('event.value = ' + event.value +'');
        //for (var i in event) {
        //    console.log ('event.' + i + ' = ' + event[i] +'');
        //}
        //console.log ('');
        //return;

        switch (axis[event.number]) {

        case 'right_y':

            g_rightY = event.value;

            if (f_rightDeadZone()) {
                console.log ('drone.stop()');
                drone.stop();
                break;
            }


            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                //console.log ('drone.front(' + s +')');
                drone.front(s);
                
            } else {
                s = event.value / axisLimits.max;
                //console.log ('drone.back(' + s +')');
                drone.back(s);
                
            }
            //console.log('front/back', s);
            break;
        case 'right_x':

            g_rightX = event.value;


            if (f_rightDeadZone()) {
                console.log ('drone.stop()');
                drone.stop();
                break;
            }


            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                //console.log ('drone.left(' + s +')');
                drone.left(s);
                
            } else {
                s = event.value / axisLimits.max;
                //console.log ('drone.right(' + s +')');
                drone.right(s);
                
            }
            //console.log('left/right', s);
            break;







        case 'left_y':
            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                drone.up(s);
            } else {
                s = event.value / axisLimits.max;
                drone.down(s);
            }
            console.log('altitude', s);
            break;
        case 'left_x':
            if (event.value <= 0.5) {
                s = event.value / axisLimits.min;
                drone.counterClockwise(s);
            } else {
                s = event.value / axisLimits.max;
                drone.clockwise(s);
            }
            console.log('clockwise', s);
            break;
        case 'cross_x':
            var action = null;
            if (event.value > (axisLimits.max / 2)) {
                action = 'flipRight';
                drone.stop();
            } else if (event.value < (axisLimits.min / 2)) {
                action = 'flipLeft';
                drone.stop();
            }
            
            if (action) {
                drone.animate(action, flipTime);
                console.log(action);
            }
            break;
        case 'cross_y':
            var action = null;
            if (event.value > (axisLimits.max / 2)) {
                action = 'flipBehind';
                drone.stop();
            } else if (event.value < (axisLimits.min / 2)) {
                action = 'flipAhead';
                drone.stop();
            }
            if (action) {
                drone.animate(action, flipTime);
                console.log(action);
            }
            break;
        default:
            console.log(event);
            break;
        }
    }
}


















