// JavaScript source code

const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const s = dgram.createSocket('udp4');

const soundFromInstrument = new Map();
soundFromInstrument.set('ti-ta-ti', 'piano');
soundFromInstrument.set('pouet', 'trumpet');
soundFromInstrument.set('trulu', 'flute');
soundFromInstrument.set('gzi-gzi', 'violin');
soundFromInstrument.set('boum-boum', 'drum');

var musicians = [];

function updateMusicianTime() {
    musicians.forEach(function (musician) {
        musician.time++;
    });
}

function clearMusicians() {
    for (var i = 0; i < musicians.length) {
        if (musicians[i].time > 5) {
            musicians.splice(i, 1);
        }
    }
}

s.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    var data = JSON.parse(msg);


});

setInterval();