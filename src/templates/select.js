JsonInterfaces.templates.select = '<div class="form-group"><label rv-for="options.name" data-show="options.label">{options.label}</label><p data-show="options.help" class="help-block">{options.help}</p><select rv-name="element#getElName" rv-id="element#getElId" rv-value="element:value" class="form-control"><option rv-each-option="options.options" rv-value="option.value">{option.label}</option></select><div class="error-wrapper"><div rv-each-error="element.errors" class="error alert alert-danger shake animated">{error}</div></div></div>'