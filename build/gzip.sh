#!/bin/bash
find ./publish -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.otf"| while read FILE; do echo "gzipping $FILE"; touch $FILE; gzip -9 -c $FILE >$FILE.gz; done
