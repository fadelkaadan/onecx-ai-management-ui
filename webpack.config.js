const webpack = require('webpack')
const { ModifyEntryPlugin } = require('@angular-architects/module-federation/src/utils/modify-entry-plugin')
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack')
const config = withModuleFederationPlugin({
  name: 'onecx-ai-management-ui-app',
  filename: 'remoteEntry.js',
  exposes: {
    './OnecxAiUiManagementModule': './src/bootstrap.ts'
  },
  shared: share({
    '@angular/core': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@angular/platform-browser': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@angular/forms': {
      requiredVersion: 'auto',
      includeSecondaries: true,
      eager: false
    },
    '@angular/common': {
      requiredVersion: 'auto',
      includeSecondaries: {
        skip: ['@angular/common/http/testing']
      }
    },
    '@angular/common/http': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@angular/router': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    rxjs: {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/accelerator': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/angular-accelerator': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/angular-auth': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/angular-remote-components': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/angular-webcomponents': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/integration-interface': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/keycloak-auth': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/portal-integration-angular': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@onecx/portal-layout-styles': {
      requiredVersion: 'auto',
      includeSecondaries: true
    },
    '@ngx-translate/core': {
      requiredVersion: 'auto'
    }
  }),

  sharedMappings: ['@onecx/portal-integration-angular']
})

const plugins = config.plugins.filter((plugin) => !(plugin instanceof ModifyEntryPlugin))

module.exports = {
  ...config,
  plugins: [
    new webpack.DefinePlugin({
      ngDevMode: 'undefined'
    }),
    ...plugins
  ],
  output: {
    uniqueName: 'onecx-ai-management-ui',
    publicPath: 'auto'
  },
  experiments: {
    ...config.experiments,
    topLevelAwait: true
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: false
  }
}
