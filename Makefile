.DEFAULT_GOAL := run

.PHONY := run
run:
	npm start

.PHONY := docker
docker:
	docker build -t akarasz/dajsz:latest .

.PHONY := push
push: docker
	docker push akarasz/dajsz:latest
