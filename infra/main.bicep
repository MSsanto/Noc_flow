@description('Azure region for the portfolio environment.')
param location string = resourceGroup().location

@description('Short prefix used to name Azure resources.')
param namePrefix string = 'nocflow'

var suffix = uniqueString(resourceGroup().id)
var apiName = '${namePrefix}-${suffix}-api'
var webName = '${namePrefix}-${suffix}-web'
var planName = '${namePrefix}-${suffix}-plan'

resource appServicePlan 'Microsoft.Web/serverfarms@2025-03-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource api 'Microsoft.Web/sites@2025-03-01' = {
  name: apiName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.12'
      appCommandLine: 'python -m uvicorn app.main:app --host 0.0.0.0 --port 8000'
      alwaysOn: true
      healthCheckPath: '/health'
    }
  }
}

resource web 'Microsoft.Web/staticSites@2025-03-01' = {
  name: webName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output apiHostname string = api.properties.defaultHostName
output staticWebAppName string = web.name
