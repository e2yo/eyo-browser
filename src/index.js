'use strict';

const Eyo = require('eyo-kernel');
const depack = require('./depack');

const App = {
    init: function() {
        this._input = document.querySelector('.eyo__input');
        this._input.focus();

        this._button = document.querySelector('.eyo__button');
        this._safeReplacement = document.querySelector('.eyo__safe');
        this._unsafeReplacement = document.querySelector('.eyo__unsafe');
        this._safeEyo = new Eyo();
        this._unsafeEyo = new Eyo();

        this._button.addEventListener('click', this._onClick.bind(this), false);
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13 && e.ctrlKey) {
                this._onClick();
            }
        }, false);

        this.loadDicts();
    },
    loadDicts: function() {
        this._safeReq = new XMLHttpRequest();
        this._safeReq.addEventListener('load', () => {
            this._safeEyo.dictionary.set(depack(this._safeReq.responseText).join('\n'));
        });
        this._safeReq.open('GET', './build/safe.min.txt', true);
        this._safeReq.send();

        this._unsafeReq = new XMLHttpRequest();
        this._unsafeReq.addEventListener('load', () => {
            this._unsafeEyo.dictionary.set(depack(this._unsafeReq.responseText).join('\n'));
        });
        this._unsafeReq.open('GET', './build/unsafe.min.txt', true);
        this._unsafeReq.send();
    },
    _prepareLintData: function(text) {
        const safeLint = this._safeEyo.lint(text);
        const unsafeLint = this._unsafeEyo.lint(text);

        unsafeLint.forEach(item => {
            item.unsafe = true;
        });

        const lint = [].concat(safeLint, unsafeLint);
        lint.sort(function(a, b) {
            const posA = a.position;
            const posB = b.position;

            if (posA.line > posB.line) {
                return 1;
            } else if (posA.line < posB.line) {
                return -1;
            }

            if (posA.column > posB.column) {
                return 1;
            }

            return -1;
        });

        return lint;
    },
    getIndex: function(text, line, column) {
        const buf = text.split('\n');
        let index = 0;

        for (let i = 0; i < line - 1; i++) {
            if (typeof buf[i] !== 'undefined') {
                index += buf[i].length + 1;
            }
        }

        return index + column - 1;
    },
    _onClick: function() {
        const text = this._input.innerText;
        const data = this._prepareLintData(text);
        let safeCount = 0;
        let unsafeCount = 0;

        let result = '';
        if (data.length) {
            let start = 0;
            for (let item of data) {
                let pos = item.position;
                let index = this.getIndex(text, pos.line, pos.column);
                let hl = this.highlight(item.before, item.after, item.unsafe);

                result = result + text.substring(start, index) + hl.word;
                start = index + item.before.length;
                if (item.unsafe) {
                    unsafeCount += hl.count;
                } else {
                    safeCount += hl.count;
                }
            }
            
            result += text.substring(start);
        } else {
            result = text;
        }

        this._input.innerHTML = result.replace(/\r?\n/g, '<br/>\n');

        this._safeReplacement.innerHTML = 'Замен: <span class="eyo__safe-count">' + safeCount + '</span>';
        this._unsafeReplacement.innerHTML = 'Предупреждений: <span class="eyo__unsafe-count">' + unsafeCount + '</span>';
    },
    highlight: function(before, after, isUnsafe) {
        let count = 0;
        let word = '';

        for (let i = 0; i < before.length; i++) {
            if (before[i] !== after[i]) {
                if (isUnsafe) {
                    word += '<span class="eyo__unsafe-word" title="Небезопасная замена на «' + after + '»">' + before[i] + '</span>';
                } else {
                    word += '<span class="eyo__safe-word" title="Безопасная замена">' + after[i] + '</span>';
                }

                count++;
            } else {
                word += before[i];
            }
        }

        return {
            word,
            count
        };
    }
};

App.init();
