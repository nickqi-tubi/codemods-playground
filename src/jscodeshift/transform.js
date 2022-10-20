export const parser = 'tsx';

const isMountVariableDeclaration = (node) => {
  const { init } = node.declarations[0];
  return init.type === 'CallExpression' && init.callee.name === 'mount';
};

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

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

  // const mountNode = ast.find(j.VariableDeclaration, {
  //   init: {
  //     callee: {
  //       name: 'mount',
  //     },
  //   },
  // });
  const mountVariableDeclaration = ast.find(j.VariableDeclaration, isMountVariableDeclaration);
  const args = mountVariableDeclaration.find(j.CallExpression).get().node.arguments;
  mountVariableDeclaration.replaceWith(j.expressionStatement(j.callExpression(j.identifier('render'), args)));

  //ast
  //   .find(j.CallExpression, {
  //     callee: {
  //       name: 'mount',
  //     },
  //   })
  //   .forEach((path) => {
  //     path.get('callee').replace('render');
  //   });

  return ast.toSource();
};
