#!/usr/bin/env sh

set -e

cd src/content && git add . && git commit -m 'feat(blog): update' && git push

cd -