{{/*
Common labels
*/}}
{{- define "grant.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "grant.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "grant.selectorLabels" -}}
app.kubernetes.io/name: {{ include "grant.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Expand the name of the chart.
*/}}
{{- define "grant.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "grant.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Service account name
*/}}
{{- define "grant.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "grant.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Hostname from global.appUrl (no scheme, no path)
*/}}
{{- define "grant.appHost" -}}
{{- $raw := .Values.global.appUrl | trimPrefix "https://" | trimPrefix "http://" }}
{{- $raw | splitList "/" | first }}
{{- end }}

{{/*
DOCS_URL — same host, path /docs
*/}}
{{- define "grant.docsUrl" -}}
{{- trimSuffix "/" .Values.global.appUrl }}/docs
{{- end }}

{{/*
Database URL for generated Secret (not used when api.existingSecretEnv is set)
*/}}
{{- define "grant.databaseUrl" -}}
{{- .Values.externalDatabase.url }}
{{- end }}

{{/*
imagePullSecrets for private registries (optional; empty list omits the field)
*/}}
{{- define "grant.imagePullSecrets" -}}
{{- with .Values.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}
