pipeline {
    agent any
    
    environment {
        FRONTEND_IMAGE = 'convocation2025_frontend'
        FRONTEND_CONTAINER = 'convocation2025_frontend'
        NETWORK_NAME = 'look-up-graduration_convocation2025'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code'
                checkout scm
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo 'Building frontend Docker image'
                dir('front-end') {
                    sh '''
                        docker build \
                            --build-arg NEXT_PUBLIC_API_URL=https://api.srofptuhcm.com \
                            -t ${FRONTEND_IMAGE}:latest \
                            -f Dockerfile .
                    '''
                }
            }
        }
        
        stage('Stop Old Frontend Container') {
            steps {
                echo 'Stopping and removing old frontend container'
                sh 'docker stop ${FRONTEND_CONTAINER} || true'
                sh 'docker rm ${FRONTEND_CONTAINER} || true'
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                echo 'Deploying frontend container'
                sh '''
                    docker run -d \
                        --name ${FRONTEND_CONTAINER} \
                        --network ${NETWORK_NAME} \
                        --restart unless-stopped \
                        -e NODE_ENV=production \
                        -e PORT=3002 \
                        ${FRONTEND_IMAGE}:latest
                '''
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