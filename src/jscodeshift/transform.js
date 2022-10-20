import { findWrapperExpect, isRtlFnExists, buildRtlImport } from './utils';

const transformMountImport = (j, ast) => {
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
    .replaceWith(
      buildRtlImport(j, {
        imported: 'render',
        source: '@testing-library/react',
      })
    );
};

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
  const wrapperIdentifier = node.find(j.Identifier).get().node.name;

  node.replaceWith(j.expressionStatement(j.callExpression(j.identifier('render'), args)));

  return {
    wrapperIdentifier,
  };
};

const transformLinkTextExpect = (j, ast) => (path) => {
  console.log('isRtlFnExists', isRtlFnExists(j, ast, 'render'));
  j(path).replaceWith();
};

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

  transformMountImport(j, ast);
  const { wrapperIdentifier } = transformMountCall(j, ast);

  const node = findWrapperExpect(j, ast, { wrapperIdentifier });
  console.log('node!!', node.length);
  node.forEach(transformLinkTextExpect(j, ast));

  return ast.toSource({
    quote: 'single',
  });
};
