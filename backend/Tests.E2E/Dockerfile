FROM mcr.microsoft.com/playwright:v1.50.0-noble

# install .net 9
RUN apt-get update && \
	apt-get install -y software-properties-common && \
	add-apt-repository ppa:dotnet/backports && \
	apt-get update && \
	apt-get install -y dotnet-sdk-9.0 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

WORKDIR /tests

# Default command
CMD ["dotnet", "test"]
