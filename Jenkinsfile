pipeline {
	agent any
	stages {
		stage('Build frontend') {
			agent {
				docker {
					image 'node:22'
					reuseNode true
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
					reuseNode true
				}
			}
			steps {
				dir("backend/src") {
					sh 'HUSKY=0 dotnet publish PeruControl.csproj -c Release -r linux-musl-x64 -o out'
				}
			}
		}
		stage("Run e2e tests") {
			agent {
				docker {
					image 'digitalesacide/playwright-dotnet9-noble:latest'
					args '--ipc=host'
					reuseNode true
				}
			}
			steps {
				dir("backend/Tests.E2E") {
					sh 'dotnet test'
				}
			}
		}
	}
}
