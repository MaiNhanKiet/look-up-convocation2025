pipeline {
    agent any
    stages {
        stage('Test Build Docker Images') {
            steps {
                echo 'Testing Docker build for frontend service without running containers'
                script {
                    def buildResult = sh(script: "docker compose -f docker-compose.yml build frontend", returnStatus: true)
                    if (buildResult != 0) {
                        error("Docker build failed! Stopping pipeline.")
                    } else {
                        echo "Docker build successful. Proceeding with the pipeline..."
                    }
                }
            }
        }
        stage('Build and Run Frontend Service') {
            steps {
                echo 'Removing old frontend container (if exists)'
                sh 'docker rm -f frontend || true'
                echo 'Building and running frontend container'
                sh 'docker compose -f "docker-compose.yml" up -d --build frontend'
            }
        }
        stage('Cleaning up') {
            steps {
                echo 'Cleaning up unused Docker resources'
                sh 'docker system prune -f'
                sh 'docker ps -a'
            }
        }
    }
    post {
        always {
            echo 'Cleaning workspace'
            cleanWs()
        }
    }
}