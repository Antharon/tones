const melodyInstrument = {
    type: 'sawtooth',
    bpm: 60,
    octave: 1
}

const bassInstrument = {
    type: 'sine',
    bpm: 60,
    octave: -1
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