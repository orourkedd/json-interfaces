class JsonInterfaces.elements.ScalarElement extends JsonInterfaces.elements.BaseElement

  constructor: (options = {})->
    @errors = []
    @value = {}
    @isScalar = true

    options.validators = options.validators || []

    throw new Error('name required') unless options.name

    @options = options
    if @options.value
      @set options.value, undefined,
        events: false
        validate: false

    #revalidate on change if errors are present
    $(@).on 'change', =>
      @validate() if @errors.length > 0

  clear: ->
    @set @defaultValue()

  submit: ->
    if @options.parentElement
      $(@).triggerHandler 'submit', [@get()]
    else
      @validate (errors)=>
        $(@).triggerHandler('submit', [@get()]) if errors.length is 0

  defaultValue: ->
    @options.defaultValue || ''

  # The following are are valid ways to set the value for this element:
  # element.set((null|undefined|false|falseyValue))
  # element.set('someval')
  # element.set('value', 'someval')
  # element.set({value: 'someval'})
  set: (keypath, value, options = {})->
    value = @normalizeValueForSet(keypath, value)

    options = $.extend
      events: true
      validate: true
    , options

    existingValue = $.extend(true, {}, @value)

    #extend @value with any new values
    @value = $.extend(@value, value)

    #fire change events if the values have changed
    changed = false
    for i,v of @value
      continue if existingValue[i] is @value[i]
      $(@).trigger('change:' + i, [@value[i]]) if options.events
      changed = true unless changed

    #trigger change event if any properties have changed
    $(@).trigger('change', [@get()]) if changed and options.events

    #validate it
    @validate() unless options.validate

  normalizeValueForSet: (keypath, value)->
    # For: element.set({value: 'someval'})
    return keypath if $.isPlainObject(keypath)

    #kaypath is specific
    if keypath and typeof value is not 'undefined'
      obj = {}
      obj.keypath = value
      return obj

    # For: element.set((null|undefined|false|falseyValue))
    value: keypath

  setKeyPath: (keypath, value)->
    obj = {}
    obj[keypath] = value
    @set(obj)

  get: (keypath = 'value')->
    @value[keypath]

  render: ($el)->
    @options.$el = $el if $el

    #get template from function if provided
    template = if typeof @options.template is 'function' then @options.template() else @options.template
    @options.$el.html(template)
    @bindRivets()
    @afterRender()

  afterRender: ->
    @conditionMet() unless @options.parentElement

  bindRivets: ->
    @view = rivets.bind(@options.$el, {
      options: @options
      element: @
    })

  close: ->
    @view.unbind()
    @view = null
    @options.$el.empty() if @options.$el
    $(@).off()

  getErrors: (callback)->
    if @noValue
      return callback.call(@, [])

    if @options.validators.length > 0
      validatorCallbacks = []
      for validator in @options.validators
        validatorCallback = ((validator)=>
          (asyncCallback)=>
            validator.call @, @get(), @options.parentElement, (results)=>
              if results instanceof Array
                return asyncCallback(null, results)
              else if results
                return asyncCallback(null, [results])
              else
                return asyncCallback(null, [])
        )(validator)

        validatorCallbacks.push validatorCallback

      @errors = []
      async.parallel validatorCallbacks, (err, results)=>
        for result in results
          @errors = @errors.concat(result)

        $(@).triggerHandler 'errors', [@errors || []]
        callback.call(@, @errors)
    else
      $(@).triggerHandler 'errors', [[]]
      callback.call(@, [])

  validate: (done)->
    @conditionMet (result)=>
      return unless result
      @getErrors (errors)=>
        $(@).triggerHandler 'validate', [errors || []]
        done(errors) if typeof done is 'function'