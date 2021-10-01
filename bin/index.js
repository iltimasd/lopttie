#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
import fs from "fs";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import { dirname } from "path";
const args = arg(
  {
    "--quality": Number, //TODO: generalize png + jpeg
    "--jpegQuality": Number,
    "--pngQuality": Number,
    "--noop": Boolean,
    "--debug": Boolean,
    "--output": String,
    "--rewrite": Boolean, //TODO: Maybe not include?
    "--type": Boolean,
    "-q": "--quality",
    "-d": "--debug",
    "-o": "--output",
  },
  { permissive: false, argv: process.argv.slice(2) }
);

checkUnnamedArgCount();
let importedJson = JSON.parse(fs.readFileSync(args._[0]));

//convert args to global vars
let output = args["--output"];
let debug = args["--debug"];
let noop = args["--noop"];

if (args["--type"]) {
  logMimeType();
}
if (!noop) checkRequiredQualityArgs();

//end globals
if (debug) console.log(args);

//--main loop
if (args["--noop"]) {
  console.log(chalk.bgYellowBright.black("NOOP! WILL NOT OPTIMIZE"));
} else {
  console.log(chalk.bgBlue.white("compressing " + args._[0]));
  console.log("this line should not appear under nominal operation");
  await importedJson.assets.reduce(async (memo, obj, i) => {
    await memo;
    let { imageData, compressedImgBase64 } = await compressAndWriteLottieAssets(
      obj,
      i
    );
    // process.stdout.write("\x1b[H\x1b[2J");
    printCompresssionProgress(i, imageData, compressedImgBase64);
  });
  console.log(
    chalk.bgBlue.white(
      "Writing compressed Lottie to: " + (output ?? "export.json")
    )
  );
  writeFile(output ?? "export.json", JSON.stringify(importedJson));
}

function logMimeType() {
  let dataUri = importedJson.assets[0].p.slice(
    0,
    importedJson.assets[0].p.indexOf(",") + 1
  );
  let mimeType = dataUri.substring(
    dataUri.indexOf("/") + 1,
    dataUri.lastIndexOf(";")
  );
  console.log(
    chalk.magentaBright(
      `THIS LOTTIE IMAGE SEQUENCE IS USING ${chalk.bgMagentaBright.white(
        mimeType
      )}`
    )
  );
}

function checkRequiredQualityArgs() {
  let dataUri = importedJson.assets[0].p.slice(
    0,
    importedJson.assets[0].p.indexOf(",") + 1
  );
  let mimeType = dataUri.substring(
    dataUri.indexOf("/") + 1,
    dataUri.lastIndexOf(";")
  );
  let requiredQualityArg = `--${mimeType}Quality`;
  if (!args[requiredQualityArg]) {
    throw Error(`
  First frame of animation has a mime type of 
  ${chalk.red(mimeType)}
  Which means the following required arg is missing
  ${chalk.yellow(requiredQualityArg)}
  `);
  }
  console.log(
    chalk.bgYellowBright.black(
      `Reminder that ${requiredQualityArg} takes a value between`
    )
  );
}

//-- end main loop
// -----   Functions
function printCompresssionProgress(i, imageData, compressedImgBase64) {
  if (!debug) {
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1); // from cursor to end
  }
  console.log(
    i,
    "/",
    importedJson.assets.length,
    "|",
    imageData.length,
    compressedImgBase64.length,

    Number(
      (
        ((100 * (compressedImgBase64.length - imageData.length)) /
          (compressedImgBase64.length + imageData.length)) *
        0.5
      ).toFixed(2)
    ),
    "%  -->",
    imageData.length - compressedImgBase64.length,
    "bytes"
  );
}

async function compressAndWriteLottieAssets(obj, i) {
  let indexOfData = obj.p.indexOf(",") + 1;
  let imageData = obj.p.slice(indexOfData);
  let imageUriMeta = obj.p.slice(0, indexOfData);
  let imgAsBuffer = Buffer.from(imageData, "base64");
  if (debug) fs.writeFileSync("before.jpeg", imgAsBuffer);
  let compressedImgBuffer = await imagemin.buffer(imgAsBuffer, {
    destination: "build/images",
    plugins: [
      imageminMozjpeg({ quality: args["--jpegQuality"] }),
      imageminPngquant({
        speed: args["--pngQuality"],
        quality: [0, 0.3],
        strip: true,
        verbose: true,
      }),
    ],
  });
  if (debug) fs.writeFileSync("after.jpeg", compressedImgBuffer);

  let compressedImgBase64 = compressedImgBuffer.toString("base64");
  importedJson.assets[i].p = imageUriMeta + compressedImgBase64;
  return { imageData, compressedImgBase64 };
}

function checkUnnamedArgCount() {
  console.log(`Checking arg lengths...`);

  if (args._.length > 1) {
    throw Error(`
    ${chalk.bgRed(
      `Expected`
    )}: Only one unnamed argument allowed for path to Lottie file, 
     ${chalk.bgYellow.black("Recieved")}:
        ${args._.map((a, i) =>
          i ? chalk.bgRedBright.white(a) : chalk.green(a)
        )}
    `);
  }
}

function writeFile(path, contents, cb) {
  fs.mkdir(dirname(path), { recursive: true }, function (err) {
    if (err) return cb(err);

    fs.writeFileSync(path, contents, cb);
  });
}
