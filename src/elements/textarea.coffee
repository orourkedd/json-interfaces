class JsonInterfaces.elements.Textarea extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options.template = JsonInterfaces.templates.textarea unless options.template
    super options