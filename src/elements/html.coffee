class JsonInterfaces.elements.Html extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    @noValue = true
    super options

  #@override
  render: ($el)->
    @options.$el = $el if $el

    #get template from function if provided
    template = "<div rv-show='element.show'>#{@options.html}</div>"
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