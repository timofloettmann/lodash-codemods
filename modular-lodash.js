const isLodashDefaultImport = node =>
  node.type === "ImportDeclaration" && node.source.value === "lodash";

// scoping imported function names to be lodash specific, in order to avoid import conflicts...
const generateFunctionName = name =>
  `lodash${name.charAt(0).toUpperCase() + name.slice(1)}`;

module.exports = function(fileInfo, { jscodeshift: j }, argOptions) {
  const ast = j(fileInfo.source);

  // Cache opening comments/position
  const { comments, loc } = ast.find(j.Program).get("body", 0).node;

  const defaultImports = ast.find(j.ImportDeclaration, isLodashDefaultImport);
  defaultImports.find(j.ImportDefaultSpecifier).forEach(importNode => {
    const localName = importNode.node.local.name;

    const memberExpressions = ast.find(
      j.MemberExpression,
      ({ object: { name } }) => name === localName
    );

    memberExpressions.forEach(expression => {
      // the current expression is a MemberExpression,
      // but the parent CallExpression is the one that needs to be replaced.
      j(expression.parentPath).replaceWith(
        j.callExpression(
          j.identifier(generateFunctionName(expression.value.property.name)),
          expression.parentPath.value.arguments
        )
      );
    });

    const targetNode = j(importNode).closest(j.ImportDeclaration);

    let functionNames = [];

    memberExpressions.forEach(expression => {
      const fn = expression.value.property.name;

      if (functionNames.includes(fn)) {
        // avoid duplicate imports by keeping track of lodash functions
        // that have already been imported in the current file.
        return;
      }

      // this adds a new import statement for every used lodash module
      targetNode.insertBefore(
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(generateFunctionName(fn)))],
          j.literal(`lodash/${fn}`)
        )
      );

      functionNames.push(fn);
    });

    // remove the original lodash default import statement
    targetNode.remove();
  });

  // Restore opening comments/position
  Object.assign(ast.find(j.Program).get("body", 0).node, { comments, loc });

  return ast.toSource({
    arrowParensAlways: true,
    quote: "single"
  });
};
