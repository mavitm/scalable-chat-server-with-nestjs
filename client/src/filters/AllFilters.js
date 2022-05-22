const AllFilters = {
  _: function (text) {
    return text;
  },
  __: function (text, replace = {}) {
    let trans = this._(text);
    if (Object.keys(replace).length > 0) {
      Object.entries(replace).forEach(function ([key, value]) {
        trans = trans.replace(new RegExp(":" + key, "g"), value);
      });
    }
    return trans;
  },
  capitalize: function (value) {
    if (!value) {
      return "";
    }
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
  deCapitalize: function (value) {
    if (!value) {
      return "";
    }
    value = value.toString();
    return value.charAt(0).toLowerCase() + value.slice(1);
  },
  dataText(val) {
    if (val < 1024) {
      return val + " MB";
    }
    return val / 1024 + " GB";
  },
};

export { AllFilters };
