NAME=$1
rsync -rv src/* ../${NAME}/node_modules/meta4helpers/src/

rsync -rv node_modules/* ../${NAME}/node_modules/meta4helpers/node_modules/
rsync -rv package.json ../${NAME}/node_modules/meta4helpers
