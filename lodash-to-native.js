const isLodashModuleImport = node =>
  node.type === "ImportDeclaration" && node.source.value.startsWith("lodash/");

const transforms = {
  each: require("./helpers/nativeWithCallback")("forEach"),
  forEach: require("./helpers/nativeWithCallback")("forEach"),
  find: require("./helpers/nativeWithCallback")("find"),
  findIndex: require("./helpers/nativeWithCallback")("findIndex"),
  map: require("./helpers/nativeWithCallback")("map"),
  collect: require("./helpers/nativeWithCallback")("map"),
  filter: require("./helpers/nativeWithCallback")("filter"),
  select: require("./helpers/nativeWithCallback")("filter"),
  every: require("./helpers/nativeWithCallback")("every"),
  some: require("./helpers/nativeWithCallback")("some"),
  find: require("./helpers/nativeWithCallback")("find"),
  detect: require("./helpers/nativeWithCallback")("find"),
  contains: require("./helpers/native")("includes"),
  includes: require("./helpers/native")("includes"),
  upperCase: require("./helpers/native")("toUpperCase"),
  lowerCase: require("./helpers/native")("toLowerCase"),
  reduce: require("./helpers/nativeWithCallback")("reduce"),
  inject: require("./helpers/nativeWithCallback")("reduce"),
  indexOf: require("./helpers/native")("indexOf"),
  lastIndexOf: require("./helpers/native")("lastIndexOf"),
  isUndefined: require("./helpers/binaryExpression")("undefined"),
  isNull: require("./helpers/binaryExpression")("null"),
  isNaN: require("./helpers/staticFunction")("Number", "isNaN"),
  isArray: require("./helpers/staticFunction")("Array", "isArray"),
  isObject: require("./helpers/staticFunction")("Object", "isObject")
};

module.exports = function(fileInfo, { jscodeshift: j }, argOptions) {
  const ast = j(fileInfo.source);

  // Cache opening comments/position
  const { comments, loc } = ast.find(j.Program).get("body", 0).node;

  ast
    .find(j.ImportDeclaration, isLodashModuleImport)
    .forEach(lodashModuleImportStatement => {
      const lodashModule = lodashModuleImportStatement.node.source.value.replace(
        "lodash/",
        ""
      );

      const i = j(lodashModuleImportStatement);

      i.find(j.ImportDefaultSpecifier).forEach(defaultImport => {
        const localName = defaultImport.node.local.name;

        if (transforms.hasOwnProperty(lodashModule)) {
          const transformer = transforms[lodashModule](j);

          ast
            .find(j.CallExpression, { callee: { name: localName } })
            .forEach(transformer);

          // it may happen that a transformation bails,
          // in that case the import would not be unused and couldn't get removed
          const isUnused =
            ast.find(j.CallExpression, { callee: { name: localName } })
              .length === 0;

          if (isUnused) {
            i.remove();
          }
        }
      });
    });

  // Restore opening comments/position
  Object.assign(ast.find(j.Program).get("body", 0).node, { comments, loc });

  return ast.toSource({
    arrowParensAlways: true,
    quote: "single"
  });
};
