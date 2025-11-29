pipeline {
    agent any
    
    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code'
                checkout scm
            }
        }
        
        stage('Test Build Frontend') {
            steps {
                echo 'Testing Docker build for frontend service'
                script {
                    def buildResult = sh(
                        script: "docker compose -f ${COMPOSE_FILE} build frontend",
                        returnStatus: true
                    )
                    if (buildResult != 0) {
                        error("Frontend Docker build failed! Stopping pipeline.")
                    } else {
                        echo "Frontend Docker build successful."
                    }
                }
            }
        }
        
        stage('Stop Old Frontend Container') {
            steps {
                echo 'Stopping and removing old frontend container'
                sh 'docker compose -f ${COMPOSE_FILE} stop frontend || true'
                sh 'docker compose -f ${COMPOSE_FILE} rm -f frontend || true'
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                echo 'Building and deploying frontend service'
                sh "docker compose -f ${COMPOSE_FILE} up -d --no-deps --build frontend"
                echo 'Waiting for frontend to be ready...'
                sleep(time: 5, unit: 'SECONDS')
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying frontend deployment'
                sh 'docker ps -a | grep convocation2025_frontend'
                sh 'docker logs convocation2025_frontend --tail 50'
            }
        }
        
        stage('Cleanup') {
            steps {
                echo 'Cleaning up unused Docker resources'
                sh 'docker image prune -f'
                sh 'docker container prune -f'
            }
        }
    }
    
    post {
        success {
            echo '✅ Frontend deployment successful!'
            sh 'docker ps --filter "name=convocation2025_frontend"'
        }
        failure {
            echo '❌ Frontend deployment failed!'
            sh 'docker logs convocation2025_frontend --tail 100 || true'
        }
        always {
            echo 'Pipeline completed. Cleaning workspace.'
            cleanWs()
        }
    }
}