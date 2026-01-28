export default {
  stringify(obj, prop) {
    const placeholder = '____PLACEHOLDER____';
    const fns = [];
    let json = JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'function') {
          fns.push(value);
          return placeholder;
        }
        return value;
      },
      0,
    );
    json = json.replace(new RegExp(`"${placeholder}"`, 'g'), _ => fns.shift());
    // return 'this["' + prop + '"] = ' + json + ';';
    return json;
  },
};
