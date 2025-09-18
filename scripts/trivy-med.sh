# Run a non-blocking Trivy check for MEDIUM and LOW vulnerabilities
trivy fs --exit-code 0 --severity MEDIUM,LOW . || {
  echo "Trivy found medium/low vulnerabilities (non-blocking)."
}
