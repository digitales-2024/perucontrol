pipeline {
	agent any
	stages {
		stage('Build release binary') {
			agent {
				docker {
					image 'mcr.microsoft.com/dotnet/sdk:9.0-alpine'
					reuseNode true
				}
			}
			steps {
				sh 'dotnet publish -c Release -r linux-musl-x64 -o out'
			}
		}
	}
}
