class JsonInterfaces.elements.Date extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.date unless options.template

    options.validators.push (value, parentElement, done)->
      done("Please enter a valid date." unless validator.isDate(value))

    super options