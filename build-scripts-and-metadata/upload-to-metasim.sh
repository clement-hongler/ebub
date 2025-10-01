APP_NAME="ebub"
CUR_DAY=$(date +"%Y-%m-%d")
TARGET_DIR="../../ebub-builds/$APP_NAME-$CUR_DAY"
cd $TARGET_DIR
scp *.snap ubuntu@metasim.ch:/var/www/html/ebub/
scp *.pkg ubuntu@metasim.ch:/var/www/html/ebub/
scp *.dmg ubuntu@metasim.ch:/var/www/html/ebub/
scp *.exe ubuntu@metasim.ch:/var/www/html/ebub/

