module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  return j(fileInfo.source)
    .find(j.CallExpression, {
      callee: { name: "setMessage" },
      arguments: [{ type: "Literal" }],
    })
    .forEach(path => {
      path.node.arguments[0] = j.callExpression(
        j.identifier("t"),
        [path.node.arguments[0]]
      );
    })
    .toSource();
};
