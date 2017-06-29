'use strict';

const fs = require('fs');
const depack = require('../src/depack');

const endings = [
    'а', 'ай', 'айте', 'ал', 'ала', 'али', 'ало', 'ам', 'ами',
    'ась', 'ать', 'аться', 'ах', 'аюсь', 'ают', 'аются', 'ая', 'аясь', 'аяся', 'аяся',
    'е', 'ев', 'его', 'егося', 'ее', 'ееся', 'ей', 'ейся', 'ем', 'емся', 'ему', 'емуся',
    'есь', 'ет', 'ете', 'ется', 'ешь', 'ешься', 'ею', 'еюся',
    'и', 'ие', 'ией', 'ием', 'иеся', 'ии', 'ий', 'ийся', 'им', 'ими', 'имися', 'имся',
    'ись', 'их', 'ихся', 'ию', 'ия', 'иям', 'иями', 'иях',
    'о', 'ов', 'ого', 'ое', 'ой', 'ом', 'ому', 'ось', 'ою',
    'ся', 'те', 'тесь',
    'у', 'уем', 'ует', 'уете', 'уешь', 'уй', 'уйте', 'ую', 'уюся', 'уют', 'уя',
    'ы', 'ые', 'ый', 'ым', 'ыми', 'ых',
    'ь', 'ью', 'ю', 'юю',
    'я', 'ям', 'ями', 'ях', 'яя',
    'ёй', 'ём', 'ёмся', 'ёт', 'ёте', 'ётесь', 'ётся', 'ёшь', 'ёшься', 'ёю'
].sort((a, b) => a.length === b.length ? 0 : a.length > b.length ? -1 : 1);

const reEndings = endings.map(e => new RegExp(e + '$'));

class Packer {
    constructor(src, dest) {
        const words = fs.readFileSync(src, 'utf-8').trim().split(/\r?\n/).sort();
        const result = this.prepare(words);
        
        this.check(words, result);

        fs.writeFileSync(dest, result.join('\n'));
    }
    
    check(words, result) {
        const beforeText = words.join('\n');
        const afterText = depack(result).join('\n');
        
        if (beforeText !== afterText) {
            throw Error('Error dictionary compression.');
        }
    }
    
    prepare(words) {
        const buffer = {};

        for (const w of words) {
            const [partWord, ending] = this.getPart(w);
            if (!buffer[partWord]) {
                buffer[partWord] = [];
            }

            if (buffer[partWord].indexOf(ending) === -1) {
                buffer[partWord].push(ending);
            }
        }

        const result = [];
        Object.keys(buffer).forEach(function(key) {
            const endings = buffer[key];
            if (endings.length === 1) {
                result.push(key + endings[0]);
            } else {
                result.push(key + '(' + endings.sort().join('|') + ')');
            }
        });

        return result.sort();
    }

    getPart(word) {
        for (let i = 0, len = endings.length; i < len; i++) {
            const e = endings[i];
            if (word.search(reEndings[i]) > -1) {
                return [word.substr(0, word.length - e.length), e];
            }
        }

        return [word, ''];
    }
}

module.exports = Packer;
