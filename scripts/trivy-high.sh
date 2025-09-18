# Run Trivy to check for vulnerabilities in the filesystem
trivy fs --exit-code 1 --severity HIGH,CRITICAL . || {
  echo "Trivy found high/critical vulnerabilities. Commit aborted."
  exit 1
}
