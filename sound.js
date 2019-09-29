document.forms[0].play.addEventListener('click', () => {
    parseSequence(document.forms[0].song.value);
});

document.forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    parseSequence(document.forms[0].song.value);
});

document.forms[0].stop.addEventListener('click', () => {
    instrument.stop();
});

document.forms[0].instrument.addEventListener('change', () => {
    instrument.type = document.forms[0].instrument.value;
});

document.forms[0].bpm.addEventListener('input', () => {
    instrument.bpm = document.forms[0].bpm.value;
});