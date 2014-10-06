class JsonInterfaces.elements.Html extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    @noValue = true
    super options

  #override render
  render: ($el)->
    @options.$el = $el if $el
    @options.$el.html(@options.html)