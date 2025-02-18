pipeline {
	agent any
	stages {
		stage('Build Nextjs static project') {
			agent {
				docker {
					image 'node:22'
					reuseNode true
				}
			}
			steps {
				sh 'npm i -g pnpm'
				sh 'pnpm i'
				sh 'pnpm run build'
			}
		}
	}
}
