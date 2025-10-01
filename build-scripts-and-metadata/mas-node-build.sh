#!/bin/bash


cd ..

APP_NAME=ebub
VERSION=$(jq -r '.version' package.json)
echo version=$VERSION


npx electron-builder ---mac mas --arm64 
npx electron-builder --mac mas --x64

CUR_DAY=$(date +"%Y-%m-%d")
TARGET_DIR="../ebub-builds/$APP_NAME-$CUR_DAY"

# rm -rf $TARGET_DIR/
mv dist/ $TARGET_DIR/

mv "$TARGET_DIR/mas-arm64/$APP_NAME-$VERSION-arm64.pkg" "$TARGET_DIR/$APP_NAME-mas-arm-$CUR_DAY.pkg"
mv "$TARGET_DIR/mas/$APP_NAME-$VERSION.pkg" "$TARGET_DIR/$APP_NAME-mas-x64-$CUR_DAY.pkg"


mkdir -p ../ebub-builds/scripts/
cp scripts/* ../ebub-builds/scripts/
