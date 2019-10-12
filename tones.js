const origin = 440;
const halfToneDifference = (Math.pow(2, 1 / 12));

function getOctave(dif) {
    let octaveDifference;
    octaveDifference = 1 * Math.pow(halfToneDifference, 12 * dif);

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

function shiftOctave(frequency, dif) {
    if (dif === 0) {
        return frequency;
    } else {
        return frequency * Math.pow(halfToneDifference, 12 * dif)
    }
}

function makeTone(frequency, fraction = 1, instrument) {
    console.log("playing tone: ", [shiftOctave(frequency, instrument.octave), fraction], instrument);
    return new Promise((resolve, reject) => {
        let context = new AudioContext();
        let o = context.createOscillator();
        let stopped = false;

        let gain = context.createGain();
        let adsr = new ADSREnvelope({
            ...instrument.envelope,
            gateTime: (60000 / instrument.bpm) / fraction
        });

        adsr.applyTo(gain.gain, context.currentTime);

        o.frequency.value = shiftOctave(frequency, instrument.octave);
        o.type = instrument.type;
        o.connect(gain);
        gain.connect(context.destination);
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
        }, adsr.duration);
    });
}

function makeFakeLegato(fnf, instrument) {
    sequence = [];
    for (i = 0; i < fnf.length; i++) {
        sequence.push(makeTone.bind(this, fnf[i][0], fnf[i][1], instrument));
    }

    return Promise.series(sequence);
}

function makeLegato(fnf, instrument) { //array of array, first is frequency, second is fraction
    console.log("playing legato: ", fnf, instrument);
    if (typeof frequency === 'string') {
        frequency = tonetable[frequency.toLowerCase()];
    }
    return new Promise((resolve, reject) => {
        let context = new AudioContext();
        let o = context.createOscillator();
        let stopped = false;

        fullLength = 0;
        for (let i = 0; i < fnf.length; i++) {
            fullLength += (60000 / instrument.bpm) / fnf[i][1];
        }

        let gain = context.createGain();
        let adsr = new ADSREnvelope({
            ...instrument.envelope,
            gateTime: fullLength
        });

        adsr.applyTo(gain.gain, context.currentTime);

        o.frequency.value = shiftOctave(fnf[0][0], instrument.octave);
        o.type = instrument.type;
        o.connect(gain);
        gain.connect(context.destination);
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
        }, fullLength);

        function prepareActiveNote(idx) {
            o.frequency.linearRampToValueAtTime(shiftOctave(fnf[idx][0], instrument.octave), context.currentTime + (60 / instrument.bpm) / fnf[idx - 1][1]);
            if (fnf[idx + 1]) {
                setTimeout(prepareActiveNote.bind(this, idx + 1), (60000 / instrument.bpm) / fnf[idx - 1][1]);
            }
        }

        prepareActiveNote(1);
    });
}

//arr=[[frequency,fraction=1]]
function makeAccord(arr, instrument) {
    return new Promise((resolve, reject) => {
        let tones = [];
        for (let i = 0; i < arr.length; i++) {
            tones[i] = makeTone(arr[i][0], arr[i][1], instrument);
        }
        Promise.all(tones).then(resolve());
    });
}

function parseSequence2(notes) {
    function parseChord(position, chars) {
        return new Error('chords not implemented');
    }

    function parseNote(position, chars) {
        function check(position, pattern) {
            if (!chars[position]) {
                return false;
            } else if (typeof pattern === 'string') {
                return pattern === chars[position];
            } else if (chars[position].match(pattern)) {
                return true;
            }
            return false;
        }

        let pointer = position;
        let ret = {
            tone: 'a',
            octave: 0,
            dot: false,
            length: 0,
            type: 'single',
            fraction: 1,
            legato: null
        }
        //parssing note
        if (check(pointer, /[c,d,e,f,g,a,b,x]/)) {
            //parsing halftone
            if (check(pointer + 1, /[#,b]/)) {
                ret.tone = chars[pointer] + chars[pointer + 1];
                pointer += 2
            } else {
                ret.tone = chars[pointer];
                pointer++;
            }
        } else if (check(pointer, '/')) {
            return parseChord(position, chars);
        } else {
            return new Error('tone not recognised at ' + pointer);
        }
        //octave match
        if (check(pointer, /\d/)) {
            ret.octave = parseInt(chars[pointer]);
            pointer++;
        }

        //parse fraction
        if (check(pointer, '/')) {
            let deca = 1;
            let total = 0;
            while (check(pointer + deca, /\d/)) {
                total = total * 10 + parseInt(chars[pointer + deca]);
                deca++;
            }
            pointer += deca;
            ret.fraction = total;
        }

        if (check(pointer, '.')) {
            ret.dot = true;
            pointer++;
        }
        if (check(pointer, ' ') || !chars[pointer]) {
            ret.length = pointer - position;
            pointer++;
            return ret;
        } else if (check(pointer, '-')) {
            pointer++;
            ret.legato = parseNote(pointer, chars);
            ret.length = pointer - position + ret.legato.length;
            return ret;
        } else {
            return new Error('sequence corrupted');
        }
    }

    const chars = notes.split('');
    let noteArray = [];

    for (let i = 0; i < chars.length; i++) {
        let note = parseNote(i, chars);
        i += note.length;
        noteArray.push(note);
    }

    console.log(noteArray);
    return noteArray;
}

function playSequence(sequence, instrument) {
    const seqPromises = sequence.map(tone => {
        if (tone.type == 'single' && !tone.legato) {
            return makeTone.bind(this, getOctave(tone.octave)[tone.tone], tone.fraction / (tone.dot ? 1.5 : 1), instrument);
        } else if (tone.type == 'single' && tone.legato) {
            let notes = [];
            let activeTone = tone;
            while (activeTone) {
                notes.push([
                    getOctave(activeTone.octave)[activeTone.tone],
                    activeTone.fraction / (activeTone.dot ? 1.5 : 1)
                ]);
                activeTone = activeTone.legato;
            }
            return makeLegato.bind(this, notes, instrument);
        }
    });

    return Promise.series(seqPromises);
}