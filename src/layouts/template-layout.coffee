class JsonInterfaces.layouts.TemplateLayout

  constructor: (options)->
    @options = options
    throw new Error('element required') unless @options.element
    throw new Error('template required') if typeof @options.template is "undefined"
    @elements = @options.element.elements

  render: ($el)->
    #@options.element.on "validate", (event, errors)=>
    #  @errors = errors

    @options.$el = $el if $el
    throw new Error('@options.$el not set') unless @options.$el
    template = if typeof @options.template is "function" then @options.template() else @options.template
    @options.$el.html(template)

    @view = rivets.bind(@options.$el, {
      layout: @
      element: @options.element
    })

    #add all the fields to the layout
    for element in @elements
      element.render( $("#" + @toSnakeCase(element.getName()) + "-region", @options.$el) )

    $("form", @options.$el).on "submit", (e)=>
      e.preventDefault()
      @options.element.submit()

  toSnakeCase: (str)->
    str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

  close: ->
    @view.unbind() if @view

    #close all fields
    for element in @elements
      element.close()

    #empty the parent element
    @options.$el.empty()