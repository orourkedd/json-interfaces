class JsonInterfaces.elements.Radio extends JsonInterfaces.elements.ScalarElement

  constructor: (options = {})->
    options = $.extend
      template: JsonInterfaces.templates.radio
      options: @processOptions(options.options)
      , options

    super options

  processOptions: (options, placeholder)->
    return options if $.isArray(options)

    processed = []
    for value, label of options
      processed.push
        label: label
        value: value
    processed