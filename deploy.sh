#!/bin/bash

export BRANCH=$1
git checkout $BRANCH

export COMMIT=$(git rev-parse --short HEAD)
export FILE=$COMMIT.tar.gz
export HOST=georeliefs.com

tar -cvzf $FILE --exclude='.git/*' --exclude='tmp/*' --exclude='package.json' --exclude='README.md' --exclude='.gitignore' --exclude='env/*' --exclude='deploy.sh' *
scp -r $FILE ubuntu@$HOST:/apps/arcapp-releases/ && sudo rm $FILE &&
ssh ubuntu@$HOST "sudo su && cd /apps/arcapp-releases/ && mkdir $COMMIT && tar -xf $FILE -C $COMMIT && rm $FILE && cd /apps/arcapp-releases/$COMMIT && mkdir -p tmp/logs/ && cp /apps/arcapp-env/ env/"
