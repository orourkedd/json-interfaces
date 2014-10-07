class JsonInterfaces.elements.CollectionElement extends JsonInterfaces.elements.BaseElement

  constructor: (options = {})->
    @errors = []
    @errorsKeyed = {}
    @value = {}
    @elements = []

    throw new Error('name required') unless options.name

    #set a default template
    options.layout = JsonInterfaces.layouts.OneColumnLayout unless options.layout
    options.elements = JsonInterfaces.Factory.buildElements(options.elements)

    @options = options

    #Add elements
    @addElements(@options.elements)

    # update all elements initially
    # do not fire change events
    if options.value
      @set options.value, undefined,
        updateAll: true
        events: false

    $(@).triggerHandler "initialized"

  addElements: (elements)->
    for element in elements
      throw new Error("Invalid Element: " + element) unless element
      @addElement(element)

  addElement: (element)->
    #add it to array of elements
    @elements.push(element)

    #Set parent
    element.setParent(@)

    #Get initial value from element
    @getInitialValueFromElement(element) unless element.noValue

    #Submit listener
    element.on "submit", =>
      @submit()

    #listen for validation, mostly for smart error message updating (ie not having to revalidate the entire form when
    #a single field changes)
    element.on "validate", (event, errors)=>
      @errorsKeyed[element.getName()] = errors
      @errors = @createErrorArray(@errorsKeyed)
      $(@).triggerHandler("validate", [@errors || [], @errorsKeyed || {}])

    #update value of element change
    unless element.noValue
      element.on "change", (event, value)=>
        return if @ignoreElementChangeEvents
        @set element.getName(), value

    #trigger elementAdded event for the layout or any other listening object
    $(@).triggerHandler "elementAdded", [element]

  getInitialValueFromElement: (element)->
    @value[element.getName()] = element.valueOrDefault()

  submit: ->
    if @options.parentElement
      $(@).triggerHandler "submit"
    else
      @validate (errors)=>
        $(@).triggerHandler("submit", [@value]) if errors.length is 0

  defaultValue: ->
    @options.defaultValue || {}

  # The following are are valid ways to set the value for this element:
  # element.set("key", "value")
  # element.set({key: "value"})
  set: (keypath, value, options = {})->
    options = $.extend
      updateAll: false
      events: true
    , options

    throw new Error('At least 1 argument required') unless keypath

    #Make sure that an object is being passed in for the value
    throw new Error('value must be an object') if typeof value is "undefined" and !$.isPlainObject(keypath)

    # For: element.set(keypath, "someval")
    # this could be used to set other values on @value.  Could be used for something.
    # keypath is defined, value is defined
    return @setKeyPath(keypath, value) unless typeof value is "undefined"

    # For: element.set({value: "someval"})
    value = keypath

    existingValue = $.extend(true, {}, @value)

    #extend @value with any new values
    @value = $.extend(@value, value)
    #fire change events if the values have changed
    changed = false

    @ignoreElementChangeEvents = true
    for i,v of @value
      continue if existingValue[i] is @value[i] and not options.updateAll
      changed = true

      element = @getElement(i)

      if element
        #if this value has changed, set it on the element
        @setValueOnElement(i, v)

        $(@).trigger("change:" + i, [v, element]) if options.events

    @ignoreElementChangeEvents = false

    #trigger change event if any properties have changed
    $(@).trigger("change", [@value]) if changed and options.events

  setKeyPath: (keypath, value)->
    obj = {}
    obj[keypath] = value
    @set(obj)

  setValueOnElement: (key, value)->
    element = @getElement(key)
    return if element.noValue
    element.set(value)

  getElement: (name)->
    for element in @elements
      return element if element.getName() is name

    null

  getElements: ->
    @elements

  get: (keypath)->
    if keypath then @value[keypath] else @value

  render: ($el)->
    @options.$el = $el if $el
    template = if typeof @options.template is "function" then @options.template() else @options.template
    @layout = new @options.layout
      element: @
      template: template

    @layout.render(@options.$el)

  close: ->
    $(@).off()

  getErrors: (callback)->
    validators = []

    for element in @elements
      continue if element.noValue
      validators.push ((element)->
        (callback)->
          #do not run validation if this element is "disabled" via its conditional
          element.conditionMet (result)->
            keyed = {}
            keyed[element.getName()] = null
            return callback(null, keyed) if result is false
            element.getErrors (elementErrors)->
              keyed[element.getName()] = elementErrors || []
              callback(null, keyed)
      )(element)

    @errors = []
    @errorsKeyed = {}
    async.parallel validators, (err, results)=>
      flattened = {}
      for error in results
        flattened = $.extend(flattened, error)

      @errorsKeyed = flattened
      @errors = @createErrorArray(@errorsKeyed)
      callback.call(@, @errors)

  createErrorArray: (errorsKeyed)->
    errors = []
    for name,elementErrors of errorsKeyed
      for error in (elementErrors || [])
        errors.push error
    errors

  clearErrors: ->
    super()
    @errorsKeyed = {}

  validate: (done)->
    @conditionMet (result)=>
      return if result is false
      @getErrors =>
        $(@).triggerHandler("validate", [@errors || [], @errorsKeyed || {}])
        done.call(@, @errors) if typeof done is "function"