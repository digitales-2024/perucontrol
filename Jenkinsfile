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
				dir("backend") {
					sh 'dotnet publish -c Release -r linux-musl-x64 -o out'
				}
			}
		}
	}
}

