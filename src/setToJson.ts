// This module could be written as a polyfil to replace the native JSON.* utils, but wasn't for sake of the example

//@ts-ignore
function parseJSONWithSets(json, reviver = null) {
  //@ts-ignore
  function transformToSet(obj) {
    if (obj && obj.__type === "Set" && Array.isArray(obj.values)) {
      return new Set(obj.values);
    } else if (Array.isArray(obj)) {
      return obj.map(transformToSet);
    } else if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        obj[key] = transformToSet(obj[key]);
      });
    }
    return obj;
  }

  //@ts-ignore
  const parsed = JSON.parse(json, reviver);
  return transformToSet(parsed);
}

// Complementary stringify function
//@ts-ignore
function stringifyWithSets(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (value instanceof Set) {
      return {
        __type: "Set",
        values: Array.from(value),
      };
    }
    return value;
  });
}

export default {
  parse: parseJSONWithSets,
  stringify: stringifyWithSets,
} as typeof JSON;
