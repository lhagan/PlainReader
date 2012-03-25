#!/bin/bash
pushd ../publish
find . -name "*.js" -o -name "*.css" -o -name "*.html" | while read FILE; do echo "gzipping $FILE"; touch $FILE; gzip -9 -c $FILE >$FILE.gz; done
popd
