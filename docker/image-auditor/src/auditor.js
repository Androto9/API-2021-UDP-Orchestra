// JavaScript source code
const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const s = dgram.createSocket('udp4');
const net = require('net');

// Map the instruments sounds
const soundFromInstrument = new Map();
soundFromInstrument.set('ti-ta-ti', 'piano');
soundFromInstrument.set('pouet', 'trumpet');
soundFromInstrument.set('trulu', 'flute');
soundFromInstrument.set('gzi-gzi', 'violin');
soundFromInstrument.set('boum-boum', 'drum');

// List of musicians
let musicians = [];

// Update musicians time
function updateMusiciansTime() {
    musicians.forEach(function(musician) {
        musician.time++;
    });
}

// Clears musicians that didnt play for more than 5 seconds
function clearMusicians() {
    for (let i = 0; i < musicians.length; ++i) {
        if (musicians[i].time > 5) {
          musicians.splice(i, 1);
        }
    }
    
    //musicians.filter(m => m.time > 5).map(m => m.splice(m, 1));
}

// Join the multicast UDP address
s.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// Get a sound when it arrives on the multicast address
s.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    // Parses the JSON data
    let data = JSON.parse(msg);

    const alreadyPlaying = musicians.filter(musician => musician.uuid === data.uuid).length > 0

    // Add the musician in the list if not there yet or update musician time
    if (!alreadyPlaying) {

        const musician = {
            uuid: data.uuid,
            instrument: soundFromInstrument.get(data.sound),
            activeSince: new Date(Date.now()).toISOString(),
            time: 0
        };

        musicians.push(musician);
    } else {
        let updateTime = musicians.indexOf(data.uuid);
        updateTime.time = 0;
    }
});

// TCP connection with client
var tcpServer = net.createServer(function (socket) {
    console.log('Client connected to TCP server');

    // Clear musicians not responding
    clearMusicians();

    // Create musicians list
    let musiciansList = JSON.parse(JSON.stringify(musicians));

    // Removes the time of musicians to not display it
    musiciansList.forEach(function (tmp) { delete tmp.time });

    // Sends the list of musicians and close the socket
    socket.write(JSON.stringify(musiciansList));
    socket.pipe(socket);
    socket.destroy();
});

tcpServer.listen(protocol.PROTOCOL_TCP_PORT);

// Updates musicians time
setInterval(function () { 
    updateMusiciansTime();
 }, 1000);