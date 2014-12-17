class JsonInterfaces.Factory

  @build: (options)->
    defaults =
      type: JsonInterfaces.elements.CollectionElement
      elements: []

    options = $.extend(defaults, options)
    options.elements = @buildElements(options.elements)
    type = @getType(options.type)
    delete options.type

    #return the element
    new type(options)

  @buildElements: (options)->
    if $.isArray(options)
      elements = []
      for elementOptions in options
        elements.push @buildElement(elementOptions)
      return elements

    if $.isPlainObject(options)
      elements = []
      for name, config of options
        if $.isPlainObject(config) #normal json config object
          config.name = name
          elements.push @buildElement(config)
        else if typeof config is 'string'
          config =
            name: name
            type: @getType(config)
          elements.push @buildElement(config)
        else if typeof config is 'function' #when a constructor function is passed in
          elementClass = config
          config =
            name: name
            type: elementClass
          elements.push @buildElement(config)
        else #already instantiated element
          elements.push config

      return elements

    throw new Error('Config must be an array or a json object.')

  @buildElement: (elementOptions)->
    #if the element is already initialized
    return elementOptions unless $.isPlainObject(elementOptions)

    type = @getType(elementOptions.type)
    delete elementOptions.type
    elementOptions.validators = @processValidators(elementOptions)
    elementOptions.condition = @processCondition(elementOptions.condition)

    new type(elementOptions)

  @processValidators: (options)->
    validators = []
    #normalize validation to an array
    if typeof options.validators is 'function'
      validators = [options.validators]
    else if not options.validators
      validators = []

    return validators unless options.required

    #set up some shorthand for required: true
    message = if options.required is true then (options.label || 'This field') + ' is required.' else options.required
    #validation with conditionals

    validators.push (value, parentElement, done)=>
      done(message if (value is '' or value is null or value is undefined))

    validators

  @processCondition: (condition = false)->
    return condition unless condition
    return condition if typeof condition is 'function'

    if $.isPlainObject(condition)
      for name,checkValue of condition
        return ((value, parentElement, done)->
          element = parentElement.getElement(name)
          return done(false) unless element
          done(element.get() is checkValue)
        )

    false

  @getType: (type)->
    return JsonInterfaces.elements[type] if typeof type is 'string' and JsonInterfaces.elements[type]
    type || JsonInterfaces.elements.Textfield