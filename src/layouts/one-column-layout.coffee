class JsonInterfaces.layouts.OneColumnLayout

  constructor: (options)->
    @options = options
    throw new Error('fields required') unless @options.element.getElements()
    @elements = @options.element.getElements()

    if @options.element.isTop()
      @options.template = JsonInterfaces.templates.oneColumnLayout unless @options.template
    else
      @options.template = JsonInterfaces.templates.oneColumnLayoutParent unless @options.template

    @errors = []

  elementsEl: ->
    $('.one-column-layout > .elements', @options.$el)

  clearErrors: ->
    @errors = []

  addError: (message)->
    @errors.push message

  render: ($el)->
    @options.$el = $el if $el
    throw new Error('@options.$el not set') unless @options.$el
    template = if typeof @options.template is 'function' then @options.template() else @options.template
    @options.$el.html(template)

    @view = rivets.bind(@options.$el, {
      layout: @
    })

    #add all the fields to the layout
    for name,element of @elements
      $el = $('<div></div>').appendTo(@elementsEl())
      element.render($el)

    if @options.element.isTop()
      $('.one-column-layout', @options.$el).on 'submit', (e)=>
        e.preventDefault()
        @options.element.submit()

  close: ->
    @view.unbind() if @view

    #close all fields
    for element in @elements
      element.close()

    #empty the parent element
    @options.$el.empty()