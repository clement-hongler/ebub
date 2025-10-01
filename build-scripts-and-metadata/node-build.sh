#!/bin/bash
cd ..

APP_NAME=ebub
VERSION=$(jq -r '.version' package.json)
echo version=$VERSION

# Mac App Store Section
echo "STARTING MAC APP STORE BUILD"
cp package-mas.json package.json
npx electron-builder --mac mas --arm64 
npx electron-builder --mac mas --x64
cp package-all-but-mas.json package.json

echo "STARTING MAC BUILD"
npx electron-builder --mac --arm64
npx electron-builder --mac --x64
echo "STARTING LINUX BUILD"
npx electron-builder --linux --x64
echo "STARTING WINDOWS BUILD"
npx electron-builder --windows --x64


CUR_DAY=$(date +"%Y-%m-%d")
TARGET_DIR="../ebub-builds/$APP_NAME-$CUR_DAY"

rm -rf $TARGET_DIR/
mv dist/ $TARGET_DIR/

# Mac App Store Section
mv "$TARGET_DIR/mas-arm64/$APP_NAME-$VERSION-arm64.pkg" "$TARGET_DIR/$APP_NAME-mas-arm-$CUR_DAY.pkg"
mv "$TARGET_DIR/mas/$APP_NAME-$VERSION.pkg" "$TARGET_DIR/$APP_NAME-mas-x64-$CUR_DAY.pkg"

# Mac Normal Section
mv "$TARGET_DIR/$APP_NAME-$VERSION.dmg" "$TARGET_DIR/$APP_NAME-mac-x64-$CUR_DAY.dmg"
mv "$TARGET_DIR/$APP_NAME-$VERSION.dmg.blockmap" "$TARGET_DIR/$APP_NAME-mac-x64-$CUR_DAY.dmg.blockmap"
mv "$TARGET_DIR/$APP_NAME-$VERSION-mac.zip" "$TARGET_DIR/$APP_NAME-mac-x64-$CUR_DAY.zip"
mv "$TARGET_DIR/$APP_NAME-$VERSION-mac.zip.blockmap" "$TARGET_DIR/$APP_NAME-mac-x64-$CUR_DAY.zip.blockmap"
mv "$TARGET_DIR/$APP_NAME-$VERSION.AppImage" "$TARGET_DIR/$APP_NAME-mac-x64-$CUR_DAY.AppImage"
mv "$TARGET_DIR/mac" "$TARGET_DIR/mac-x64"

mv "$TARGET_DIR/$APP_NAME-$VERSION-arm64.dmg" "$TARGET_DIR/$APP_NAME-mac-arm-$CUR_DAY.dmg"
mv "$TARGET_DIR/$APP_NAME-$VERSION-arm64.dmg.blockmap" "$TARGET_DIR/$APP_NAME-mac-arm-$CUR_DAY.dmg.blockmap"
mv "$TARGET_DIR/$APP_NAME-$VERSION-arm64-mac.zip" "$TARGET_DIR/$APP_NAME-mac-arm-$CUR_DAY.zip"
mv "$TARGET_DIR/$APP_NAME-$VERSION-arm64-mac.zip.blockmap" "$TARGET_DIR/$APP_NAME-mac-arm-$CUR_DAY.zip.blockmap"
mv "$TARGET_DIR/mac-arm64" "$TARGET_DIR/mac-arm"

mv "$TARGET_DIR/$APP_NAME Setup $VERSION.exe" "$TARGET_DIR/$APP_NAME-win32-x64-$CUR_DAY.exe"
mv "$TARGET_DIR/$APP_NAME Setup $VERSION.exe.blockmap" "$TARGET_DIR/$APP_NAME-win32-x64-$CUR_DAY.exe.blockmap"

mv "${TARGET_DIR}/${APP_NAME}_${VERSION}_amd64.snap" "$TARGET_DIR/$APP_NAME-linux-amd64-$CUR_DAY.snap"

mkdir -p ../ebub-builds/build-scripts-and-metadata/
cp build-scripts-and-metadata/* ../ebub-builds/build-scripts-and-metadata/
