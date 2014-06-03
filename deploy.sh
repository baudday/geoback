#!/bin/bash

export BRANCH=$1
export ENV=$2
git checkout $BRANCH

export COMMIT=$(git rev-parse --short HEAD)
export FILE=$COMMIT.tar.gz

if [ $ENV -eq "dev" ] ; then
  export HOST="162.249.6.123"
  export USER="root"
  export PORT=7822
fi

if [ $ENV -eq "prod" ] ; then
  export HOST="georeliefs.com"
  export USER="ubuntu"
  export PORT=22
fi

tar -cvzf $FILE --exclude='.git/*' --exclude='tmp/*' --exclude='README.md' --exclude='.gitignore' --exclude='env/*' --exclude='deploy.sh' *
scp -r -p $PORT $FILE $USER@$HOST:/home/$USER/ && sudo rm $FILE &&
ssh -p $PORT $USER@$HOST "cd /apps/arcapp-releases/ && sudo mkdir $COMMIT && sudo tar -xf /home/ubuntu/$FILE -C $COMMIT && rm /home/ubuntu/$FILE && cd /apps/arcapp-releases/$COMMIT && sudo mkdir -p tmp/logs/ && sudo cp /apps/arcapp-env/* env/ && cd /apps/arcapp-releases && sudo rm /apps/arcapp && sudo ln -s /apps/arcapp-releases/$COMMIT /apps/arcapp && sudo service arcapp restart"
