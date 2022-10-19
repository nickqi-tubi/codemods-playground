export const parser = 'tsx';

module.exports = (file, api) => {
  const j = api.jscodeshift;

  return j(file.source)
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
    .replaceWith(`import { render } from '@testing-library/react';`)
    .toSource();
};
