const transformMountImport = (j, ast) =>
  ast
    .find(j.ImportDeclaration, {
      specifiers: [
        {
          imported: {
            name: 'mount',
          },
        },
      ],
      source: {
        value: 'enzyme',
      },
    })
    .replaceWith(`import { render } from '@testing-library/react';`);

const transformMountCall = (j, ast) => {
  const node = ast.find(j.VariableDeclaration, {
    declarations: [
      {
        init: {
          callee: {
            name: 'mount',
          },
        },
      },
    ],
  });
  const args = node.find(j.CallExpression).get().node.arguments;
  node.replaceWith(j.expressionStatement(j.callExpression(j.identifier('render'), args)));
};

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

  transformMountImport(j, ast);
  transformMountCall(j, ast);

  return ast.toSource();
};
