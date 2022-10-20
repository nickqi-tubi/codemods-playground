import { insertImportSpecifier } from '@codeshift/utils';
import { findWrapperFindExpect, isRtlFnExists, buildRtlImport } from './utils';

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

const transformLinkTextExpect = (j, ast, { wrapperIdentifier }) => {
  if (!isRtlFnExists(j, ast, 'screen')) {
    insertImportSpecifier(j, ast, j.importSpecifier(j.identifier('screen')), '@testing-library/react');
  }

  findWrapperFindExpect(j, ast, { wrapperIdentifier }).forEach((path) => {
    const { expression } = path.value;
    const expectFn = expression.callee.property.name;
    const findCallee = expression.callee.object.arguments[0].callee;
    const findChainFn = findCallee.property.name;

    if (findChainFn === 'text' && ['toBe', 'toEqual'].includes(expectFn)) {
      const expectedValue = expression.arguments[0].value;
      const selector = findCallee.object.arguments[0].value;

      if (selector === 'a' || selector.startsWith('a.')) {
        j(path).replaceWith(`
          expect(
            screen.getByRole('link', {
              name: ${expectedValue},
            })
          ).toBeInTheDocument();
          `);
      }
    }
  });
};

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const ast = j(file.source);

  transformMountImport(j, ast);
  const { wrapperIdentifier } = transformMountCall(j, ast);

  transformLinkTextExpect(j, ast, { wrapperIdentifier });

  return ast.toSource({
    quote: 'single',
  });
};
