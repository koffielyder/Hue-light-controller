const rules = {
  defaultValue: (key, values, defaultVar) => {
    if (values[key] === null || values[key] === undefined) values[key] = defaultVar;
    return values[key];
  },
    required: (key, values, isRequired = true) => {
      if (!isRequired || !(values[key] === null || values[key] === undefined)) return values[key];
      throw new Error(key + " is required")
    },
    type: (key, values, requiredType) => {
      const dataType = typeof values[key];
      if (dataType == requiredType) return values[key];
      throw new Error(`Expected type ${requiredType} for key ${key}, but received ${dataType}`);
    },
  }

  module.exports = {
    validate: (values, validateRules, throwError = true) => {
      const validated = {};
      for (let key in validateRules) {
        if (validateRules.hasOwnProperty(key)) {
          // Ensures the property is not inherited
          const rule = validateRules[key];
          for (let ruleKey in rules) {
            try {
              if (rule[ruleKey] !== undefined) validated[key] = rules[ruleKey](key, values, rule[ruleKey]);
            } catch (error) {
              console.error(error.message);
              if (throwError) throw error;
            }
          }
        }
      }
      return validated;
    }
  }