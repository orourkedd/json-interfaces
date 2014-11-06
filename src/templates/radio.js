JsonInterfaces.templates.radio = '<div rv-show="element.show" rv-class="options.classes" class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><label rv-each-option="options.options" class="radio-inline"><input type="radio" rv-name="element#getElName" rv-value="option.value" rv-checked="element:value"/><span>{option.label}</span></label><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>'