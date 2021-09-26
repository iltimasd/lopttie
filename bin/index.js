#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
import fs, { copyFileSync } from "fs";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
const args = arg(
  {
    "--quality": Number,
    "--noop": Boolean,
    "--debug": Boolean,
    "--output": String,
    "--rewrite": Boolean,
    "--output": String,
    "-q": "--quality",
  },
  { permissive: false, argv: process.argv.slice(2) }
);
//---ARGUMENT PREFLIGHT
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
//set defaults
let output = args["--output"];
let debug = args["--debug"];

console.log(chalk.bgBlue.white("compressing " + args._[0]));
//-- end arg preflight

let importedJson = JSON.parse(fs.readFileSync(args._[0]));
if (args["--noop"]) {
  console.log(chalk.bgYellowBright.black("NOOP! WILL NOT OPTIMIZE"));
} else {
  console.log("this line should not appear under nominal operation");
  await importedJson.assets.reduce(async (memo, obj, i) => {
    await memo;
    let indexOfData = obj.p.indexOf(",") + 1;
    let imageData = obj.p.slice(indexOfData);
    let imageUriMeta = obj.p.slice(0, indexOfData);
    let imgAsBuffer = Buffer.from(imageData, "base64");
    if (debug) fs.writeFileSync("before.jpeg", imgAsBuffer);
    let compressedImgBuffer = await imagemin.buffer(imgAsBuffer, {
      destination: "build/images",
      plugins: [
        imageminMozjpeg({ quality: 1 }),
        imageminPngquant({
          quality: [0.1, 0.1],
        }),
      ],
    });
    if (debug) fs.writeFileSync("after.jpeg", compressedImgBuffer);

    let compressedImgBase64 = compressedImgBuffer.toString("base64");
    // process.stdout.write("\x1b[H\x1b[2J");
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1); // from cursor to end
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
    importedJson.assets[i].p = imageUriMeta + compressedImgBase64;
  });
  console.log(
    chalk.bgBlue.white(
      "Writing compressed Lottie to: " + (output ?? "export.json")
    )
  );
  fs.writeFileSync(output ?? "export.json", JSON.stringify(importedJson));
}
