# Ver apps disponibles
.\deploy.ps1 -ListApps

# Desplegar una app específica
.\deploy.ps1 -App buildwiselabs

# Desplegar solo frontend de una app
.\deploy.ps1 -App buildwiselabs -FrontendOnly

# Desplegar solo backend de una app
.\deploy.ps1 -App buildwiselabs -BackendOnly

# Desplegar sin incluir el .exe
.\deploy.ps1 -App buildwiselabs -SkipExe