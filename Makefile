
.PHONY: refresh
refresh: clean build

# This should produce a non-zero exit code if there are
# generated files that are not in sync with the templates
.PHONY: ensure-fresh
ensure-fresh:
	@$(MAKE) refresh > /dev/null && git diff --exit-code -- generated

.PHONY: build
build: build-jenkins build-jenkins-local build-github build-gitlab

.PHONY: build-jenkins
build-jenkins: generated/Jenkinsfile

.PHONY: build-jenkins-local
build-jenkins-local: generated/Jenkinsfile-local-scripts

.PHONY: build-github
build-github: generated/dot-github-workflows-build-pipeline.yaml

.PHONY: build-gitlab
build-gitlab: generated/dot-gitlab-ci.yaml

generated/%: templates/%.njk
	@echo "Building $@"
	@mkdir -p `dirname $@`
	@node bin/render.cjs $< data/data.yaml > $@

.PHONY: clean
clean:
	@rm -rf generated

.PHONY: install
install:
	npm install --frozen-lockfile
