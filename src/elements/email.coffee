class JsonInterfaces.elements.Email extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.email unless options.template

    options.validators ||= []
    options.validators.push (value, parentElement, done)->
      done("Valid email required." unless validator.isEmail(value))

    super options