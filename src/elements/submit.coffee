class JsonInterfaces.elements.Submit extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    @noValue = true

    options = $.extend
      template: JsonInterfaces.templates.submit
      name: "submit"
      value: "Submit"
      , options

    super options

  afterRender: ->
    @input().addClass(@options.classes)

  input: ->
    $('input', @options.$el)