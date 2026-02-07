IMAGE_NAME := huangjin-xin
TAG := latest
PORT := 80

.PHONY: build run stop clean deploy redeploy logs shell test help

help:
	@echo "Available commands:"
	@echo "  make build        - Build the Docker image"
	@echo "  make run          - Run the container locally (Bridge mode, port $(PORT))"
	@echo "  make run-host     - Run the container locally (Host network mode)"
	@echo "  make stop         - Stop and remove the container"
	@echo "  make clean        - Stop container and remove image"
	@echo "  make deploy       - Rebuild and run (Bridge mode)"
	@echo "  make redeploy     - Alias for deploy"
	@echo "  make deploy-host  - Rebuild and run (Host network mode)"
	@echo "  make redeploy-host- Alias for deploy-host"
	@echo "  make logs         - View container logs"
	@echo "  make shell        - Open a shell inside the container"
	@echo "  make test         - Run end-to-end tests"
	@echo "  make manual-install - Print manual Docker run commands"

build:
	@echo "Building Docker image $(IMAGE_NAME):$(TAG)..."
	docker build -t $(IMAGE_NAME):$(TAG) .

run:
	@echo "Starting container $(IMAGE_NAME)..."
	docker run -d -p $(PORT):80 --name $(IMAGE_NAME) --restart always $(IMAGE_NAME):$(TAG)
	@echo "Container started! Access it at http://localhost:$(PORT)"

run-host:
	@echo "Starting container $(IMAGE_NAME) in host network mode..."
	docker run -d --network host --name $(IMAGE_NAME) --restart always $(IMAGE_NAME):$(TAG)
	@echo "Container started in host mode! App should be listening on port 80."

stop:
	@echo "Stopping container $(IMAGE_NAME)..."
	-docker stop $(IMAGE_NAME)
	-docker rm $(IMAGE_NAME)

clean: stop
	@echo "Removing image $(IMAGE_NAME):$(TAG)..."
	-docker rmi $(IMAGE_NAME):$(TAG)

deploy: build stop run

redeploy: deploy

deploy-host: build stop run-host

redeploy-host: deploy-host

logs:
	docker logs -f $(IMAGE_NAME)

shell:
	docker exec -it $(IMAGE_NAME) /bin/bash

test:
	./scripts/e2e-test.sh

manual-install:
	@echo "To manually install and run via Docker, execute the following commands:"
	@echo ""
	@echo "# 1. Build the image"
	@echo "docker build -t $(IMAGE_NAME):$(TAG) ."
	@echo ""
	@echo "# 2. Run the container (Bridge Mode - Port Mapped)"
	@echo "docker run -d -p $(PORT):80 --name $(IMAGE_NAME) --restart always $(IMAGE_NAME):$(TAG)"
	@echo ""
	@echo "# 3. Run the container (Host Network Mode - Direct Access)"
	@echo "docker run -d --network host --name $(IMAGE_NAME) --restart always $(IMAGE_NAME):$(TAG)"
