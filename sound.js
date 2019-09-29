document.forms[0].play.addEventListener('click', () => {
    parseSequence(document.forms[0].song.value);
});

document.forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    parseSequence(document.forms[0].song.value);
})