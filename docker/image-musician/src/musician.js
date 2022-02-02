// JavaScript source code
const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const s = dgram.createSocket('udp4');
const { v4: uuidv4 } = require('uuid');

class Musician {
    constructor(instrument) {

        this.instrument = instrument;
        this.uuid = uuidv4();

        this.instrumentSound = new Map();
        this.instrumentSound.set('piano', 'ti-ta-ti');
        this.instrumentSound.set('trumpet', 'pouet');
        this.instrumentSound.set('flute', 'trulu');
        this.instrumentSound.set('violin', 'gzi-gzi');
        this.instrumentSound.set('drum', 'boum-boum');

        Musician.prototype.play = function () {
            let sound = this.instrumentSound.get(this.instrument);

            let data = {
                uuid: this.uuid,
                sound: sound
            };

            let payload = JSON.stringify(data);

            let message = new Buffer.from(payload);

            s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
                console.log("Sending payload " + payload + " via port " + s.address().port);
            });
        };

        setInterval(this.play.bind(this), 1000);
    }
}

// Get the instrument from the command line argument
let instrument = process.argv[2];

// Set instrument to new musician
let musician = new Musician(instrument);