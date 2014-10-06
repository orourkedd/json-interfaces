class JsonInterfaces.elements.Textfield extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options.template = JsonInterfaces.templates.textfield unless options.template
    super options

    $(@).on "errors", (event, errors)=>
      console.log errors
      @input()[if errors.length then 'addClass' else 'removeClass']('error')

  input: ->
    $('input', @options.$el)