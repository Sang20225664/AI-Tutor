{{- define "ai-tutor.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "ai-tutor.labels" -}}
app.kubernetes.io/name: {{ include "ai-tutor.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.global.environment }}
{{- end }}
