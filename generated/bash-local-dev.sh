# Generated from templates/bash-local-dev.sh.njk. Do not edit directly.

# Fill in template values and set run local
# the env.template is copyed to the RHDH sample templates
# into env.sh and is filled in by the template expansion
export LOCAL_SHELL_RUN=true

# optional set repo url and it will update this repo with the new image
# this means you need to pull after a build to be in sync

# get the URL of the repo, works for forks
OPTIONAL_REPO_UPDATE=$(git remote get-url origin)
# don't image gitops, good for testing build only
OPTIONAL_REPO_UPDATE=

REQUIRED_ENV="MY_QUAY_USER "
REQUIRED_BINARY="tree "
rhtap/verify-deps-exist "$REQUIRED_ENV" "$REQUIRED_BINARY"
ERR=$?
echo "Dependency Error $1 = $ERR"
if [ $ERR != 0 ]; then
	echo "Fatal Error code for $1 = $ERR"
	exit $ERR
fi

SETUP_ENV=rhtap/env.sh
cp rhtap/env.template.sh $SETUP_ENV
sed -i "s!\${{ values.image }}!quay.io/\${MY_QUAY_USER:-jduimovich0}/bootstrap!g" $SETUP_ENV
sed -i "s!\${{ values.dockerfile }}!Dockerfile!g" $SETUP_ENV
sed -i "s!\${{ values.buildContext }}!.!g" $SETUP_ENV
sed -i "s!\${{ values.repoURL }}!$OPTIONAL_REPO_UPDATE!g" $SETUP_ENV

# Set MY_REKOR_HOST and MY_TUF_MIRROR to 'none' if these services are not available
sed -i 's!export REKOR_HOST=.*$!export REKOR_HOST="\${MY_REKOR_HOST:-http://rekor-server.rhtap.svc}"!' $SETUP_ENV
sed -i 's!export TUF_MIRROR=.*$!export TUF_MIRROR="\${MY_TUF_MIRROR:-http://tuf.rhtap.svc}"!' $SETUP_ENV

source $SETUP_ENV

SIGNING_SECRET_ENV=rhtap/signing-secret-env.sh
if [ ! -f $SIGNING_SECRET_ENV ]; then
  # If the signing secret file doesn't exist already then generate one
  hack/create-signing-secret > $SIGNING_SECRET_ENV
fi
# When running in Jenkins the secret values will be read from credentials
source $SIGNING_SECRET_ENV

COUNT=0

function run () {
    let "COUNT++"
    printf "\n"
    printf '=%.0s' {1..31}
    printf " %d " $COUNT
    printf '=%.0s' {1..32}
    bash $1
    ERR=$?
    echo "Error code for $1 = $ERR"
    printf '_%.0s' {1..64}
    printf "\n"
    if [ $ERR != 0 ]; then
        echo "Fatal Error code for $1 = $ERR"
        exit 1
    fi
}
rm -rf ./results

run  "rhtap/init.sh"
run  "rhtap/buildah-rhtap.sh"
run  "rhtap/cosign-sign-attest.sh"
run  "rhtap/acs-deploy-check.sh"
run  "rhtap/acs-image-check.sh"
run  "rhtap/acs-image-scan.sh"
run  "rhtap/update-deployment.sh"
run  "rhtap/show-sbom-rhdh.sh"
run  "rhtap/summary.sh"


tree ./results

# cleanup

rm -rf roxctl
rm -rf roxctl_image_check_output.json  roxctl_image_scan_output.json
rm -rf acs-deploy-check.json  acs-image-check.json  acs-image-scan.json
