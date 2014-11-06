class JsonInterfaces.elements.Textarea extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.textarea unless options.template
    super options

  input: ->
    $('textarea', @options.$el)