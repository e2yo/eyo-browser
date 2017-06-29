module.exports = function(words) {
    if (typeof words === 'string') {
        words = words.trim().split(/\r?\n/);
    }

    const result = [];
    
    for (const w of words) {
        if (w.search(/\(/) > -1) {
            const buf = w.split(/[(|)]/);
            for (let i = 1, len = buf.length - 1; i < len; i++) {
                result.push(buf[0] + buf[i]);
            }
        } else {
            result.push(w);
        }
    }
    
    return result.sort();
};
