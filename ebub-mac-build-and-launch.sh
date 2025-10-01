#!/bin/bash
# Builds the app for various platforms

# {?} should be optimized to build for mac, windows and linux platforms

PROJECT_NAME=ebub
SOURCE_DIR="."
BUILD_DIR=../$PROJECT_NAME-builds
SIGNED_DIR=$BUILD_DIR/signed
MAC_ARM_TARGET_DIR=$BUILD_DIR/$PROJECT_NAME-mac-arm.app
MAC_ARM_TARGET_SUBDIR=$MAC_ARM_TARGET_DIR/Contents/Resources/app
MAC_X64_TARGET_DIR=$BUILD_DIR/$PROJECT_NAME-mac-x64.app
MAC_X64_TARGET_SUBDIR=$MAC_X64_TARGET_DIR/Contents/Resources/app

TARGET_DIRS=("$MAC_ARM_TARGET_DIR" "$MAC_X64_TARGET_DIR")

mkdir -p $BUILD_DIR/
mkdir -p $SIGNED_DIR/
#echo "build dir: $BUILD_DIR signed_dir: $SIGNED_DIR"
# cp -r * $MAC_X86_TARGET/
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
    echo "target dir: $TARGET_DIR"
    TARGET_SUBDIR=$TARGET_DIR/Contents/Resources/app
    mkdir -p $TARGET_SUBDIR/
    cp -r $SOURCE_DIR/ebub-frontend $TARGET_SUBDIR/
    cp -r $SOURCE_DIR/ebub-backend $TARGET_SUBDIR/
    cp -r $SOURCE_DIR/ebub-resources $TARGET_SUBDIR/
    cp -r $SOURCE_DIR/ebub-external-libs $TARGET_SUBDIR/
    cp $SOURCE_DIR/*.json $TARGET_SUBDIR/
    cp $SOURCE_DIR/*.html $TARGET_SUBDIR/

done

open $MAC_ARM_TARGET_DIR
