const defautEnvelope = {
    attackTime: 0.01,
    decayTime: 0.5,
    releaseTime: 1,
    peakLevel: 1,
    sustainLevel: 0.5,
    attackCurve: 'lin',
    decayCurve: 'lin',
    releaseCurve: 'lin'
}

const melodyInstrument = {
    type: 'sawtooth',
    bpm: 60,
    octave: 0,
    envelope: {
        ...defautEnvelope,
        attackTime: 0.1,
        releaseTime: 2,
        sustainLevel: 0.1,
        decayTime: 2,
        decayCurve: 'exp',
    }
}

const bassInstrument = {
    type: 'sine',
    bpm: 60,
    octave: -2,
    envelope: {
        ...defautEnvelope,
        decayTime: 1,
        sustainLevel: 0.5,
        attackTime: 0.001,
    }
}

document.forms[0].play.addEventListener('click', () => {
    playSequence(parseSequence2(document.forms[0].song.value), melodyInstrument);
    playSequence(parseSequence2(document.forms[0].song2.value), bassInstrument);
});

document.forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    playSequence(parseSequence2(document.forms[0].song.value), melodyInstrument);
    playSequence(parseSequence2(document.forms[0].song2.value), bassInstrument);
});

document.forms[0].stop.addEventListener('click', () => {
    melodyInstrument.stop();
    bassInstrument.stop();
});

document.forms[0].melodyInstrument.addEventListener('change', () => {
    melodyInstrument.type = document.forms[0].melodyInstrument.value;
    console.log("changed melody instrument to: ", melodyInstrument);
});

document.forms[0].bassInstrument.addEventListener('change', () => {
    bassInstrument.type = document.forms[0].bassInstrument.value;
    console.log("changed melody instrument to: ", bassInstrument);
});

document.forms[0].octave.addEventListener('input', () => {
    melodyInstrument.octave = parseInt(document.forms[0].octave.value);
    console.log("changed melody instrument to: ", melodyInstrument);
});

document.forms[0].octave2.addEventListener('input', () => {
    bassInstrument.octave = parseInt(document.forms[0].octave2.value);
    console.log("changed melody instrument to: ", bassInstrument);
});

document.forms[0].bpm.addEventListener('input', () => {
    melodyInstrument.bpm = document.forms[0].bpm.value;
    bassInstrument.bpm = document.forms[0].bpm.value;
});