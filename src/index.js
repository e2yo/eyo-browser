'use strict';

import {h, render, Component} from 'preact'; /** @jsx h */
import ContentEditable from './contenteditable';
import Eyo from 'eyo-kernel';
import './index.css';

function loadDict(path, dict) {
    const req = new XMLHttpRequest();
    req.responseType = 'text';
    req.addEventListener('load', () => {
        dict.dictionary.set(req.responseText);
    });
    
    req.open('GET', path, true);
    req.send();    
}

const
    safeEyo = new Eyo(),
    unsafeEyo = new Eyo();

loadDict('./dist/safe.txt', safeEyo);
loadDict('./dist/not_safe.txt', unsafeEyo);

class App extends Component {
    constructor(props) {
        super(props);

        ['setExample', 'onClick', 'onKeyUp', 'onChangeText'].forEach(key => {
            this[key] = this[key].bind(this);
        });

        this.textareaInnerText = '';

        this.state = {
            html: '',
            safeCount: 0,
            unsafeCount: 0
        };
    }

    onChangeText(e) {
        this.setState({ html: e.target.innerHTML });
    }

    setExample() {
        this.setState({
            html: this.fixLineEndings([
                'Не стекло и не хрусталь,',
                'А блестит, как будто сталь.',
                'Занесешь в тепло, домой.',
                'Станет сразу он водой.',
                'Холод от него идет.',
                'Ну конечно это...',
                '(Лед)'
            ].join('\n'))
        });
    }

    onKeyUp(e) {
        if (e.keyCode === 13 && e.ctrlKey) {
            this.onClick();
        }
    }

    stripTags(html) {
        return html.replace(/<\/?[^>]+>/gi, '');
    }

    onClick() {
        const
            text = this.stripTags(this.state.html),
            data = this.prepareLintData(text);

        let
            safeCount = 0,
            unsafeCount = 0,
            result = '';

        if (data.length) {
            let start = 0;
            for (let item of data) {
                let pos = item.position;
                let hl = this.highlight(item.before, item.after, item.unsafe);

                result = result + text.substring(start, pos.index) + hl.word;
                start = pos.index + item.before.length;
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

        this.setState({
            html: this.fixLineEndings(result),
            safeCount,
            unsafeCount
        });
    }

    fixLineEndings(text) {
        return text.replace(/\r?\n/g, '<br/>\n');
    }

    highlight(before, after, isUnsafe) {
        let
            count = 0,
            word = '';

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

    prepareLintData(text) {
        const
            safeLint = safeEyo.lint(text),
            unsafeLint = unsafeEyo.lint(text);

        for (let item of unsafeLint) {
            item.unsafe = true;
        }

        return []
            .concat(safeLint, unsafeLint)
            .sort(function(a, b) {
                const
                    posA = a.position,
                    posB = b.position;

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
    }

    render(props, state) {
        return <div>
            <a href="#" className="eyo__example" onClick={this.setExample}>Пример</a>
            <ContentEditable
                class="eyo__input"
                autofocus={true}
                html={state.html}
                onKeyUp={this.onKeyUp}                
                onChange={this.onChangeText} />
            <input class="eyo__button" onClick={this.onClick} title="CTRL+Enter" type="button" value="Восстановить" />
            <div class="eyo__safe" title="Безопасные замены">Замен: <span class="eyo__safe-count">{state.safeCount}</span></div>
            <div class="eyo__unsafe" title="Предупреждения (небезопасные замены)">Предупреждений: <span class="eyo__unsafe-count">{state.unsafeCount}</span></div>
        </div>;
    }
}

render(<App/>, document.querySelector('.container'));
