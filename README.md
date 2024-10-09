>[!IMPORTANT]
>This repo is no longer maintained. The functionality is being
>migrated into [redhat-appstudio/tssc-dev-multi-ci](https://github.com/redhat-appstudio/tssc-dev-multi-ci/),
>starting with [this PR](https://github.com/redhat-appstudio/tssc-dev-multi-ci/pull/5).

# RHTAP CI Builder

## Goals

Explore a way to generate and maintain tasks and pipelines
for [RHTAP](https://www.redhat.com/en/products/trusted-application-pipeline) across multiple CI platforms.

## See also

* <https://github.com/jduimovich/tssc-dev-multi-ci>
* <https://github.com/konflux-ci/build-definitions>

## Rough plan

* Use [Nunjucks](https://mozilla.github.io/nunjucks/) since IIUC it's familiar in the Backstage/RHDH community.
* Generate a working JenkinsFile, GitHub pipeline, and GitLab pipeline similar to the following:
  * <https://github.com/jduimovich/tssc-dev-multi-ci/blob/main/Jenkinsfile>
  * <https://github.com/jduimovich/tssc-dev-multi-ci/blob/main/.gitlab-ci.yml>
  * <https://github.com/jduimovich/tssc-dev-multi-ci/blob/main/.github/workflows/build-and-update-gitops.yml>
* Use single source for all common/shared functionality
* No `sed` commands!

## Getting started

```bash
make install
make refresh
```
