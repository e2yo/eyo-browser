'use strict';

const Eyo = require('eyo-kernel');
const eyoBro = new Eyo();

const input = document.querySelector('.eyo__input');
const button = document.querySelector('.eyo__button');
const replacement = document.querySelector('.eyo__replacement');

const req = new XMLHttpRequest();
req.addEventListener('load', function() {
    eyoBro.dictionary.set(req.responseText);
});

req.open('GET', './build/safe.txt', true);
req.send();

input.focus();
button.addEventListener('click', function() {
    let count = 0;
    let text = input.innerHTML.replace(/<span class="eyo__ok">([ёЁ])<\/span>/g, '$1');
    let newText = eyoBro.restore(text);
    let result = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] !== newText[i]) {
            result.push('<span class="eyo__ok">' + newText[i] + '</span>');
            count++;
        } else {
            result.push(text[i]);
        }
    }

    input.innerHTML = result.join('');

    replacement.innerHTML = 'Замен: ' + count;
}, false);
