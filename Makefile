.DEFAULT_GOAL := run

version = `git fetch --tags >/dev/null && git describe --tags | cut -c 2-`
docker_container = akarasz/dajsz

what:
	echo $(docker_tags)

.PHONY := run
run:
	npm start

.PHONY := docker
docker:
	docker build -t "$(docker_container):latest" -t "$(docker_container):$(version)" .

.PHONY := push
push: docker
	docker push $(docker_container):latest
	docker push $(docker_container):$(version)
