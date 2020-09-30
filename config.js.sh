INTERNAL="alma"
cat <<EOF
const config = {
  internal: "$INTERNAL",
  external: "$EXTERNAL" || "localhost"
}
EOF
