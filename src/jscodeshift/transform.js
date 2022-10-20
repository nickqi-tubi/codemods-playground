import { insertImportSpecifier } from '@codeshift/utils';
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
  const collection = ast.find(j.VariableDeclaration, {
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
  const args = collection.find(j.CallExpression).get().node.arguments;
  const wrapperIdentifier = collection.find(j.Identifier).get().node.name;

  collection.replaceWith(j.expressionStatement(j.callExpression(j.identifier('render'), args)));

  return {
    wrapperIdentifier,
  };
};

const transformLinkTextExpect = (j, ast) => (path) => {
  if (!isRtlFnExists(j, ast, 'screen')) {
    insertImportSpecifier(j, ast, j.importSpecifier(j.identifier('screen')), '@testing-library/react');
  }
};

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

  transformMountImport(j, ast);
  const { wrapperIdentifier } = transformMountCall(j, ast);

  findWrapperExpect(j, ast, { wrapperIdentifier }).forEach(transformLinkTextExpect(j, ast));

  return ast.toSource({
    quote: 'single',
  });
};
