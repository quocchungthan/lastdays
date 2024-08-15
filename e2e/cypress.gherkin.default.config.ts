import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'
const cucumber = require('cypress-cucumber-preprocessor').default
const browserify = require('@cypress/browserify-preprocessor');

export const defaultConfiguration: Cypress.ConfigOptions<any> = {
   e2e: {
      setupNodeEvents(on, config) {
        // implement node event listeners here
        addMatchImageSnapshotPlugin(on);
        const options = browserify.defaultOptions;
        options.browserifyOptions.transform[1][1].babelrc = true;
        options.typescript = require.resolve('typescript');
  
        on('file:preprocessor', browserify(options))
        on('file:preprocessor', cucumber());
      },
      specPattern: "**/*.feature",
      baseUrl: 'http://localhost:81'
    },
 };