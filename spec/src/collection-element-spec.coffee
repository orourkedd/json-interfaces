assert = expect = chai.expect

print = (obj)->
  seen = []
  JSON.stringify obj, (key, val)->
    if (val != null && typeof val == "object")
      return if (seen.indexOf(val) >= 0)
      seen.push(val)
    val

scalarFactory = (options = {})->
  defaultOptions =
    value:
      name: 'Frankie'
    template: '{element:value}'

  options = $.extend(defaultOptions, options)

  new JsonInterfaces.elements.ScalarElement(options)

collectionFactory = (options = {})->
  defaultOptions =
    name: 'testCollection'
    elements: []

  options = $.extend(defaultOptions, options)

  new JsonInterfaces.elements.CollectionElement(options)

describe "JsonInterfaces.elements.CollectionElement", ->
  describe "#set", ->

    it "value on construction", ->
      element = scalarFactory
        name: 'e1'

      collection = collectionFactory
        elements: [element]
        value:
          e1: "test"

      expect(element.get()).to.eq 'test'

    it "updates child elements", ->
      element = scalarFactory
        name: 'e1'

      collection = collectionFactory
        elements: [element]

      collection.set('e1', 'test1')
      expect(element.get()).to.eq 'test1'

      collection.set
        e1: 'test2'
      expect(element.get()).to.eq 'test2'

    it "throws exception if given scalar", ->
      collection = collectionFactory()

      fn = ->
        collection.set('e1')

      expect(fn).to.throw()

    it "fires change events for changed properties", (done)->
      element = scalarFactory
        name: 'e1'

      collection = collectionFactory
        elements: [element]

      collection.on "change:e1", (event, value, element)->
        expect(value).to.eq 'test'
        done()

      collection.set 'e1', 'test'

    it "fires single change event for all changed properties", (done)->
      element = scalarFactory
        name: 'e1'

      collection = collectionFactory
        elements: [element]

      collection.on "change", (event, value)->
        expect(value.e1).to.eq 'test'
        done()

      collection.set 'e1', 'test'

    it "fires change event when child element changes", (done)->
      element = scalarFactory
        name: 'e1'

      collection = collectionFactory
        elements: [element]

      collection.on "change", (e, value, v)->
        expect(value.e1).to.eq 'new value'
        done()

      element.set 'new value'

  describe "#submit", ->
    it "should bubble submit from child elements", (done)->
      e1 = scalarFactory
        name: 'e1'

      c3 = collectionFactory
        elements: [e1]
        name: "c3"

      c2 = collectionFactory
        elements: [c3]
        name: "c2"

      c1 = collectionFactory
        elements: [c2]
        name: "c1"

      c1.on "submit", (event, value)->
        done()

      e1.submit()