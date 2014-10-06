var assert, collectionFactory, expect, print, scalarFactory;

assert = expect = chai.expect;

print = function(obj) {
  var seen;
  seen = [];
  return JSON.stringify(obj, function(key, val) {
    if (val !== null && typeof val === "object") {
      if (seen.indexOf(val) >= 0) {
        return;
      }
      seen.push(val);
    }
    return val;
  });
};

scalarFactory = function(options) {
  var defaultOptions;
  if (options == null) {
    options = {};
  }
  defaultOptions = {
    value: {
      name: 'Frankie'
    },
    template: '{element:value}'
  };
  options = $.extend(defaultOptions, options);
  return new JsonInterfaces.elements.ScalarElement(options);
};

collectionFactory = function(options) {
  var defaultOptions;
  if (options == null) {
    options = {};
  }
  defaultOptions = {
    name: 'testCollection',
    elements: []
  };
  options = $.extend(defaultOptions, options);
  return new JsonInterfaces.elements.CollectionElement(options);
};

describe("JsonInterfaces.elements.CollectionElement", function() {
  describe("#set", function() {
    it("value on construction", function() {
      var collection, element;
      element = scalarFactory({
        name: 'e1'
      });
      collection = collectionFactory({
        elements: [element],
        value: {
          e1: "test"
        }
      });
      return expect(element.get()).to.eq('test');
    });
    it("updates child elements", function() {
      var collection, element;
      element = scalarFactory({
        name: 'e1'
      });
      collection = collectionFactory({
        elements: [element]
      });
      collection.set('e1', 'test1');
      expect(element.get()).to.eq('test1');
      collection.set({
        e1: 'test2'
      });
      return expect(element.get()).to.eq('test2');
    });
    it("throws exception if given scalar", function() {
      var collection, fn;
      collection = collectionFactory();
      fn = function() {
        return collection.set('e1');
      };
      return expect(fn).to["throw"]();
    });
    it("fires change events for changed properties", function(done) {
      var collection, element;
      element = scalarFactory({
        name: 'e1'
      });
      collection = collectionFactory({
        elements: [element]
      });
      collection.on("change:e1", function(event, value, element) {
        expect(value).to.eq('test');
        return done();
      });
      return collection.set('e1', 'test');
    });
    it("fires single change event for all changed properties", function(done) {
      var collection, element;
      element = scalarFactory({
        name: 'e1'
      });
      collection = collectionFactory({
        elements: [element]
      });
      collection.on("change", function(event, value) {
        expect(value.e1).to.eq('test');
        return done();
      });
      return collection.set('e1', 'test');
    });
    return it("fires change event when child element changes", function(done) {
      var collection, element;
      element = scalarFactory({
        name: 'e1'
      });
      collection = collectionFactory({
        elements: [element]
      });
      collection.on("change", function(e, value, v) {
        expect(value.e1).to.eq('new value');
        return done();
      });
      return element.set('new value');
    });
  });
  return describe("#submit", function() {
    return it("should bubble submit from child elements", function(done) {
      var c1, c2, c3, e1;
      e1 = scalarFactory({
        name: 'e1'
      });
      c3 = collectionFactory({
        elements: [e1],
        name: "c3"
      });
      c2 = collectionFactory({
        elements: [c3],
        name: "c2"
      });
      c1 = collectionFactory({
        elements: [c2],
        name: "c1"
      });
      c1.on("submit", function(event, value) {
        return done();
      });
      return e1.submit();
    });
  });
});

var assert, expect, scalarFactory;

assert = expect = chai.expect;

scalarFactory = function(options) {
  var defaultOptions;
  if (options == null) {
    options = {};
  }
  defaultOptions = {
    value: 'Frankie',
    template: '{element:value}'
  };
  options = $.extend(defaultOptions, options);
  return new JsonInterfaces.elements.ScalarElement(options);
};

describe("JsonInterfaces.elements.ScalarElement", function() {
  describe("#render", function() {
    return it("renders a template into a jquery element", function() {
      var div, element;
      element = scalarFactory({
        name: 'e1'
      });
      div = $('div');
      element.render(div);
      return expect(div.html()).to.have.string('Frankie');
    });
  });
  describe("data binding", function() {
    it("updates the DOM when the value changes", function() {
      var div, element;
      element = scalarFactory({
        name: 'e1'
      });
      div = $('div');
      element.render(div);
      expect(div.html()).to.have.string('Frankie');
      element.set("Chelsea");
      return expect(div.html()).to.have.string('Chelsea');
    });
    it("updates the model when the DOM changes", function() {
      var div, element;
      element = scalarFactory({
        name: 'e1',
        template: JsonInterfaces.templates.textfield
      });
      div = $('div');
      element.render(div);
      element.set("Chelsea");
      expect(element.get()).to.eq('Chelsea');
      $('input', element.options.$el).val('Frankie').trigger('change');
      return expect(element.get()).to.eq('Frankie');
    });
    return it("binds the element name and id", function() {
      var div, element, html;
      element = scalarFactory({
        name: 'e1',
        id: 'random-id',
        template: JsonInterfaces.templates.textfield
      });
      div = $('div');
      element.render(div);
      html = div.html();
      expect(html).to.have.string('name="e1"');
      return expect(html).to.have.string('id="random-id"');
    });
  });
  return describe("events", function() {
    it("fires change event for keypath", function(done) {
      var element;
      element = scalarFactory({
        name: 'e1'
      });
      element.on("change:value", function() {
        return done();
      });
      return element.set("testing");
    });
    it("fires change event for any change", function(done) {
      var element;
      element = scalarFactory({
        name: 'e1'
      });
      element.on("change", function() {
        return done();
      });
      return element.set("testing");
    });
    it("does not fire change when set value is the same", function() {
      var element;
      element = scalarFactory({
        name: 'e1'
      });
      element.on("change", function() {
        throw new Error('This should not be called!');
      });
      return element.set("Frankie");
    });
    return it("fires change event on element object when DOM changes", function(done) {
      var div, element;
      element = scalarFactory({
        name: 'e1',
        template: JsonInterfaces.templates.textfield
      });
      div = $('div');
      element.render(div);
      element.set("Chelsea");
      expect(element.get()).to.eq('Chelsea');
      element.on("change", function() {
        return done();
      });
      $('input', element.options.$el).val('Frankie').trigger('change');
      return expect(element.get()).to.eq('Frankie');
    });
  });
});
