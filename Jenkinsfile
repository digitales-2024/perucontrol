pipeline {
	agent any
	environment {
		BUILD_REF = "${BUILD_TAG.replace('%2F', '-')}"
	}
	stages {
		stage("Build project") {
			parallel {
				stage('Build frontend') {
					steps {
						dir("frontend") {
							// Just use the docker image to build the frontend
							sh "docker build -t perucontrol-frontend-ci-${BUILD_REF} -f deployment/Dockerfile ."
						}
					}
				}
				stage('Build backend') {
					agent {
						docker {
							image 'mcr.microsoft.com/dotnet/sdk:9.0-alpine'
							args '-v nuget-cache:/root/.nuget/packages -u 0:0'
						}
					}
					steps {
						dir("backend/src") {
							sh 'dotnet restore --locked-mode'
							sh 'dotnet publish -c Release -r linux-musl-x64 -o out'
						}
					}
				}
			}
		}
		stage("Prepare docker compose") {
			steps {
				sh "sed -i s/{BUILD_NUMBER}/${BUILD_REF}/g docker-compose.ci.yml"
				sh "docker network create perucontrol-network-ci-${BUILD_REF}"
				sh "docker compose -f docker-compose.ci.yml up -d"
			}
			post {
				failure {
					sh 'docker-compose -f docker-compose.ci.yml down -v || true'
					sh "docker network rm perucontrol-network-ci-${BUILD_REF} || true"
				}
			}
		}
		stage("Run e2e tests") {
			environment {
				BASE_URL = "http://perucontrol-frontend-ci-${BUILD_REF}:3000"
			}
			steps {
				// Give time for backend/frontend to start
				sh 'sleep 5'
				dir("backend/Tests.E2E") {
					sh "mkdir reports || true"

					sh "docker run --network perucontrol-network-ci-${BUILD_REF} -e BASE_URL=${BASE_URL} -v $(pwd):/tests digitalesacide/playwright-dotnet9-noble:latest dotnet test --logger \"xunit;LogFilePath=reports/testresults.xml\""
				}
			}
			post {
				always {
					// logs from docker compose
					sh 'mkdir -p logs || true'
					sh "docker logs perucontrol-frontend-ci-${BUILD_REF} > logs/frontend.log 2>&1 || true"
					sh "docker logs perucontrol-backend-ci-${BUILD_REF} > logs/backend.log 2>&1 || true"
					archiveArtifacts 'logs/**'
				}
			}
		}
	}
	post {
		always {
			// remove docker images built
			sh 'docker compose -f docker-compose.ci.yml down -v || true'
			sh "docker network rm perucontrol-network-ci-${BUILD_REF} || true"
			sh "docker rmi perucontrol-frontend-ci-${BUILD_REF} || true"
		}
	}
}
