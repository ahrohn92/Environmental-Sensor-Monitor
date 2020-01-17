var socket = io.connect('http://localhost:3000/');

// TESTING VALUES
var ipAddresses = ["192.168.0.201", "192.168.0.203", 
"192.168.0.200", "192.168.0.168", "192.168.0.204", "192.168.0.202"];

// SETTINGS
var minTempSettings = new Array(6);
var maxTempSettings = new Array(6);
var minHumSettings = new Array(6);
var maxHumSettings = new Array(6);
var minPSISetting;
var maxPSISetting;


// SMAPLE RANDOM TABLE DATA
var logTempData = new Array(2);
var logHumData = new Array(2);
var logPSIData = new Array(2);

// var hourAvg = new Array(24); // Hours Avgs per Day
// var dayAvg = new Array(30); // Day Avgs per Month, last 7 for Week

// Prototype for includes() function
String.prototype.includes = function(string) {
    return this.indexOf(string) !== -1;
};

// SAMPLE DATA TO BE REPLACE WITH ACTUAL VALUES LATER
generateTableData();
generateSampleSettings();


// RANDOM DATA VALUES (WILL LATER NEED TO BE A METHOD THAT GETS DATA)

function generateTableData() {
    for (var i = 0; i < 180; i++) {
        logTempData[i] = Math.round(Math.random() * 101);
        logHumData[i] = Math.round(Math.random() * 101);
        logPSIData[i] = Math.round(Math.random() * 10);
    }
}

// INITIAL MIN/MAX SETTINGS
function generateSampleSettings() {
    for (var i = 0; i < 6; i++) {
        minTempSettings[i] =  5;
        maxTempSettings[i] =  95;
        minHumSettings[i] =  5;
        maxHumSettings[i] =  95;
    }
    minPSISetting = 1;
    maxPSISetting = 8;
}

/*
 * FUNCTIONAL CODE
 */

var modal;
var modalContent;
var settingsType;
var index;
var audio = new Audio("/alarm.mp3");

window.addEventListener("click", outsideClick);

// INITIAL IP ADDRESS ASSIGNMENT
document.getElementById("TMARS-ipAddr").innerHTML = ipAddresses[0];
document.getElementById("EC1-ipAddr").innerHTML = ipAddresses[1];
document.getElementById("EC2-ipAddr").innerHTML = ipAddresses[2];
document.getElementById("NGPS-ipAddr").innerHTML = ipAddresses[3];
document.getElementById("MIPS1-ipAddr").innerHTML = ipAddresses[4];
document.getElementById("MIPS2-ipAddr").innerHTML = ipAddresses[5];

// PERHAPS ADD SOME FUNCTIONALITY TO DETERMINE IF COLOR NEEDS TO BE CHANGED
function setData(tempValues, humValues, psi) {
    document.getElementById("TMARS-temp").innerHTML = tempValues[0]+" &#176F";
    document.getElementById("TMARS-hum").innerHTML = humValues[0]+"%";
    document.getElementById("TMARS-psi").innerHTML = psi+" psi";
    document.getElementById("EC1-temp").innerHTML = tempValues[1]+" &#176F";
    document.getElementById("EC1-hum").innerHTML = humValues[1]+"%";
    document.getElementById("EC2-temp").innerHTML = tempValues[2]+" &#176F";
    document.getElementById("EC2-hum").innerHTML = humValues[2]+"%";
    document.getElementById("NGPS-temp").innerHTML = tempValues[3]+" &#176F";
    document.getElementById("NGPS-hum").innerHTML = humValues[3]+"%";
    document.getElementById("MIPS1-temp").innerHTML = tempValues[4]+" &#176F";
    document.getElementById("MIPS1-hum").innerHTML = humValues[4]+"%";
    document.getElementById("MIPS2-temp").innerHTML = tempValues[5]+" &#176F";
    document.getElementById("MIPS2-hum").innerHTML = humValues[5]+"%";
    var equipNames = ["TMARS", "EC1", "EC2", "NGPS", "MIPS1", "MIPS2"];
    
    var needAlarm = false;
    for (var i = 0; i < 6; i++) {
        needAlarm = checkData(tempValues, humValues, psi,
            equipNames[i], i, needAlarm);
    }
    if (needAlarm) {
        soundAlarm();
    }
}

function checkData(tempValues, humValues, psi, equipName, i, needAlarm) {
    if (tempValues[i] > maxTempSettings[i]) {
        document.getElementById(equipName+"-temp").style.backgroundColor = "pink";
        if (!document.getElementById(equipName+"-alarm").checked) {
            needAlarm = true;
        }
    } else if (tempValues[i] < minTempSettings[i]) {
        document.getElementById(equipName+"-temp").style.backgroundColor = "lightblue";
        if (!document.getElementById(equipName+"-alarm").checked) {
            needAlarm = true;
        }
    } else {
        document.getElementById(equipName+"-temp").style.backgroundColor = "gainsboro";
    }
    if (humValues[i] > maxHumSettings[i]) {
        document.getElementById(equipName+"-hum").style.backgroundColor = "pink";
        if (!document.getElementById(equipName+"-alarm").checked) {
            needAlarm = true;
        }
    } else if (humValues[i] < minHumSettings[i]) {
        document.getElementById(equipName+"-hum").style.backgroundColor = "lightblue";
        if (!document.getElementById(equipName+"-alarm").checked) {
            needAlarm = true;
        }
    } else {
        document.getElementById(equipName+"-hum").style.backgroundColor = "gainsboro";
    }
    if (equipName == "TMARS") {
        if (psi > maxPSISetting) {
            document.getElementById(equipName+"-psi").style.backgroundColor = "pink";
            if (!document.getElementById(equipName+"-alarm").checked) {
                needAlarm = true;
            }
        } else if (psi < minPSISetting) {
            document.getElementById(equipName+"-psi").style.backgroundColor = "lightblue";
            if (!document.getElementById(equipName+"-alarm").checked) {
                needAlarm = true;
            }
        } else {
            document.getElementById(equipName+"-psi").style.backgroundColor = "gainsboro";
        }
    }
    return needAlarm;
}

function soundAlarm() {
    if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
    }
}

function acknowledgeAlarm() {
    if (!audio.paused) {
        audio.pause();
    }
}

function openModal(id) {
    var equipName;
    if (id.includes("TMARS")) {
        equipName = "TMARS";
        index = 0;
    } else if (id.includes("EC1")) {
        equipName = "EC1";
        index = 1;
    } else if (id.includes("EC2")) {
        equipName = "EC2";
        index = 2;
    } else if (id.includes("NGPS")) {
        equipName = "NGPS";
        index = 3;
    } else if (id.includes("MIPS1")) {
        equipName = "MIPS #1";
        index = 4;
    } else if (id.includes("MIPS2")) {
        equipName = "MIPS #2";
        index = 5;
    } else {
        return;
    }
    if (id.includes("temp")) {
        settingsType = "temp";
        modal = document.getElementById("temp-settings-modal");
        document.getElementById("temp-modal-title").innerText = equipName+" Temperature";
        document.getElementById("min-temp").value = minTempSettings[index];
        document.getElementById("max-temp").value = maxTempSettings[index];
    }
    if (id.includes("hum")) {
        settingsType = "hum";
        modal = document.getElementById("hum-settings-modal");
        document.getElementById("hum-modal-title").innerText = equipName+" Humidity Settings";
        document.getElementById("min-hum").value = minHumSettings[index];
        document.getElementById("max-hum").value = maxHumSettings[index];
    }
    if (id.includes("psi")) {
        settingsType = "psi";
        modal = document.getElementById("psi-settings-modal");
        document.getElementById("psi-modal-title").innerText = equipName+" Pressure Settings";
        document.getElementById("min-psi").value = minPSISetting;
        document.getElementById("max-psi").value = maxPSISetting;
    }
    if (id.includes("ipAddr")) {
        modal = document.getElementById("ip-input-modal");
        document.getElementById("ip-modal-title").innerText = equipName+" IP Address";
        document.getElementById("ipAddr-input").value = ipAddresses[index];
    }
    openChart();
    modal.style.display = "block";
}

function saveSettings() {
    if (settingsType == "temp") {
        minTempSettings[index] = document.getElementById("min-temp").value;
        maxTempSettings[index] = document.getElementById("max-temp").value;
    }
    if (settingsType == "hum") {
        minHumSettings[index] = document.getElementById("min-hum").value;
        maxHumSettings[index] = document.getElementById("max-hum").value;
    }
    if (settingsType == "psi") {
        minPSISetting = document.getElementById("min-psi").value;
        maxPSISetting = document.getElementById("max-psi").value;
    }
    closeModal();
}

function connectIPAddress() {
    var equipNames = ["TMARS", "EC1", "EC2", "NGPS", "MIPS1", "MIPS2"]; // FIGURE OUT HOW TO INCREASE SCOPE
    var ipAddr = document.getElementById("ipAddr-input").value;

    // ADD CHECKS FOR VALID INPUT THEN PROCEED
    try {
        // ATTEMPTS TO CONNECT TO IP ADDR
        // IF SUCCESSFUL IT SAVES IP ADDRESS VALUE
        ipAddresses[index] = ipAddr;
        document.getElementById(equipNames[index]+"-ipAddr").innerHTML = ipAddr;
        alert(ipAddr+" connected to "+index);

    } catch (err) {
        alert("Could not connect to "+ipAddr);
    }
}

function closeModal() {
    modal.style.display = "none";
}

function outsideClick(e) {
    if (e.target == modal) {
        closeModal();
    }
}

// OPENS LINE CHART FOR DATA VALUES
function openChart() {

    var date = new Date();

    // CREATES LINE GRAPH FOR MODAL
    var numDays = document.getElementById("time-selection").value;
    var labelArray;
    var dataArray;



    // NEED TO DETERMINE VARIABLES FOR CHART

    if (numDays == 1) {
        labelArray = new Array(24);
        dataArray = new Array(24);
        for (var i = 0; i < 24; i++) {
            var hourNumber = date.getHours() - (24-i);
            if (hourNumber < 0) {
                hourNumber += 24;
            }
            labelArray[i] = hourNumber;
        }
        for (var i = 0; i < 24; i++) {
            dataArray[i] = logTempData[i];
        }
    }
    if (numDays == 7) {
        labelArray = new Array(7);
        dataArray = new Array(7);

        for (var i = 0; i < 7; i++) {
            var day = date.getDay() - (7-i);
            if (day < 0) {
                day += 7;
            }
            switch (day) {
                case 0: labelArray[i] = "Sun"; break;
                case 1: labelArray[i] = "Mon"; break;
                case 2: labelArray[i] = "Tue"; break;
                case 3: labelArray[i] = "Wed"; break;
                case 4: labelArray[i] = "Thu"; break;
                case 5: labelArray[i] = "Fri"; break;
                case 6: labelArray[i] = "Sat"; break;
            }
        }
        for (var i = 0; i < 7; i++) {
            dataArray[i] = logTempData[i];
        }
    }
    if (numDays == 30) {
        labelArray = new Array(30);
        dataArray = new Array(30);

        for (var i = 0; i < 30; i++) {
            var dayNumber = date.getDate() - (30-i);
            if (dayNumber < 1) {
                dayNumber += 30;
            }
            labelArray[i] = dayNumber;
            dataArray[i] = logTempData[i];
        }
    }

    var minArray = new Array(dataArray.length);
    for (var i = 0; i < dataArray.length; i++) {
        minArray = 5; // TEST VALUE
    }
    // fill up dataArray with data from log array

    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labelArray,
        datasets: [{
            label: 'Avg. Temp',
            data: dataArray,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
    });
}

// ASSIGNS DATA RECEIVED FROM SERVER TO EQUIPMENT
socket.on('data', function(data) {
    var tempValues = new Array(6);
    var humValues = new Array(6);
    var psi;
    
    // TEST PRINTS
    // for (var i = 0; i < 6; i++) {
    //     alert(data[i].name+" "+data[i].temp+" "+data[i].hum+" "+data[i].psi);
    // }

    for (var i = 0; i < 6; i++) {
        var j;
        switch (data[i].name) {
            case 'TMARS': j = 0; psi = data[i].psi; break;
            case 'EC1': j = 1; break;
            case 'EC2': j = 2; break;
            case 'NGPS': j = 3; break;
            case 'MIPS1': j = 4; break;
            case 'MIPS2': j = 5; break;
            default: break;
        }
        tempValues[j] = data[i].temp;
        humValues[j] = data[i].hum;
    }
    setData(tempValues, humValues, psi);
});