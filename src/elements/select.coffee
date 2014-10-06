class JsonInterfaces.elements.Select extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options.template = JsonInterfaces.templates.select unless options.template
    options.options = @processOptions(options.options, options.placeholder)
    super options

    $(@).on "errors", (event, errors)=>
      if errors
        @select().addClass('error')
      else
        @select().removeClass('error')
      #@select()[unless errors then 'addClass' else 'removeClass']('error')

  select: ->
    $('select', @options.$el)

  processOptions: (options, placeholder)->
    if $.isArray(options)
      if placeholder
        options.unshift
          label: placeholder
          value: null
      return options

    processed = []
    for value, label of options
      processed.push
        label: label
        value: value

    if placeholder
      processed.unshift
        label: placeholder
        value: null

    processed