pipeline {
	agent any
	stages {
		stage("Build project") {
			parallel {
				stage('Build frontend') {
					agent {
						docker {
							image 'node:22'
							reuseNode true
							args '-u 0:0 -v pnpm-store:/root/.pnpm-store'
						}
					}
					steps {
						dir("frontend") {
							sh 'npm i -g pnpm'
							sh 'pnpm config set store-dir /root/.pnpm-store'
							sh 'pnpm i --frozen-lockfile'
							sh 'pnpm run build'
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
				sh "sed -i s/{BUILD_NUMBER}/${BUILD_NUMBER}/g docker-compose.ci.yml"
				sh "docker network create perucontrol-network-ci-${BUILD_NUMBER}"
				sh "docker compose -f docker-compose.ci.yml up -d"
			}
			post {
				failure {
					sh 'docker-compose -f docker-compose.ci.yml down -v || true'
					sh "docker network rm perucontrol-network-ci-${BUILD_NUMBER} || true"
				}
			}
		}
		stage("Run e2e tests") {
			environment {
				BASE_URL = "http://perucontrol-frontend-ci-${BUILD_NUMBER}:3000"
			}
			steps {
				dir("backend/Tests.E2E") {
					sh 'mkdir reports || true'
					sh 'docker run --network perucontrol-network-ci-${BUILD_NUMBER} -e BASE_URL=${BASE_URL} -v $(pwd):/tests digitalesacide/playwright-dotnet9-noble:latest dotnet test --logger "xunit;LogFilePath=reports/testresults.xml"'
				}
			}
			post {
				always {
					sh 'docker compose -f docker-compose.ci.yml down -v || true'
					sh "docker network rm perucontrol-network-ci-${BUILD_NUMBER} || true"
					dir("backend/Tests.E2E") {
						junit 'reports/testresults.xml'
						archiveArtifacts 'reports/**'
					}
				}
			}
		}
	}
}
