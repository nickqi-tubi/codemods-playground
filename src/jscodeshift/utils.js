export const findWrapperExpect = (j, ast, { wrapperIdentifier = 'wrapper' }) =>
  ast.find(j.ExpressionStatement, {
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          callee: {
            name: 'expect',
          },
          arguments: [
            {
              callee: {
                object: {
                  callee: {
                    object: {
                      type: 'Identifier',
                      name: wrapperIdentifier,
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
  });

export const isRtlFnExists = (j, ast, fn) =>
  ast.find(j.ImportDeclaration, {
    source: {
      value: '@testing-library/react',
    },
    specifiers: [
      {
        imported: {
          name: fn,
        },
      },
    ],
  }).length > 0;

export const buildRtlImport = (j, { imported, source }) =>
  j.importDeclaration([j.importSpecifier(j.identifier(imported))], j.literal(source));
