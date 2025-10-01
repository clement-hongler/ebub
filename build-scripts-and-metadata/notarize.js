// Not clear that it's needed in any way

const { notarize } = require("electron-notarize");
console.log("Doing the after sign");
exports.default = async function notarizeApp(context) {
  const { electronPlatformName, appOutDir } = context;
  console.log("Notarizing started");

  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: "ch.metasim.ch",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "clement.hongler@gmail.com",
    appleIdPassword: "aajz-xwsy-wxge-rizj",
    teamId: "9SSFG2BX47",
  });
  console.log("Notarizing finished");
};
