import { defineConfig } from "cypress";
import { defaultConfiguration } from "./cypress.default.config";

defaultConfiguration.e2e!.baseUrl = 'http://localhost:4200';

export default defineConfig(defaultConfiguration);
