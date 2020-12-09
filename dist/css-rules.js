export default (config = {}) => ({
     
  run(editor, snd, opts = {}) {
    const component = opts.target || editor.getWrapper();
    const cssc = editor.CssComposer;
    const rules = cssc.getAll();
    let result = '';

    const { atRules, notAtRules } = this.splitRules(this.matchedRules(component, rules));
    notAtRules.forEach(rule =>  result += rule.toCSS());
    this.sortMediaObject(atRules).forEach(item => {
      let rulesStr = '';
      const atRule = item.key;
      const mRules = item.value;

      mRules.forEach(rule => {
        const ruleStr = rule.getDeclaration();

        if (rule.get('singleAtRule')) {
          result += `${atRule}{${ruleStr}}`;
        } else {
          rulesStr += ruleStr;
        }
      });

      if (rulesStr) result += `${atRule}{${rulesStr}}`;
    });

    return result;
  },

  /**
   * Get matched rules of a component
   * @param {Component} component
   * @param {Array<CSSRule>} rules
   * @returns {Array<CSSRule>}
   */
  matchedRules(component, rules) {
    const el = component.getEl();
    let result = [];

    rules.forEach(rule => {
      try {
        if (rule.selectorsToString().split(',').some(
          selector => el.matches(this.cleanSelector(selector))
        )) {
          result.push(rule);
        }
      } catch (err) {}
    });

    component.components().forEach(component => {
      result = result.concat(this.matchedRules(component, rules))
    });

    // Remove duplicates
    result = result.filter((rule, i) => result.indexOf(rule) == i);

    return result;
  },

  /**
   * Return passed selector without states
   * @param {String} selector
   * @returns {String}
   */
  cleanSelector(selector) {
    return selector.split(' ').map(item => item.split(':')[0]).join(' ');
  },

  /**
   * Split an array of rules in atRules and not
   * @param {Array<CSSRule>} rules
   * @returns {Object}
   */
  splitRules(rules) {
    const atRules = {};
    const notAtRules = [];

    rules.forEach(rule => {
      const atRule = rule.getAtRule();

      if (atRule) {
        const mRules = atRules[atRule];

        if (mRules) {
          mRules.push(rule);
        } else {
          atRules[atRule] = [rule];
        }
      } else {
        notAtRules.push(rule);
      }
    });

    return {
      atRules,
      notAtRules,
    };
  },

  /**
   * Get the numeric length of the media query string
   * @param  {String} mediaQuery Media query string
   * @return {Number}
   */
  getQueryLength(mediaQuery) {
    const length = /(-?\d*\.?\d+)\w{0,}/.exec(mediaQuery);
    if (!length) return Number.MAX_VALUE;

    return parseFloat(length[1]);
  },

  /**
   * Return a sorted array from media query object
   * @param  {Object} items
   * @return {Array}
   */
  sortMediaObject(items = {}) {
    const itemsArr = [];
    each(items, (value, key) => itemsArr.push({ key, value }));
    return itemsArr.sort(
      (a, b) => this.getQueryLength(b.key) - this.getQueryLength(a.key)
    );
  }
})