assert = expect = chai.expect

scalarFactory = (options = {})->
  defaultOptions =
    value: 'Frankie'
    template: '{element:value}'

  options = $.extend(defaultOptions, options)

  new JsonInterfaces.elements.ScalarElement options

describe 'JsonInterfaces.elements.ScalarElement', ->
  describe '#render', ->
    it 'renders a template into a jquery element', ->
      element = scalarFactory(name: 'e1')
      div = $('div')
      element.render(div)
      expect(div.html()).to.have.string('Frankie')

  describe 'data binding', ->
    it 'updates the DOM when the value changes', ->
      element = scalarFactory(name: 'e1')
      div = $('div')
      element.render(div)
      expect(div.html()).to.have.string('Frankie')
      element.set 'Chelsea'
      expect(div.html()).to.have.string('Chelsea')

    it 'updates the model when the DOM changes', ->
      element = scalarFactory
        name: 'e1'
        template: JsonInterfaces.templates.textfield

      div = $('div')
      element.render(div)
      element.set 'Chelsea'
      expect(element.get()).to.eq('Chelsea')
      #manually trigger change event to let rivets know what's going on
      $('input', element.options.$el).val('Frankie').trigger('change')
      expect(element.get()).to.eq('Frankie')

    it 'binds the element name and id', ->
      element = scalarFactory
        name: 'e1'
        id: 'random-id'
        template: JsonInterfaces.templates.textfield

      div = $('div')
      element.render(div)
      html = div.html()

      expect(html).to.have.string('name="e1"')
      expect(html).to.have.string('id="random-id"')

  describe 'events', ->
    it 'fires change event for keypath', (done)->
      element = scalarFactory(name: 'e1')
      element.on 'change:value', ->
        done()

      element.set 'testing'

    it 'fires change event for any change', (done)->
      element = scalarFactory(name: 'e1')
      element.on 'change', ->
        done()

      element.set 'testing'

    it 'does not fire change when set value is the same', ->
      element = scalarFactory(name: 'e1')
      element.on 'change', ->
        throw new Error('This should not be called!')

      element.set 'Frankie'

    it 'fires change event on element object when DOM changes', (done)->
      element = scalarFactory
        name: 'e1'
        template: JsonInterfaces.templates.textfield

      div = $('div')
      element.render(div)
      element.set 'Chelsea'
      expect(element.get()).to.eq('Chelsea')

      element.on 'change', ->
        done()

      #manually trigger change event to let rivets know what's going on
      $('input', element.options.$el).val('Frankie').trigger('change')
      expect(element.get()).to.eq('Frankie')