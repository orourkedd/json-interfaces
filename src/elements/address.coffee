class JsonInterfaces.elements.Address extends JsonInterfaces.elements.CollectionElement

  constructor: (options)->
    options.layout = JsonInterfaces.layouts.TemplateLayout unless options.layout
    options.template = JsonInterfaces.templates.address unless options.template
    options.elements = @buildAddressElements(options, options.elements)
    super options

  buildAddressElements: (options, elements = {})->
    
    defaults =
      address1:
        label: 'Address'
        required: options.required
      address2:
        label: 'Address Line 2'
      city:
        label: 'City'
        required: options.required
      state:
        type: JsonInterfaces.elements.State
        required: options.required
      zip:
        label: 'Zip'
        required: options.required

    options = $.extend defaults, elements

    JsonInterfaces.Factory.buildElements(options)