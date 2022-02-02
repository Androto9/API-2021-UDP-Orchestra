// JavaScript source code

const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const s = dgram.createSocket('udp4');
const net = require('net');

const soundFromInstrument = new Map();
soundFromInstrument.set('ti-ta-ti', 'piano');
soundFromInstrument.set('pouet', 'trumpet');
soundFromInstrument.set('trulu', 'flute');
soundFromInstrument.set('gzi-gzi', 'violin');
soundFromInstrument.set('boum-boum', 'drum');

let musicians = [];

function updateMusiciansTime() {
    musicians.forEach(function (musician) {
        musician.time++;
    });
}

function clearMusicians() {
    for (let i = 0; i < musicians.length; ++i) {
        if (musicians[i].time > 5) {
            musicians.splice(i, 1);
        }
    }
}

// Join the multicast UDP address
s.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// Get a sound when it arrives on the multicast address
s.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    // Parses the JSON data
    let data = JSON.parse(msg);

    let alreadyPlaying = false;

    // Check if a musician is already in the list
    musicians.forEach(function (musician) {
        if (musician.uuid === data.uuid) {
            alreadyPlaying = true;
        }
    });

    // Add the musician in the list if not there yet or update musician time
    if (!alreadyPlaying) {

        let musician = {
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

var tcpServer = net.createServer(function (socket) {
    console.log('Client connected to TCP server');

    clearMusicians();

    let musiciansList = JSON.parse(JSON.stringify(musicians));

    musiciansList.forEach(function (this) { delete this.time })

    socket.write(JSON.stringify(musicians));
    socket.pipe(socket);
    socket.destroy();
});

tcpServer.listen(protocol.PROTOCOL_TCP_PORT);


setInterval(function () { updateMusiciansTime(); }, 1000);