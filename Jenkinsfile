pipeline {
    agent any

    environment {
        DOCKER_USER = 'shreyh'
        IMAGE       = "${DOCKER_USER}/ccd-demo-app"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $IMAGE:$BUILD_NUMBER -t $IMAGE:latest backend'
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DH_USER',
                                                  passwordVariable: 'DH_PASS')]) {
                    sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
                    sh 'docker push $IMAGE:$BUILD_NUMBER'
                    sh 'docker push $IMAGE:latest'
                }
            }
        }

        stage('Minikube Deployment') {
            steps {
                sh 'kubectl apply -f k8s/'
                sh 'kubectl set image deployment/ccd-demo-app ccd-demo-app=$IMAGE:$BUILD_NUMBER'
                sh 'kubectl rollout status deployment/ccd-demo-app --timeout=120s'
            }
        }

        stage('Verification') {
            steps {
                sh 'kubectl get pods'
                sh 'kubectl get deployment ccd-demo-app'
                sh 'kubectl get svc ccd-demo-svc'
                sh 'curl -s http://$(minikube ip):30080/health'
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
