#!/bin/bash

if ! command -v magick &>/dev/null; then
	echo "magick could not be found"
	exit 1
fi

if [ "$#" -ne 2 ]; then
	echo "Usage: $0 <input_file> <output_file>"
	exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
mkdir -p "$OUTPUT_DIR"

magick "$INPUT_FILE" \
	-trim +repage \
	-resize 512x512 \
	-gravity center \
	-background none \
	"$OUTPUT_FILE"
