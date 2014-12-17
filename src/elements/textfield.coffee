class JsonInterfaces.elements.Textfield extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options.template = JsonInterfaces.templates.textfield unless options.template
    super options

    $(@).on 'errors', (event, errors)=>
      @input()[if errors.length then 'addClass' else 'removeClass']('error')

  input: ->
    $('input', @options.$el)

  afterRender: ->
    super
    @options.$el.addClass(@options.classes)

    if @options.instantChange
      @input().on 'keyup', (e)=>
        @set $(e.currentTarget).val()