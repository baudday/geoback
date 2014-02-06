#!/bin/bash

export BRANCH=$1
git checkout $BRANCH

export COMMIT=$(git rev-parse --short HEAD)
export FILE=$COMMIT.tar.gz
export HOST=georeliefs.com

tar -cvzf $FILE --exclude='.git/*' --exclude='tmp/*' --exclude='README.md' --exclude='.gitignore' --exclude='env/*' --exclude='deploy.sh' *
scp -r $FILE ubuntu@$HOST:/home/ubuntu/ && sudo rm $FILE &&
ssh ubuntu@$HOST "cd /apps/arcapp-releases/ && sudo mkdir $COMMIT && sudo tar -xf /home/ubuntu/$FILE -C $COMMIT && rm /home/ubuntu/$FILE && cd /apps/arcapp-releases/$COMMIT && sudo mkdir -p tmp/logs/ && sudo cp /apps/arcapp-env/* env/ && cd /apps/arcapp-releases && sudo rm current && sudo ln -s /apps/arcapp-releases/$COMMIT /apps/arcapp-releases/current && sudo service arcapp restart"
