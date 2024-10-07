
.PHONY: refresh
refresh: clean build

.PHONY: build
build: build-jenkins build-github build-gitlab

.PHONY: build-jenkins
build-jenkins: output/Jenkinsfile

.PHONY: build-github
build-github: output/dot-github-workflows-build-pipeline.yaml

.PHONY: build-gitlab
build-gitlab: output/dot-gitlab-ci.yaml

output/%: templates/%.njk
	@echo "Building $@"
	@mkdir -p `dirname $@`
	@node bin/render.cjs $< data/data.yaml > $@

.PHONY: clean
clean:
	@rm -rf output

.PHONY: install
install:
	npm install --frozen-lockfile
