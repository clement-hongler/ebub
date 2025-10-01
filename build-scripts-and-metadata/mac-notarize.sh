APP_SHORT_NAME="Ebub"
APP_NAME="ebub" # Name of your app

APP_KEY="Developer ID Application: Clement Hongler (9SSFG2BX47)" # Your signing identity
APPLE_ID="clement.hongler@gmail.com"
TEAM_ID="9SSFG2BX47"
PASSWORD="aajz-xwsy-wxge-rizj"

CUR_DAY=$(date +"%Y-%m-%d")
TARGET_DIR="../../ebub-builds/$APP_NAME-$CUR_DAY"

cd $TARGET_DIR

LONG_APP_NAME="ebub-mac-arm"

APP_ZIP="${LONG_APP_NAME}-${CUR_DAY}.zip"
APP_DMG="${LONG_APP_NAME}-${CUR_DAY}.dmg"


xcrun notarytool store-credentials $APP_SHORT_NAME --apple-id $APPLE_ID --team-id $TEAM_ID --password $PASSWORD
xcrun notarytool submit $APP_DMG --keychain-profile $APP_SHORT_NAME --wait

LONG_APP_NAME="ebub-mac-x64"

APP_ZIP="${LONG_APP_NAME}-${CUR_DAY}.zip"
APP_DMG="${LONG_APP_NAME}-${CUR_DAY}.zip"


xcrun notarytool store-credentials $APP_SHORT_NAME --apple-id $APPLE_ID --team-id $TEAM_ID --password $PASSWORD
xcrun notarytool submit $APP_DMG --keychain-profile $APP_SHORT_NAME --wait
