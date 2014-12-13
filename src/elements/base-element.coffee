# this class is kind of a mixin for common code between ScalarElement and CollectionElement

class JsonInterfaces.elements.BaseElement

  isValid: (done)->
    @getErrors (errors)=>
      done(errors.length is 0)

  conditionMet: (done)->
    done = done || ->

    unless @options.condition
      @show = true
      return done(true)

    @options.condition.call @, @get(), @options.parentElement, (result)=>
      @show = result
      done(result)

  on: (eventName, cb)->
    $(@).on eventName, cb

  off: (eventName, cb)->
    $(@).off eventName, cb

  clearErrors: ->
    @errors = []

  valueOrDefault: ->
    @get() || @defaultValue()

  setParent: (parent)->
    @options.parentElement = parent

    #check the condition of the everything is setup
    parent.on 'initialized', =>
      @conditionMet()

    #check the condition after the parent has changed
    parent.on 'change', =>
      @conditionMet()

  getName: ->
    @options.name

  # getElName: ->
  #   @options.name

  # getElId: ->
  #   @options.id || @getElName()

  getElName: ->
    return @options.name unless @options.parentElement
    namespaced = @options.parentElement.getName() + '[' + @options.name + ']'

    if @options.parentElement and @options.namespace
      return namespaced

    if @options.parentElement and @options.parentElement.isTop()
      return @options.name

    return namespaced

  getElId: ->
    id = @options.id || @options.name
    return id unless @options.parentElement
    namespaced = @options.parentElement.getName() + '-' + id

    if @options.parentElement and @options.namespace
      return namespaced

    if @options.parentElement and @options.parentElement.isTop()
      return id

    return namespaced