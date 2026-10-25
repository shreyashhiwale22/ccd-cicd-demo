# CCA 2 - CI/CD Pipeline (Jenkins + Docker + Minikube)

Weather Dashboard (Express API + web frontend) used to demonstrate an automated pipeline.

| Item | Value |
| --- | --- |
| App | `backend/` (Node.js + Express API, `backend/public` web frontend, 8 Jest tests) |
| Image | `shreyh/ccd-demo-app` |
| Jenkins job | `ccd-demo-pipeline` |
| Branch | `ccd-pipeline` |
| Deployment | Minikube on AWS EC2, Service NodePort 30080 |

## Pipeline stages
Checkout -> Build and Test -> Docker Build -> Push Image -> Minikube Deployment -> Verification

## Files
`Jenkinsfile`, `backend/Dockerfile`, `k8s/deployment.yaml`, `k8s/service.yaml`, `CCA2-README.md`

## Endpoints
`/` (web UI), `/health`, `/api/weather?city=Pune` (live data from the free Open-Meteo API, no key needed)
