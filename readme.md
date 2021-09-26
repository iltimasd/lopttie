# Lopttie
Lopttie is a Lottie optimization node CLI tool for compressing image sequences.

## Installation

To install you can git clone this repo, run the following to to install Lopttie globally 

`npm install -g .` 

[TODO: add pkg instructions once published]

## Usage

```html 
lopttie <path> <quality>
```

The only required arguments to lopttie is the path to the Lottie/Bodymovin json to be compressed and one of the relevant quality arguments.

Lottie seqeunces can be either jpegs or pngs. Depending on which type the sequence you want to compress uses you will either pass the `--jpegQuality` paramater or the `--pngQuality` parameter. 

If you don't know what type of image your animation uses, you can run

`lopttie --noop --type`

and lopttie will log the image type

See parameter list for more details.

##Parameters

```
    lopttie <path>

    <path> : 
        Path to uncompressed Lottie JSON file
    --type: Boolean,
        Will log the image type of the sequence, 
        recommended to run with --noop flag
    --jpegQuality: Number,
        REQUIRED IF image type is jpeg. 
        Takes an interger between 0-100
    --pngQuality": Number,
        REQUIRED IF image type is png. 
        Takes an interger between 1-11
    --noop: Boolean, 
        Passing this flag will skip the main compression step, 
        this is handy if you want to log the --type, 
        and non-compression realted debuggin
    --debug: Boolean,
        Will log the detected arguments. 
        ADDITONALLY. Will write the last frame before 
        AND after compression for testing.
    --output: String,
        Path and name of exported JSON
```

## Development

TODO:
-start will run loptie with no args, probably not helpful?
-update will install/update the pkg with latest saved
-watch will run update everytime index is saved. maybe rename to dev
-test lol