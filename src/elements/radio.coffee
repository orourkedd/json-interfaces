class JsonInterfaces.elements.Radio extends JsonInterfaces.elements.ScalarElement

  constructor: (options = {})->
    defaults =
      template: JsonInterfaces.templates.radio

    options = $.extend defaults, options
    options.options = @processOptions(options, options.options)

    super options

  normalizeValueForSet: (keypath, value)->
    value = super(keypath, value)
    if @options.boolean
      value.value = if value.value is "true" then true else false
    value

  processOptions: (elementOptions, options, placeholder)->
    if elementOptions.boolean is true
      return [
        label: 'Yes'
        value: 'true'
      ,
        label: 'No'
        value: 'false'
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