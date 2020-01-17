var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var socket = require('socket.io');
var path = require('path');
var ejs = require('ejs');
var app = express();
var port = 3000;
var isIntervalSet = false;

// HELLO

// for each ip address connect and read data
var ipAddresses = ["http://192.168.0.168/json", "http://192.168.0.202/json", "http://192.168.0.203/json",
                "http://192.168.0.200/json", "http://192.168.0.201/json", "http://192.168.0.204/json"];

var receivedData = new Array(6);

var server = app.listen(port, function() {
    console.log('listening to port '+port);
});

// Static Files
app.use('/static', express.static('public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

// Web Socket Setup
var io = socket(server);

// TEST VALUES (REMOVE LATER!!!)
var index = 0; // TEST VALUE FOR EQUIP NAME (REMOVE LATER)
var equipNames = ['TMARS', 'EC1', 'EC2', 'NGPS', 'MIPS1', 'MIPS2'];  // TEST VALUE FOR EQUIP NAME (REMOVE LATER)

// INITIAL DATA REQUEST
getData();

function getData() {

    // Requests to IP Addresses for Data
    request(ipAddresses[0], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[0] = parseJSON(html); // WANT ONLY BODY TEXT // HTML
        } else {
            receivedData[0] = {name:'NGPS', temp:null, hum:null, psi:null};
        }
    });
    request(ipAddresses[1], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[1] = parseJSON(html);
        } else {
            receivedData[1] = {name:'MIPS2', temp:null, hum:null, psi:null};
        }
    });
    request(ipAddresses[2], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[2] = parseJSON(html);
        } else {
            receivedData[2] = {name:'EC1', temp:null, hum:null, psi:null};
        }
    });
    request(ipAddresses[3], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[3] = parseJSON(html);
        } else {
            receivedData[3] = {name:'EC2', temp:null, hum:null, psi:null};
        }
    });
    request(ipAddresses[4], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[4] = parseJSON(html);
        } else {
            receivedData[4] = {name:'TMARS', temp:null, hum:null, psi:null};
        }
    });
    request(ipAddresses[5], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            receivedData[5] = parseJSON(html);
        } else {
            receivedData[5] = {name:'MIPS1', temp:null, hum:null, psi:null};
        }
    });

    // RENDERS HTML PAGE WITH INITIAL RETRIEVED VALUES
    app.get('/', function(req, res) {

        // EACH OBJECT BELOW CAN HAVE ITS OWN DATA
        res.render(path.join(__dirname, '/TempSensor.html'));
        res.end();
    });
}

// PARSES JSON URL EXTENSION
function parseJSON(html) {

    // console.log(html); // TEST PRINT

    var newToken = false;
    var token = "";
    var tokenType = "";
    var newValue = false;
    var value = "";
    var name;
    var temp;
    var hum;
    var psi;

    for (var i = 0; i < html.length; i++) {
        if (html.charAt(i) == '"') {
            if (html.charAt(i+1) != ':') {
                newToken = true;
            } else {
                newToken = false;
                switch(token) {
                    case "temperature": tokenType = "temp"; break;
                    case "humidity": tokenType = "hum"; break;
                    case "psi": tokenType = "psi"; break;
                    default: name = token; break;
                }
                token = "";
            }
        }
        if (html.charAt(i-1) == ':' && html.charAt(i) == ' ' && html.charAt(i+1) != '[') {
            newValue = true;
        }
        if ((html.charAt(i) == ',' || html.charAt(i) == '}') && newValue) {
            newValue = false;
            switch(tokenType) {
                case "temp": temp = parseFloat(value); break;
                case "hum": hum = parseFloat(value); break;
                case "psi": psi = parseFloat(value); break;
            }
            value = "";
        }
        if (newToken && html.charAt(i) != '"') {
            token += html.charAt(i);
        }
        if (newValue) {
            value += html.charAt(i);
        }
    }

    // TEST DATA TO OVERRIDE REAL DATA
    // var name = equipNames[index];
    // if (index >= 5) {
    //     index = 0;
    // } else {
    //     index++;
    // }
    // var temp =  Math.round(Math.random() * 100);
    // var hum =  Math.round(Math.random() * 100);
    // var psi;
    // if (name == 'TMARS') {
    //     psi =  Math.round(Math.random() * 10);
    // } else {
    //     psi = null;
    // }

    if (psi === undefined) {
        psi = null;
    }

    // TEST PRINTS
    // console.log(name);
    // console.log(temp);
    // console.log(hum);
    // console.log(psi);
    // console.log("");

    temp = temp * (9/5) + 32; // Celcius to Fahrenheit (MOVE TO APP.JS for Option)

    // REAL RETURN VALUES
    return {name:name, temp:Math.round(temp*10)/10, hum:Math.round(hum*10)/10, psi:Math.round(psi*10)/10};
}

// SENDS DATA RECEIVED FROM RASPBERRY PI'S TO CLIENT
io.on('connection', function(socket) {
    console.log('connected to client:', socket.id);
    if (!isIntervalSet) { // MAYBE IF NEW CONNECTION AFTER DISCONNECT
        setInterval(function() {
            getData();
    
            // TEST PRINT OF DATA SENT TO CLIENT
            // for (var i = 0; i < 6; i++) {
            //     console.log(receivedData[i]);
            // }
            // console.log("");
    
            io.emit('data', receivedData);
        }, 15000);
        isIntervalSet = true;
    }
});