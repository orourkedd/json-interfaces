class JsonInterfaces.elements.Address extends JsonInterfaces.elements.CollectionElement

  constructor: (options)->
    options.layout = JsonInterfaces.layouts.TemplateLayout unless options.layout
    options.template = JsonInterfaces.templates.address unless options.template
    options.elements = @buildAddressElements(options.elements)
    super options

  buildAddressElements: (elements = {})->
    options = $.extend
      address:
        label: "Street Address"
        required: true
      city:
        label: "City"
        required: true
      state:
        type: JsonInterfaces.elements.State
        required: true
      zip:
        label: "Zip"
        required: true
      , elements

    JsonInterfaces.Factory.buildElements(options)