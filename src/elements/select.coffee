class JsonInterfaces.elements.Select extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options.template = JsonInterfaces.templates.select unless options.template

    if options.range
      options.options = @processRangeOptions(options)
    else
      options.options = @processOptions(options.options)

    if options.placeholder
      options.options.unshift
        label: options.placeholder
        value: null

    super options

    $(@).on "errors", (event, errors)=>
      if errors.length
        @select().addClass('error')
      else
        @select().removeClass('error')
      #@select()[unless errors then 'addClass' else 'removeClass']('error')

  select: ->
    throw new Error('@options.$el is required') unless @options.$el
    $('select', @options.$el)

  processRangeOptions: (options)->
    throw new Error('No range options') unless options.range
    rangeValues = []
    start = options.start || 0
    for i in [options.range[0]..options.range[1]]
      rangeValues.push {value: i + start, label: i + start}

    return if options.reverse then rangeValues.reverse() else rangeValues

  processOptions: (options)->
    return options if $.isArray(options)
    processed = []

    if typeof options is "string"
      sets = options.split(',')
      for set in sets
        [label,value] = set.split(':')
        processed.push
          label: label
          value: value
      return processed

    for value, label of options
      processed.push
        label: label
        value: value

    processed