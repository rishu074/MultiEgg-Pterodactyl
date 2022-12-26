ncc build index.js
rm -rf ./nccbuild/fonts
rm -rf ./nccbuild/index.js

mv ./dist/* ./nccbuild/
rm -rf dist 
cd nccbuild
pkg .
mv new_egg ../egg-binary
cd ../

docker build -t royadma960/eggpeone:dev .
docker push royadma960/eggpeone:dev