import { h, Component } from 'preact'; /** @jsx h */

export default class ContentEditable extends Component {
    constructor() {
        super();

        this.emitChange = this.emitChange.bind(this);
    }

    render() {
        return h(
            this.props.tagName || 'div',
            {
                ...this.props,
                onInput: this.emitChange,
                onBlur: this.props.onBlur || this.emitChange,
                contentEditable: !this.props.disabled,
                html: this.props.html
            },
            this.props.children);
    }

    shouldComponentUpdate(nextProps) {
        return !this.base
            || (nextProps.html !== this.base.innerHTML && nextProps.html !== this.props.html)
            || this.props.disabled !== nextProps.disabled;
    }

    componentDidUpdate() {
        if (this.base && this.props.html !== this.base.innerHTML) {
            this.base.innerHTML = this.props.html;
        }
    }

    componentDidMount() {
        if (this.props.autofocus) {
            this.base.focus();
        }
    }

    emitChange(e) {
        const base = this.base;
        if (!base) { return; }

        const html = base.innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange(e);
        }

        this.lastHtml = html;
    }
}
