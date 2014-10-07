class JsonInterfaces.elements.Radio extends JsonInterfaces.elements.ScalarElement

  constructor: (options = {})->
    defaults =
      template: JsonInterfaces.templates.radio

    options = $.extend defaults, options
    options.options = @processOptions(options, options.options)

    super options

  processOptions: (elementOptions, options, placeholder)->
    if elementOptions.boolean is true
      return [
        label: 'Yes'
        value: 1
      ,
        label: 'No'
        value: 0
      ]

    return options if $.isArray(options)

    if typeof options is "string"
      processed = []
      sets = options.split(',')
      for set in sets
        [label,value] = set.split(':')
        processed.push
          label: label
          value: value
      return processed

    processed = []
    for value, label of options
      processed.push
        label: label
        value: value
    processed