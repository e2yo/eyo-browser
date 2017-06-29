'use strict';

const Eyo = require('eyo-kernel');
const depack = require('./depack');
const safeEyo = new Eyo();
const unsafeEyo = new Eyo();

const input = document.querySelector('.eyo__input');
const button = document.querySelector('.eyo__button');
const safeReplacement = document.querySelector('.eyo__safe');
const unsafeReplacement = document.querySelector('.eyo__unsafe');

const safeReq = new XMLHttpRequest();
safeReq.addEventListener('load', function() {
    safeEyo.dictionary.set(depack(safeReq.responseText).join('\n'));
});

safeReq.open('GET', './build/safe.min.txt', true);
safeReq.send();

const unsafeReq = new XMLHttpRequest();
unsafeReq.addEventListener('load', function() {
    unsafeEyo.dictionary.set(depack(unsafeReq.responseText).join('\n'));
});

unsafeReq.open('GET', './build/unsafe.min.txt', true);
unsafeReq.send();

input.focus();
button.addEventListener('click', function() {
    let safeCount = 0;
    let unsafeCount = 0;
    let text = input.innerText;
    let newText = safeEyo.restore(text);
    let result = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] !== newText[i]) {
            result.push('<span class="eyo__ok" title="Безопасная замена">' + newText[i] + '</span>');
            safeCount++;
        } else {
            result.push(text[i]);
        }
    }

    input.innerHTML = result.join('').replace(/\r?\n/g, '<br/>\n');

    safeReplacement.innerHTML = 'Замен: <span class="eyo__safe-count">' + safeCount + '</span>';
    unsafeReplacement.innerHTML = 'Предупреждений: <span class="eyo__unsafe-count">' + unsafeCount + '</span>';
}, false);
