class JsonInterfaces.elements.Address extends JsonInterfaces.elements.CollectionElement

  constructor: (options)->
    options.layout = JsonInterfaces.layouts.TemplateLayout unless options.layout
    options.template = JsonInterfaces.templates.address unless options.template
    options.elements = @buildAddressElements(options, options.elements)
    super options

  buildAddressElements: (options, elements = {})->
    options = $.extend
      address:
        label: "Street Address"
        required: options.required
      city:
        label: "City"
        required: options.required
      state:
        type: JsonInterfaces.elements.State
        required: options.required
      zip:
        label: "Zip"
        required: options.required
      , elements

    JsonInterfaces.Factory.buildElements(options)