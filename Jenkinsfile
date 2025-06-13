pipeline {
	agent any
	environment {
		BUILD_REF = "${sh(script: "echo -n '${BUILD_TAG}' | sha256sum | cut -c1-12", returnStdout: true).trim()}"
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
					steps {
						dir("backend") {
							// Just use the docker image to build the frontend
							sh "docker build -t perucontrol-backend-ci-${BUILD_REF} -f +devops/Dockerfile.alpine ."
						}
					}
				}
			}
		}
		stage("Prepare docker compose") {
			steps {
				sh "sed -i s/{BUILD_NUMBER}/${BUILD_REF}/g docker-compose.ci.yml"
				sh "docker network create perucontrol-network-ci-${BUILD_REF}"
				sh "docker compose -f docker-compose.ci.yml up -d --remove-orphans"
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
				API_URL = "http://perucontrol-backend-ci-${BUILD_REF}:8080"
			}
			steps {
				// Give time for backend/frontend to start
				sh 'sleep 5'
				dir("backend/Tests.E2E") {
					sh "mkdir reports || true"
					catchError(buildResult: "UNSTABLE", stageResult: "FAILURE") {
						sh "docker run --network perucontrol-network-ci-${BUILD_REF} -e BASE_URL=${BASE_URL} -e API_URL=${API_URL} -v \$(pwd)/../:/tests digitalesacide/playwright-dotnet9-noble:latest bash -c 'cd /tests/Tests.E2E && dotnet test --logger \"xunit;LogFilePath=reports/testresults.xml\"'"
					}
				}
			}
			post {
				always {
					// logs from docker compose
					sh 'mkdir -p logs || true'
					sh "docker logs perucontrol-frontend-ci-${BUILD_REF} > logs/frontend.log 2>&1 || true"
					sh "docker logs perucontrol-backend-ci-${BUILD_REF} > logs/backend.log 2>&1 || true"
					sh "docker logs perucontrol-db-ci-${BUILD_REF} > logs/db.log 2>&1 || true"
					archiveArtifacts 'logs/**'
				}
			}
		}
	}
	post {
		always {
			// remove docker images/containers built
			sh 'docker compose -f docker-compose.ci.yml down -v || true'
			sh "docker network rm perucontrol-network-ci-${BUILD_REF} || true"
			sh "docker rmi perucontrol-frontend-ci-${BUILD_REF} || true"
			sh "docker rmi perucontrol-backend-ci-${BUILD_REF} || true"
			sh "docker container rm perucontrol-frontend-ci-${BUILD_REF} || true"
			sh "docker container rm perucontrol-backend-ci-${BUILD_REF} || true"
		}
	}
}
