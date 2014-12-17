var JsonInterfaces;

JsonInterfaces = {};

JsonInterfaces.elements = {};

JsonInterfaces.templates = {};

JsonInterfaces.layouts = {};

JsonInterfaces.settings = {
  errorClasses: "alert alert-danger"
};

JsonInterfaces.elements.BaseElement = (function() {
  function BaseElement() {}

  BaseElement.prototype.isValid = function(done) {
    return this.getErrors((function(_this) {
      return function(errors) {
        return done(errors.length === 0);
      };
    })(this));
  };

  BaseElement.prototype.conditionMet = function(done) {
    done = done || function() {};
    if (!this.options.condition) {
      this.show = true;
      return done(true);
    }
    return this.options.condition.call(this, this.get(), this.options.parentElement, (function(_this) {
      return function(result) {
        _this.show = result;
        return done(result);
      };
    })(this));
  };

  BaseElement.prototype.forView = function(keypath) {
    return this.get(keypath);
  };

  BaseElement.prototype.on = function(eventName, cb) {
    return $(this).on(eventName, cb);
  };

  BaseElement.prototype.off = function(eventName, cb) {
    return $(this).off(eventName, cb);
  };

  BaseElement.prototype.clearErrors = function() {
    return this.errors = [];
  };

  BaseElement.prototype.valueOrDefault = function() {
    return this.get() || this.defaultValue();
  };

  BaseElement.prototype.setParent = function(parent) {
    this.options.parentElement = parent;
    parent.on('initialized', (function(_this) {
      return function() {
        return _this.conditionMet();
      };
    })(this));
    return parent.on('change', (function(_this) {
      return function() {
        return _this.conditionMet();
      };
    })(this));
  };

  BaseElement.prototype.getName = function() {
    return this.options.name;
  };

  BaseElement.prototype.getElName = function() {
    var namespaced;
    if (!this.options.parentElement) {
      return this.options.name;
    }
    namespaced = this.options.parentElement.getName() + '[' + this.options.name + ']';
    if (this.options.parentElement && this.options.namespace) {
      return namespaced;
    }
    if (this.options.parentElement && this.options.parentElement.isTop()) {
      return this.options.name;
    }
    return namespaced;
  };

  BaseElement.prototype.getElId = function() {
    var id, namespaced;
    id = this.options.id || this.options.name;
    if (!this.options.parentElement) {
      return id;
    }
    namespaced = this.options.parentElement.getName() + '-' + id;
    if (this.options.parentElement && this.options.namespace) {
      return namespaced;
    }
    if (this.options.parentElement && this.options.parentElement.isTop()) {
      return id;
    }
    return namespaced;
  };

  return BaseElement;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.CollectionElement = (function(_super) {
  __extends(CollectionElement, _super);

  function CollectionElement(options) {
    if (options == null) {
      options = {};
    }
    this.errors = [];
    this.errorsKeyed = {};
    this.value = {};
    this.elements = [];
    if (!options.name) {
      throw new Error('name required');
    }
    if (!options.layout) {
      options.layout = JsonInterfaces.layouts.OneColumnLayout;
    }
    options.elements = JsonInterfaces.Factory.buildElements(options.elements);
    this.options = options;
    this.addElements(this.options.elements);
    if (options.value) {
      this.set(options.value, void 0, {
        updateAll: true,
        events: false
      });
    }
    $(this).triggerHandler('initialized');
  }

  CollectionElement.prototype.isTop = function() {
    return !this.options.parentElement;
  };

  CollectionElement.prototype.addElements = function(elements) {
    var element, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      if (!element) {
        throw new Error('Invalid Element: ' + element);
      }
      _results.push(this.addElement(element));
    }
    return _results;
  };

  CollectionElement.prototype.addElement = function(element) {
    this.elements.push(element);
    element.setParent(this);
    if (!element.noValue) {
      this.getInitialValueFromElement(element);
    }
    element.on('submit', (function(_this) {
      return function() {
        return _this.submit();
      };
    })(this));
    element.on('validate', (function(_this) {
      return function(event, errors) {
        _this.errorsKeyed[element.getName()] = errors;
        _this.errors = _this.createErrorArray(_this.errorsKeyed);
        return $(_this).triggerHandler('validate', [_this.errors || [], _this.errorsKeyed || {}]);
      };
    })(this));
    if (!element.noValue) {
      element.on('change', (function(_this) {
        return function(event, value) {
          if (_this.ignoreElementChangeEvents) {
            return;
          }
          return _this.set(element.getName(), value);
        };
      })(this));
    }
    return $(this).triggerHandler('elementAdded', [element]);
  };

  CollectionElement.prototype.getInitialValueFromElement = function(element) {
    return this.value[element.getName()] = element.valueOrDefault();
  };

  CollectionElement.prototype.submit = function() {
    if (this.options.parentElement) {
      return $(this).triggerHandler('submit');
    } else {
      return this.validate((function(_this) {
        return function(errors) {
          if (errors.length === 0) {
            return $(_this).triggerHandler('submit', [_this.value]);
          }
        };
      })(this));
    }
  };

  CollectionElement.prototype.defaultValue = function() {
    return this.options.defaultValue || {};
  };

  CollectionElement.prototype.set = function(keypath, value, options) {
    var changed, element, existingValue, i, v, _ref;
    if (options == null) {
      options = {};
    }
    options = $.extend({
      updateAll: false,
      events: true
    }, options);
    if (!keypath) {
      throw new Error('At least 1 argument required');
    }
    if (typeof value === 'undefined' && !$.isPlainObject(keypath)) {
      throw new Error('value must be an object');
    }
    if (typeof value !== 'undefined') {
      return this.setKeyPath(keypath, value, options);
    }
    value = keypath;
    existingValue = $.extend(true, {}, this.value);
    this.value = $.extend(this.value, value);
    changed = false;
    this.ignoreElementChangeEvents = true;
    _ref = this.value;
    for (i in _ref) {
      v = _ref[i];
      if (existingValue[i] === this.value[i] && !options.updateAll) {
        continue;
      }
      changed = true;
      element = this.getElement(i);
      if (element) {
        this.setValueOnElement(i, v);
        if (options.events) {
          $(this).trigger('change:' + i, [v, element]);
        }
      }
    }
    this.ignoreElementChangeEvents = false;
    if (changed && options.events) {
      return $(this).trigger('change', [this.value]);
    }
  };

  CollectionElement.prototype.setKeyPath = function(keypath, value, options) {
    var obj;
    if (options == null) {
      options = {};
    }
    obj = {};
    obj[keypath] = value;
    return this.set(obj, void 0, options);
  };

  CollectionElement.prototype.setValueOnElement = function(key, value) {
    var element;
    element = this.getElement(key);
    if (element.noValue) {
      return;
    }
    return element.set(value);
  };

  CollectionElement.prototype.getElement = function(name) {
    var element, _i, _len, _ref;
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      if (element.getName() === name) {
        return element;
      }
    }
    return null;
  };

  CollectionElement.prototype.getElements = function() {
    return this.elements;
  };

  CollectionElement.prototype.get = function(keypath) {
    if (keypath) {
      return this.value[keypath];
    } else {
      return this.value;
    }
  };

  CollectionElement.prototype.render = function($el) {
    var template;
    if ($el) {
      this.options.$el = $el;
    }
    template = typeof this.options.template === 'function' ? this.options.template() : this.options.template;
    this.layout = new this.options.layout({
      element: this,
      template: template
    });
    return this.layout.render(this.options.$el);
  };

  CollectionElement.prototype.close = function() {
    return $(this).off();
  };

  CollectionElement.prototype.getErrors = function(callback) {
    var element, validators, _i, _len, _ref;
    validators = [];
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      if (element.noValue) {
        continue;
      }
      validators.push((function(element) {
        return function(callback) {
          return element.conditionMet(function(result) {
            var keyed;
            keyed = {};
            keyed[element.getName()] = null;
            if (result === false) {
              return callback(null, keyed);
            }
            return element.getErrors(function(elementErrors) {
              keyed[element.getName()] = elementErrors || [];
              return callback(null, keyed);
            });
          });
        };
      })(element));
    }
    this.errors = [];
    this.errorsKeyed = {};
    return async.parallel(validators, (function(_this) {
      return function(err, results) {
        var error, flattened, _j, _len1;
        flattened = {};
        for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
          error = results[_j];
          flattened = $.extend(flattened, error);
        }
        _this.errorsKeyed = flattened;
        _this.errors = _this.createErrorArray(_this.errorsKeyed);
        return callback.call(_this, _this.errors);
      };
    })(this));
  };

  CollectionElement.prototype.createErrorArray = function(errorsKeyed) {
    var elementErrors, error, errors, name, _i, _len, _ref;
    errors = [];
    for (name in errorsKeyed) {
      elementErrors = errorsKeyed[name];
      _ref = elementErrors || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        error = _ref[_i];
        errors.push(error);
      }
    }
    return errors;
  };

  CollectionElement.prototype.clearErrors = function() {
    CollectionElement.__super__.clearErrors.call(this);
    return this.errorsKeyed = {};
  };

  CollectionElement.prototype.clear = function() {
    var element, _i, _len, _ref, _results;
    _ref = this.elements;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      if (element.clear) {
        element.clear();
      }
      if (this.value[element.getName()] !== void 0) {
        if (element.getValue) {
          _results.push(this.value[element.getName()] = element.getValue());
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  CollectionElement.prototype.validate = function(done) {
    return this.conditionMet((function(_this) {
      return function(result) {
        if (result === false) {
          return;
        }
        return _this.getErrors(function() {
          $(_this).triggerHandler('validate', [_this.errors || [], _this.errorsKeyed || {}]);
          if (typeof done === 'function') {
            return done.call(_this, _this.errors);
          }
        });
      };
    })(this));
  };

  return CollectionElement;

})(JsonInterfaces.elements.BaseElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.ScalarElement = (function(_super) {
  __extends(ScalarElement, _super);

  function ScalarElement(options) {
    if (options == null) {
      options = {};
    }
    this.errors = [];
    this.value = {};
    this.isScalar = true;
    options.validators = options.validators || [];
    if (!options.name) {
      throw new Error('name required');
    }
    this.options = options;
    if (this.options.value) {
      this.set(options.value, void 0, {
        events: false,
        validate: false
      });
    }
    $(this).on('change', (function(_this) {
      return function() {
        if (_this.errors.length > 0) {
          return _this.validate();
        }
      };
    })(this));
  }

  ScalarElement.prototype.clear = function() {
    return this.set(this.defaultValue());
  };

  ScalarElement.prototype.submit = function() {
    if (this.options.parentElement) {
      return $(this).triggerHandler('submit', [this.get()]);
    } else {
      return this.validate((function(_this) {
        return function(errors) {
          if (errors.length === 0) {
            return $(_this).triggerHandler('submit', [_this.get()]);
          }
        };
      })(this));
    }
  };

  ScalarElement.prototype.defaultValue = function() {
    return this.options.defaultValue || '';
  };

  ScalarElement.prototype.set = function(keypath, value, options) {
    var changed, existingValue, i, v, _ref;
    if (options == null) {
      options = {};
    }
    value = this.normalizeValueForSet(keypath, value);
    options = $.extend({
      events: true,
      validate: true
    }, options);
    existingValue = $.extend(true, {}, this.value);
    this.value = $.extend(this.value, value);
    changed = false;
    _ref = this.value;
    for (i in _ref) {
      v = _ref[i];
      if (existingValue[i] === this.value[i]) {
        continue;
      }
      if (options.events) {
        $(this).trigger('change:' + i, [this.value[i]]);
      }
      if (!changed) {
        changed = true;
      }
    }
    if (changed && options.events) {
      $(this).trigger('change', [this.get()]);
    }
    if (!options.validate) {
      return this.validate();
    }
  };

  ScalarElement.prototype.normalizeValueForSet = function(keypath, value) {
    var obj;
    if ($.isPlainObject(keypath)) {
      return keypath;
    }
    if (keypath && typeof value === !'undefined') {
      obj = {};
      obj.keypath = value;
      return obj;
    }
    return {
      value: keypath
    };
  };

  ScalarElement.prototype.setKeyPath = function(keypath, value) {
    var obj;
    obj = {};
    obj[keypath] = value;
    return this.set(obj);
  };

  ScalarElement.prototype.get = function(keypath) {
    if (keypath == null) {
      keypath = 'value';
    }
    return this.value[keypath];
  };

  ScalarElement.prototype.render = function($el) {
    var template;
    if ($el) {
      this.options.$el = $el;
    }
    template = typeof this.options.template === 'function' ? this.options.template() : this.options.template;
    this.options.$el.html(template);
    this.bindRivets();
    return this.afterRender();
  };

  ScalarElement.prototype.afterRender = function() {
    if (!this.options.parentElement) {
      return this.conditionMet();
    }
  };

  ScalarElement.prototype.bindRivets = function() {
    return this.view = rivets.bind(this.options.$el, {
      options: this.options,
      element: this
    });
  };

  ScalarElement.prototype.close = function() {
    this.view.unbind();
    this.view = null;
    if (this.options.$el) {
      this.options.$el.empty();
    }
    return $(this).off();
  };

  ScalarElement.prototype.getErrors = function(callback) {
    var validator, validatorCallback, validatorCallbacks, _i, _len, _ref;
    if (this.noValue) {
      return callback.call(this, []);
    }
    if (this.options.validators.length > 0) {
      validatorCallbacks = [];
      _ref = this.options.validators;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        validator = _ref[_i];
        validatorCallback = ((function(_this) {
          return function(validator) {
            return function(asyncCallback) {
              return validator.call(_this, _this.get(), _this.options.parentElement, function(results) {
                if (results instanceof Array) {
                  return asyncCallback(null, results);
                } else if (results) {
                  return asyncCallback(null, [results]);
                } else {
                  return asyncCallback(null, []);
                }
              });
            };
          };
        })(this))(validator);
        validatorCallbacks.push(validatorCallback);
      }
      this.errors = [];
      return async.parallel(validatorCallbacks, (function(_this) {
        return function(err, results) {
          var result, _j, _len1;
          for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
            result = results[_j];
            _this.errors = _this.errors.concat(result);
          }
          $(_this).triggerHandler('errors', [_this.errors || []]);
          return callback.call(_this, _this.errors);
        };
      })(this));
    } else {
      $(this).triggerHandler('errors', [[]]);
      return callback.call(this, []);
    }
  };

  ScalarElement.prototype.validate = function(done) {
    return this.conditionMet((function(_this) {
      return function(result) {
        if (!result) {
          return;
        }
        return _this.getErrors(function(errors) {
          $(_this).triggerHandler('validate', [errors || []]);
          if (typeof done === 'function') {
            return done(errors);
          }
        });
      };
    })(this));
  };

  return ScalarElement;

})(JsonInterfaces.elements.BaseElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Textfield = (function(_super) {
  __extends(Textfield, _super);

  function Textfield(options) {
    if (!options.template) {
      options.template = JsonInterfaces.templates.textfield;
    }
    Textfield.__super__.constructor.call(this, options);
    $(this).on("errors", (function(_this) {
      return function(event, errors) {
        return _this.input()[errors.length ? 'addClass' : 'removeClass']('error');
      };
    })(this));
  }

  Textfield.prototype.input = function() {
    return $('input', this.options.$el);
  };

  Textfield.prototype.afterRender = function() {
    Textfield.__super__.afterRender.apply(this, arguments);
    this.options.$el.addClass(this.options.classes);
    if (this.options.instantChange) {
      return this.input().on('keyup', (function(_this) {
        return function(e) {
          return _this.set($(e.currentTarget).val());
        };
      })(this));
    }
  };

  return Textfield;

})(JsonInterfaces.elements.ScalarElement);

JsonInterfaces.templates.address = '<div rv-show="element.show" rv-id="element#getElId" class="address-wrapper"><div id="address1-region"></div><div id="address2-region"></div><div class="row"><div class="col-md-5"><div id="city-region"></div></div><div class="col-md-5"><div id="state-region"></div></div><div class="col-md-2"><div id="zip-region"></div></div></div></div>';

JsonInterfaces.templates.date = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><input type="date" rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"/><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.email = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><input type="email" rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"/><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.oneColumnLayout = '<form novalidate="novalidate" class="one-column-layout"><div class="errors"><div rv-each-error="layout.errors" class="error alert alert-danger">{error}</div></div><div class="elements"></div></form>';

JsonInterfaces.templates.oneColumnLayoutParent = '<div class="one-column-layout"><div class="elements"></div></div>';

JsonInterfaces.templates.password = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><input type="password" rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"/><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.radio = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><label rv-each-option="options.options" class="radio-inline"><input type="radio" rv-name="element#getElName" rv-value="option.value" rv-checked="element:value"/><span>{option.label}</span></label><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.select = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><select rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"><option rv-each-option="options.options" rv-value="option.value">{option.label}</option></select><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.submit = '<div rv-show="element.show" class="form-group"><input type="submit" rv-name="element#getElName" rv-id="element#getElId" rv-value="options.value" class="btn btn-primary"/></div>';

JsonInterfaces.templates.textarea = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><textarea rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"></textarea><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

JsonInterfaces.templates.textfield = '<div rv-show="element.show" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><input type="text" rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"/><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>';

rivets.adapters[':'] = {
  subscribe: function(obj, keypath, callback) {
    return obj.on('change:' + keypath, callback);
  },
  unsubscribe: function(obj, keypath, callback) {
    return obj.off('change:' + keypath, callback);
  },
  read: function(obj, keypath) {
    return obj.forView(keypath);
  },
  publish: function(obj, keypath, value) {
    return obj.setKeyPath(keypath, value);
  }
};

rivets.adapters['#'] = {
  subscribe: function(obj, keypath, callback) {},
  unsubscribe: function(obj, keypath, callback) {},
  read: function(obj, methodName) {
    return obj[methodName]();
  },
  publish: function(obj, keypath, value) {}
};

JsonInterfaces.Factory = (function() {
  function Factory() {}

  Factory.build = function(options) {
    var defaults, type;
    defaults = {
      type: JsonInterfaces.elements.CollectionElement,
      elements: []
    };
    options = $.extend(defaults, options);
    options.elements = this.buildElements(options.elements);
    type = this.getType(options.type);
    delete options.type;
    return new type(options);
  };

  Factory.buildElements = function(options) {
    var config, elementClass, elementOptions, elements, name, _i, _len;
    if ($.isArray(options)) {
      elements = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        elementOptions = options[_i];
        elements.push(this.buildElement(elementOptions));
      }
      return elements;
    }
    if ($.isPlainObject(options)) {
      elements = [];
      for (name in options) {
        config = options[name];
        if ($.isPlainObject(config)) {
          config.name = name;
          elements.push(this.buildElement(config));
        } else if (typeof config === 'string') {
          config = {
            name: name,
            type: this.getType(config)
          };
          elements.push(this.buildElement(config));
        } else if (typeof config === 'function') {
          elementClass = config;
          config = {
            name: name,
            type: elementClass
          };
          elements.push(this.buildElement(config));
        } else {
          elements.push(config);
        }
      }
      return elements;
    }
    throw new Error('Config must be an array or a json object.');
  };

  Factory.buildElement = function(elementOptions) {
    var type;
    if (!$.isPlainObject(elementOptions)) {
      return elementOptions;
    }
    type = this.getType(elementOptions.type);
    delete elementOptions.type;
    elementOptions.validators = this.processValidators(elementOptions);
    elementOptions.condition = this.processCondition(elementOptions.condition);
    return new type(elementOptions);
  };

  Factory.processValidators = function(options) {
    var message, validators;
    validators = [];
    if (typeof options.validators === 'function') {
      validators = [options.validators];
    } else if (!options.validators) {
      validators = [];
    }
    if (!options.required) {
      return validators;
    }
    message = options.required === true ? (options.label || 'This field') + ' is required.' : options.required;
    validators.push((function(_this) {
      return function(value, parentElement, done) {
        return done(value === '' || value === null || value === void 0 ? message : void 0);
      };
    })(this));
    return validators;
  };

  Factory.processCondition = function(condition) {
    var checkValue, name;
    if (condition == null) {
      condition = false;
    }
    if (!condition) {
      return condition;
    }
    if (typeof condition === 'function') {
      return condition;
    }
    if ($.isPlainObject(condition)) {
      for (name in condition) {
        checkValue = condition[name];
        return (function(value, parentElement, done) {
          var element;
          element = parentElement.getElement(name);
          if (!element) {
            return done(false);
          }
          return done(element.get() === checkValue);
        });
      }
    }
    return false;
  };

  Factory.getType = function(type) {
    if (typeof type === 'string' && JsonInterfaces.elements[type]) {
      return JsonInterfaces.elements[type];
    }
    return type || JsonInterfaces.elements.Textfield;
  };

  return Factory;

})();

var InterfaceBuilder;

JsonInterfaces.InterfaceBuilder = InterfaceBuilder = (function() {
  function InterfaceBuilder() {}

  InterfaceBuilder.prototype.build = function(config) {};

  return InterfaceBuilder;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Address = (function(_super) {
  __extends(Address, _super);

  function Address(options) {
    if (!options.layout) {
      options.layout = JsonInterfaces.layouts.TemplateLayout;
    }
    if (!options.template) {
      options.template = JsonInterfaces.templates.address;
    }
    options.elements = this.buildAddressElements(options, options.elements);
    Address.__super__.constructor.call(this, options);
  }

  Address.prototype.buildAddressElements = function(options, elements) {
    var defaults;
    if (elements == null) {
      elements = {};
    }
    defaults = {
      address1: {
        label: 'Address',
        required: options.required
      },
      address2: {
        label: 'Address Line 2'
      },
      city: {
        label: 'City',
        required: options.required
      },
      state: {
        type: JsonInterfaces.elements.State,
        required: options.required
      },
      zip: {
        label: 'Zip',
        required: options.required
      }
    };
    options = $.extend(defaults, elements);
    return JsonInterfaces.Factory.buildElements(options);
  };

  return Address;

})(JsonInterfaces.elements.CollectionElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Checkbox = (function(_super) {
  __extends(Checkbox, _super);

  function Checkbox(options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    defaults = {
      template: JsonInterfaces.templates.checkbox
    };
    options = $.extend(defaults, options);
    options.options = this.processOptions(options, options.options);
    Checkbox.__super__.constructor.call(this, options);
  }

  Checkbox.prototype.normalizeValueForSet = function(keypath, value) {
    value = Checkbox.__super__.normalizeValueForSet.call(this, keypath, value);
    if (this.options.boolean) {
      value.value = value.value === 'true' || value.value === true ? true : false;
    }
    return value;
  };

  Checkbox.prototype.processOptions = function(elementOptions, options, placeholder) {
    var label, processed, set, sets, value, _i, _len, _ref;
    if (elementOptions.boolean === true) {
      return [
        {
          label: 'Yes',
          value: true
        }, {
          label: 'No',
          value: false
        }
      ];
    }
    if ($.isArray(options)) {
      return options;
    }
    if (typeof options === 'string') {
      processed = [];
      sets = options.split(',');
      for (_i = 0, _len = sets.length; _i < _len; _i++) {
        set = sets[_i];
        _ref = set.split(':'), label = _ref[0], value = _ref[1];
        processed.push({
          label: label,
          value: value
        });
      }
      return processed;
    }
    processed = [];
    for (value in options) {
      label = options[value];
      processed.push({
        label: label,
        value: value
      });
    }
    return processed;
  };

  return Checkbox;

})(JsonInterfaces.elements.ScalarElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.DateField = (function(_super) {
  __extends(DateField, _super);

  function DateField(options) {
    if (!options.template) {
      options.template = JsonInterfaces.templates.date;
    }
    options.validators.push(function(value, parentElement, done) {
      if (!value) {
        return done();
      }
      return done(!validator.isDate(value) ? 'Please enter a valid date.' : void 0);
    });
    DateField.__super__.constructor.call(this, options);
  }

  DateField.prototype.forView = function(keypath) {
    var date, value;
    value = DateField.__super__.forView.call(this);
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      date = new Date(value);
    }
    return date.toISOString().substring(0, 10);
  };

  return DateField;

})(JsonInterfaces.elements.Textfield);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Email = (function(_super) {
  __extends(Email, _super);

  function Email(options) {
    if (!options.template) {
      options.template = JsonInterfaces.templates.email;
    }
    options.validators || (options.validators = []);
    options.validators.push(function(value, parentElement, done) {
      if (!value) {
        return done();
      }
      return done(!validator.isEmail(value) ? "Valid email required." : void 0);
    });
    Email.__super__.constructor.call(this, options);
  }

  return Email;

})(JsonInterfaces.elements.Textfield);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Html = (function(_super) {
  __extends(Html, _super);

  function Html(options) {
    this.noValue = true;
    Html.__super__.constructor.call(this, options);
  }

  Html.prototype.render = function($el) {
    if ($el) {
      this.options.$el = $el;
    }
    return this.options.$el.html(this.options.html);
  };

  return Html;

})(JsonInterfaces.elements.ScalarElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Password = (function(_super) {
  __extends(Password, _super);

  function Password(options) {
    options = $.extend({
      label: "Password",
      template: JsonInterfaces.templates.password,
      min: 6
    }, options);
    options.validators || (options.validators = []);
    options.validators.push(function(value, parentElement, done) {
      if (!value) {
        return done();
      }
      return done(!validator.isLength(value, options.min) ? "Password must be at least " + options.min + " characters long." : void 0);
    });
    Password.__super__.constructor.call(this, options);
  }

  return Password;

})(JsonInterfaces.elements.Textfield);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Radio = (function(_super) {
  __extends(Radio, _super);

  function Radio(options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    defaults = {
      template: JsonInterfaces.templates.radio
    };
    options = $.extend(defaults, options);
    options.options = this.processOptions(options, options.options);
    Radio.__super__.constructor.call(this, options);
  }

  Radio.prototype.normalizeValueForSet = function(keypath, value) {
    value = Radio.__super__.normalizeValueForSet.call(this, keypath, value);
    if (this.options.boolean) {
      value.value = value.value === "true" || value.value === true ? true : false;
    }
    return value;
  };

  Radio.prototype.processOptions = function(elementOptions, options, placeholder) {
    var label, processed, set, sets, value, _i, _len, _ref;
    if (elementOptions.boolean === true) {
      return [
        {
          label: 'Yes',
          value: true
        }, {
          label: 'No',
          value: false
        }
      ];
    }
    if ($.isArray(options)) {
      return options;
    }
    if (typeof options === "string") {
      processed = [];
      sets = options.split(',');
      for (_i = 0, _len = sets.length; _i < _len; _i++) {
        set = sets[_i];
        _ref = set.split(':'), label = _ref[0], value = _ref[1];
        processed.push({
          label: label,
          value: value
        });
      }
      return processed;
    }
    processed = [];
    for (value in options) {
      label = options[value];
      processed.push({
        label: label,
        value: value
      });
    }
    return processed;
  };

  return Radio;

})(JsonInterfaces.elements.ScalarElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Select = (function(_super) {
  __extends(Select, _super);

  function Select(options) {
    if (!options.template) {
      options.template = JsonInterfaces.templates.select;
    }
    if (options.range) {
      options.options = this.processRangeOptions(options);
    } else {
      options.options = this.processOptions(options.options);
    }
    if (options.placeholder) {
      options.options.unshift({
        label: options.placeholder,
        value: null
      });
    }
    Select.__super__.constructor.call(this, options);
    $(this).on('errors', (function(_this) {
      return function(event, errors) {
        if (errors.length) {
          return _this.select().addClass('error');
        } else {
          return _this.select().removeClass('error');
        }
      };
    })(this));
  }

  Select.prototype.select = function() {
    if (!this.options.$el) {
      throw new Error('@options.$el is required');
    }
    return $('select', this.options.$el);
  };

  Select.prototype.processRangeOptions = function(options) {
    var i, rangeValues, start, _i, _ref, _ref1;
    if (!options.range) {
      throw new Error('No range options');
    }
    rangeValues = [];
    start = options.start || 0;
    for (i = _i = _ref = options.range[0], _ref1 = options.range[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
      rangeValues.push({
        value: i + start,
        label: i + start
      });
    }
    if (options.reverse) {
      return rangeValues.reverse();
    } else {
      return rangeValues;
    }
  };

  Select.prototype.processOptions = function(options) {
    var label, processed, set, sets, value, _i, _len, _ref;
    if ($.isArray(options)) {
      return options;
    }
    processed = [];
    if (typeof options === 'string') {
      sets = options.split(',');
      for (_i = 0, _len = sets.length; _i < _len; _i++) {
        set = sets[_i];
        _ref = set.split(':'), label = _ref[0], value = _ref[1];
        processed.push({
          label: label,
          value: value
        });
      }
      return processed;
    }
    for (value in options) {
      label = options[value];
      processed.push({
        label: label,
        value: value
      });
    }
    return processed;
  };

  Select.prototype.normalizeValueForSet = function(keypath, value) {
    var r, _ref;
    r = Select.__super__.normalizeValueForSet.call(this, keypath, value);
    r.value = r != null ? (_ref = r.value) != null ? _ref.toString() : void 0 : void 0;
    return r;
  };

  return Select;

})(JsonInterfaces.elements.ScalarElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.State = (function(_super) {
  __extends(State, _super);

  function State(options) {
    if (options == null) {
      options = {};
    }
    options = $.extend({
      label: "Select State",
      name: "state",
      placeholder: "Select State",
      options: this.states()
    }, options);
    State.__super__.constructor.call(this, options);
  }

  State.prototype.states = function() {
    return [
      {
        value: "AL",
        label: "Alabama"
      }, {
        value: "AK",
        label: "Alaska"
      }, {
        value: "AZ",
        label: "Arizona"
      }, {
        value: "AR",
        label: "Arkansas"
      }, {
        value: "CA",
        label: "California"
      }, {
        value: "CO",
        label: "Colorado"
      }, {
        value: "CT",
        label: "Connecticut"
      }, {
        value: "DE",
        label: "Delaware"
      }, {
        value: "DC",
        label: "District Of Columbia"
      }, {
        value: "FL",
        label: "Florida"
      }, {
        value: "GA",
        label: "Georgia"
      }, {
        value: "HI",
        label: "Hawaii"
      }, {
        value: "ID",
        label: "Idaho"
      }, {
        value: "IL",
        label: "Illinois"
      }, {
        value: "IN",
        label: "Indiana"
      }, {
        value: "IA",
        label: "Iowa"
      }, {
        value: "KS",
        label: "Kansas"
      }, {
        value: "KY",
        label: "Kentucky"
      }, {
        value: "LA",
        label: "Louisiana"
      }, {
        value: "ME",
        label: "Maine"
      }, {
        value: "MD",
        label: "Maryland"
      }, {
        value: "MA",
        label: "Massachusetts"
      }, {
        value: "MI",
        label: "Michigan"
      }, {
        value: "MN",
        label: "Minnesota"
      }, {
        value: "MS",
        label: "Mississippi"
      }, {
        value: "MO",
        label: "Missouri"
      }, {
        value: "MT",
        label: "Montana"
      }, {
        value: "NE",
        label: "Nebraska"
      }, {
        value: "NV",
        label: "Nevada"
      }, {
        value: "NH",
        label: "New Hampshire"
      }, {
        value: "NJ",
        label: "New Jersey"
      }, {
        value: "NM",
        label: "New Mexico"
      }, {
        value: "NY",
        label: "New York"
      }, {
        value: "NC",
        label: "North Carolina"
      }, {
        value: "ND",
        label: "North Dakota"
      }, {
        value: "OH",
        label: "Ohio"
      }, {
        value: "OK",
        label: "Oklahoma"
      }, {
        value: "OR",
        label: "Oregon"
      }, {
        value: "PA",
        label: "Pennsylvania"
      }, {
        value: "RI",
        label: "Rhode Island"
      }, {
        value: "SC",
        label: "South Carolina"
      }, {
        value: "SD",
        label: "South Dakota"
      }, {
        value: "TN",
        label: "Tennessee"
      }, {
        value: "TX",
        label: "Texas"
      }, {
        value: "UT",
        label: "Utah"
      }, {
        value: "VT",
        label: "Vermont"
      }, {
        value: "VA",
        label: "Virginia"
      }, {
        value: "WA",
        label: "Washington"
      }, {
        value: "WV",
        label: "West Virginia"
      }, {
        value: "WI",
        label: "Wisconsin"
      }, {
        value: "WY",
        label: "Wyoming"
      }
    ];
  };

  return State;

})(JsonInterfaces.elements.Select);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Submit = (function(_super) {
  __extends(Submit, _super);

  function Submit(options) {
    this.noValue = true;
    options = $.extend({
      template: JsonInterfaces.templates.submit,
      name: "submit",
      value: "Submit"
    }, options);
    Submit.__super__.constructor.call(this, options);
  }

  Submit.prototype.afterRender = function() {
    return this.input().addClass(this.options.classes);
  };

  Submit.prototype.input = function() {
    return $('input', this.options.$el);
  };

  return Submit;

})(JsonInterfaces.elements.ScalarElement);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JsonInterfaces.elements.Textarea = (function(_super) {
  __extends(Textarea, _super);

  function Textarea(options) {
    if (!options.template) {
      options.template = JsonInterfaces.templates.textarea;
    }
    Textarea.__super__.constructor.call(this, options);
  }

  Textarea.prototype.input = function() {
    return $('textarea', this.options.$el);
  };

  return Textarea;

})(JsonInterfaces.elements.Textfield);

JsonInterfaces.layouts.OneColumnLayout = (function() {
  function OneColumnLayout(options) {
    this.options = options;
    if (!this.options.element.getElements()) {
      throw new Error('fields required');
    }
    this.elements = this.options.element.getElements();
    if (this.options.element.isTop()) {
      if (!this.options.template) {
        this.options.template = JsonInterfaces.templates.oneColumnLayout;
      }
    } else {
      if (!this.options.template) {
        this.options.template = JsonInterfaces.templates.oneColumnLayoutParent;
      }
    }
    this.errors = [];
  }

  OneColumnLayout.prototype.elementsEl = function() {
    return $('.one-column-layout > .elements', this.options.$el);
  };

  OneColumnLayout.prototype.clearErrors = function() {
    return this.errors = [];
  };

  OneColumnLayout.prototype.addError = function(message) {
    return this.errors.push(message);
  };

  OneColumnLayout.prototype.render = function($el) {
    var element, name, template, _ref;
    if ($el) {
      this.options.$el = $el;
    }
    if (!this.options.$el) {
      throw new Error('@options.$el not set');
    }
    template = typeof this.options.template === 'function' ? this.options.template() : this.options.template;
    this.options.$el.html(template);
    this.view = rivets.bind(this.options.$el, {
      layout: this
    });
    _ref = this.elements;
    for (name in _ref) {
      element = _ref[name];
      $el = $('<div></div>').appendTo(this.elementsEl());
      element.render($el);
    }
    if (this.options.element.isTop()) {
      return $('.one-column-layout', this.options.$el).on('submit', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.options.element.submit();
        };
      })(this));
    }
  };

  OneColumnLayout.prototype.close = function() {
    var element, _i, _len, _ref;
    if (this.view) {
      this.view.unbind();
    }
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element.close();
    }
    return this.options.$el.empty();
  };

  return OneColumnLayout;

})();

JsonInterfaces.layouts.TemplateLayout = (function() {
  function TemplateLayout(options) {
    this.options = options;
    if (!this.options.element) {
      throw new Error('element required');
    }
    if (typeof this.options.template === 'undefined') {
      throw new Error('template required');
    }
    this.elements = this.options.element.elements;
  }

  TemplateLayout.prototype.render = function($el) {
    var element, template, _i, _len, _ref;
    if ($el) {
      this.options.$el = $el;
    }
    if (!this.options.$el) {
      throw new Error('@options.$el not set');
    }
    template = typeof this.options.template === 'function' ? this.options.template() : this.options.template;
    this.options.$el.html(template);
    this.view = rivets.bind(this.options.$el, {
      layout: this,
      element: this.options.element
    });
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element.render($('#' + this.toSnakeCase(element.getName()) + '-region', this.options.$el));
    }
    return $('form', this.options.$el).on('submit', (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.options.element.submit();
      };
    })(this));
  };

  TemplateLayout.prototype.toSnakeCase = function(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  };

  TemplateLayout.prototype.close = function() {
    var element, _i, _len, _ref;
    if (this.view) {
      this.view.unbind();
    }
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element.close();
    }
    return this.options.$el.empty();
  };

  return TemplateLayout;

})();
