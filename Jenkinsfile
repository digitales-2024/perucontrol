pipeline {
	agent any
	environment {
		// Change HOME, because default is usually root dir, and Jenkins user may not have write permissions in that dir
		HOME = "${WORKSPACE}"
	}
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
							args '-v nuget-cache:/root/.nuget/packages'
							args '-u 0:0'
						}
					}
					steps {
						dir("backend/src") {
							sh 'dotnet restore --locked-mode'
							sh 'dotnet publish -c Release -r linux-musl-x64 -o out'
						}
					}
				}
				stage("Run e2e tests") {
					agent {
						docker {
							image 'digitalesacide/playwright-dotnet9-noble:latest'
							args '--ipc=host -u 0:0'
						}
					}
					steps {
						dir("backend/Tests.E2E") {
							sh 'dotnet restore --locked-mode'
							sh 'dotnet test'
						}
					}
				}
			}
		}
	}
}
