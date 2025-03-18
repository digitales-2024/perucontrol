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
							args '-u 0:0'
						}
					}
					steps {
						dir("frontend") {
							sh 'npm i -g pnpm'
							sh 'pnpm i'
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
				sh "docker compose -f docker-compose.ci.yml up -d"
			}
		}
		stage("Run e2e tests") {
			agent {
				docker {
					image 'digitalesacide/playwright-dotnet9-noble:latest'
					args "--ipc=host -u 0:0 --network perucontrol-network-ci-${BUILD_NUMBER}"
				}
			}
			environment {
				BASE_URL = "http://perucontrol-db-ci-${BUILD_NUMBER}:3000"
			}
			steps {
				dir("backend/Tests.E2E") {
					sh 'dotnet restore --locked-mode'
					sh "dotnet test"
				}
			}
			post {
				always {
					sh 'docker-compose -f docker-compose.ci.yml down -v'
				}
			}
		}
	}
}
