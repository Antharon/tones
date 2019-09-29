const origin = 440;
const halfToneDifference = (Math.pow(2, 1 / 12));
const instrument = {
    type: 'sine',
    bpm: 60
}

function getOctave(dif) {
    let octaveDifference;
    if (dif >= 0) {
        octaveDifference = 1 * Math.pow(halfToneDifference, 12 * dif);
    } else {
        octaveDifference = 1 * Math.pow(halfToneDifference, 12 / (0 - dif));
    }

    return {
        'c': origin * octaveDifference * Math.pow(1 / halfToneDifference, 9),
        'c#': origin * octaveDifference * Math.pow(1 / halfToneDifference, 8),
        'd': origin * octaveDifference * Math.pow(1 / halfToneDifference, 7),
        'eb': origin * octaveDifference * Math.pow(1 / halfToneDifference, 6),
        'e': origin * octaveDifference * Math.pow(1 / halfToneDifference, 5),
        'f': origin * octaveDifference * Math.pow(1 / halfToneDifference, 4),
        'f#': origin * octaveDifference * Math.pow(1 / halfToneDifference, 3),
        'g': origin * octaveDifference * Math.pow(1 / halfToneDifference, 2),
        'g#': origin * octaveDifference * (1 / halfToneDifference),
        'a': origin * octaveDifference,
        'bb': origin * octaveDifference * halfToneDifference,
        'b': origin * octaveDifference * Math.pow(halfToneDifference, 2),
        'x': 0
    }
}

function makeTone(frequency, fraction = 1) {
    if (typeof frequency === 'string') {
        frequency = tonetable[frequency.toLowerCase()];
    }
    return new Promise((resolve) => {
        let context = new AudioContext();
        let o = context.createOscillator();
        let stopped = false;
        o.frequency.value = frequency;
        o.type = instrument.type;
        o.connect(context.destination);
        o.start();
        instrument.stop = () => {
            o.stop();
            stopped = true;
            reject();
        };
        setTimeout(() => {
            if (stopped) return;
            o.stop();
            instrument.stop = () => { };
            resolve();
        }, (60000 / instrument.bpm) / fraction);
    });
}

function parseSequence(notes) {
    noteArray = notes.split(' ');
    notePromises = noteArray.map((note) => {
        let split;
        if (note.match(/^(\D[# b]?)(.)?$/)) { //simple note
            split = note.match(/^(\D[# b]?)(.)?$/);
            return makeTone.bind(this, getOctave(0)[split[1]], 1 / (split[2] ? 1.5 : 1));
        } else if (note.match(/^(\D[# b]?)(\d+)(\.)?$/)) { //defined octave
            split = note.match(/^(\D[# b]?)(\d+)(\.)?$/);
            return makeTone.bind(this, getOctave(split[2])[split[1]], 1 / (split[4] ? 1.5 : 1));
        } else if (note.match(/^(\D[# b]?)\/(\d+)(\.)?$/)) { //defined fraction
            split = note.match(/^(\D[# b]?)\/(\d+)(\.)?$/);
            return makeTone.bind(this, getOctave(0)[split[1]], split[2] / (split[3] ? 1.5 : 1));
        } else if (note.match(/^(\D[# b]?)(\d+)\/(\d+)(\.)?$/)) { //defined octave and fraction
            split = note.match(/^(\D[# b]?)(\d+)\/(\d+)(\.)?$/);
            return makeTone.bind(this, getOctave(split[2])[split[1]], split[3] / (split[4] ? 1.5 : 1));
        }
    })

    return Promise.series(notePromises);
}