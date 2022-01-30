// JavaScript source code
var protocol = require('./orchestra-protocol');
var dgram = require('dgram');
var s = dgram.createSocket('udp4');
var { v4: uuidv4 } = require('uuid');


function Musician(instrument) {

    this.instrument = instrument;
    this.uuid = uuidv4();

    this.instrumentSound = new Map();
    this.instrumentSound.set('piano', 'ti-ta-ti');
    this.instrumentSound.set('trumpet', 'pouet');
    this.instrumentSound.set('flute', 'trulu');
    this.instrumentSound.set('violin', 'gzi-gzi');
    this.instrumentSound.set('drum', 'boum-boum');

    Musician.prototype.play = function () {
        var sound = this.instrumentSound.get(this.instrument);

        var data = { uuid: this.uuid, sound: sound };

        var payload = JSON.stringify(data);

        var message = new Buffer(payload);

        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload " + payload + " via port " + s.address().port)
        }
    }

    setInterval(this.play.bind(this), 1000);
}

var instrument = process.argv[2];

var musician = new Musician(instrument);