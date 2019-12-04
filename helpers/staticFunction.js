
/**
 * converts a callexpression like `isObject` into the native equivalent, defined with `obj` and `fn`.
 * 
 * Example:
 * obj = 'Object'
 * fn = 'isObject'
 * 
 * results in `Object.isObject(...)` with the args kept the same.
 */
module.exports = (obj, fn) => j => callExpression => {
  const args = callExpression.value.arguments;

  j(callExpression).replaceWith(
    j.callExpression(j.memberExpression(j.identifier(obj), j.identifier(fn)), args)
  );
};
