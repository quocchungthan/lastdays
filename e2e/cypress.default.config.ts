import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'

export const defaultConfiguration: Cypress.ConfigOptions<any> = {
   e2e: {
     setupNodeEvents(on, config) {
       // implement node event listeners here
       addMatchImageSnapshotPlugin(on);
     },
     baseUrl: 'http://localhost:81'
   },
 };