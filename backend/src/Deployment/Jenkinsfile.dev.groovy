pipeline {
    agent any
    environment {
        // Credentials for jenkins to access private github repos
        GITHUB_CREDENTIALS = "8d51209e-434f-4761-bb3d-1f9e3974d0b1"

        //
        // VPS setup
        //
        REMOTE_USER = "ansible"
        REMOTE_IP = credentials("acide-elastika-01")
        // Folder where docker-compose and .env files are placed
        REMOTE_FOLDER = "/home/${REMOTE_USER}/docker/perucontrol-develop/"

        //
        // Build config
        //
        // prefix of the image to build, config triplet
        //  <project>-<service>-<stage>
        //  perucontrol-backend-develop
        PROJECT_NAME = "perucontrol"
        PROJECT_SERVICE = "backend"
        PROJECT_STAGE = "develop"
        PROJECT_TRIPLET = "${PROJECT_NAME}-${PROJECT_SERVICE}-${PROJECT_STAGE}"

        //
        // Docker registry setup
        //
        REGISTRY_CREDENTIALS = "dockerhub-digitalesacide-credentials"
        REGISTRY_URL = "docker.io"
        REGISTRY_USER = "digitalesacide"
        REGISTRY_REPO = "${PROJECT_TRIPLET}"
        // docker.io/digitalesacide/perucontrol-backend-develop
        FULL_REGISTRY_URL = "${REGISTRY_URL}/${REGISTRY_USER}/${REGISTRY_REPO}"
        ESCAPED_REGISTRY_URL = "${REGISTRY_URL}\\/${REGISTRY_USER}\\/${REGISTRY_REPO}"

        // Docker buid arguments
        INTERNAL_BACKEND_URL = "http://trazo-dev-api:5000/api/v1"

        // SSH command
        SSH_COM = "ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP}"
        SCP_COM = "-o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP}"
    }

    stages {
        stage("Build & push image") {
            steps {
                dir("backend/src") {
                    sh "cp Deployment/Dockerfile.alpine ./Dockerfile"
                    script {
                        withDockerRegistry(credentialsId: "${REGISTRY_CREDENTIALS}") {
                            def image = docker.build("${FULL_REGISTRY_URL}:${BUILD_NUMBER}")
                            image.push()
                        }
                    }
                    sh "rm Dockerfile || true"
                }
            }
        }
        stage("Restart backend service") {
            steps {
                script {
                    def config = readYaml file: 'backend/src/Deployment/env.yaml'
                    def env = config.develop

                    def nonSensitiveVars = env.nonsensitive.collect { k, v -> "${k}=${v}" }
                    def sensitiveVars = env.sensitive

                    // Define all your environment variables in an array
                    def credentialsList = sensitiveVars.collect { 
                        string(credentialsId: it, variable: it)
                    }

                    def varsNames = []
                    varsNames.addAll(env.nonsensitive.keySet())
                    varsNames.addAll(env.sensitive)
                    def varsYamlStr = varsNames.collect { var -> "\"${var}\": \"\${${var}}\"" }.join(',')

                    sh "cp backend/src/Deployment/docker-compose.dev.yml docker-compose.yml"
                    sh "yq -y -i '.services[\"${PROJECT_TRIPLET}\"].image = \"${FULL_REGISTRY_URL}:${BUILD_NUMBER}\"' docker-compose.yml"
                    sh "yq -y -i '.services[\"${PROJECT_TRIPLET}\"].environment = {${varsYamlStr}}' docker-compose.yml"

                    withCredentials(credentialsList) {
                        sshagent(['ssh-deploy']) {
                            // Replace docker image version
                            sh """
                                ${SSH_COM} '
                                mkdir -p ${REMOTE_FOLDER} &&
                                cd ${REMOTE_FOLDER} &&
                                docker pull ${FULL_REGISTRY_URL}:${BUILD_NUMBER}
                                '
                            """

                            // Create a temporary script that will create the .env file
                            // This enables us to use shell variables to properly handle 
                            // the credentials without using binding.getVariable()
                            sh """
                                cat > ${WORKSPACE}/create_env.sh << 'EOL'
#!/bin/bash
cat << EOF
# Non-sensitive variables
${nonSensitiveVars.join('\n')}
# Sensitive variables
${sensitiveVars.collect { varName -> "${varName}=\${${varName}}" }.join('\n')}
EOF
EOL
                                chmod +x ${WORKSPACE}/create_env.sh
                            """

                            // Execute the script to generate env content and send it to remote
                            sh """
                                ${WORKSPACE}/create_env.sh | ${SSH_COM} 'umask 077 && cat > ${REMOTE_FOLDER}/.env'
                            """

                            // Send the docker-compose file to the remote
                            sh "scp docker-compose.yml ${SCP_COM}:${REMOTE_FOLDER}/docker-compose.yml"

                            // Restart the service
                            sh """
                                ${SSH_COM} '
                                cd ${REMOTE_FOLDER} && 
                                docker compose up -d --no-deps ${PROJECT_TRIPLET}
                                '
                            """
                        }
                    }
                }
            }
        }
    }
}
