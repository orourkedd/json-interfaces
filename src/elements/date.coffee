class JsonInterfaces.elements.DateField extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.date unless options.template

    options.validators.push (value, parentElement, done)->
      return done() unless value
      done("Please enter a valid date." unless validator.isDate(value))

    super options