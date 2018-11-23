const port = process.env.PORT || 3001;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const path = require('path');
const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
require('@tensorflow/tfjs-node')

const app = express();

let z = [];

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
        cb(null, './client/public');
      },

  filename: (req, file, cb) => {
        const newFilename = "pic";
        cb(null, newFilename);
      },

  });

 const upload =  multer({ storage }).single('selectedFile');


const fs = require('fs');
const jpeg = require('jpeg-js');

const NUMBER_OF_CHANNELS = 3

const readImage = () => {
  const buf = fs.readFileSync('./client/public/pic')
  const pixels = jpeg.decode(buf, true)
  return pixels
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values
}

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels)
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, 'int32');

  return input
}

const loadModel = async path => {
  const mn = new mobilenet.MobileNet(1, 1);
  mn.path = `file://./client/public/mobilenet/model.json`
  await mn.load()
  return mn
}

const classify = async () => {
  const image = readImage()
  const input = imageToInput(image, NUMBER_OF_CHANNELS)

  const  mn_model = await loadModel()
  const predictions = await mn_model.classify(input)

  const x = JSON.stringify(predictions);

  const y = x.toString();

  const v = y.replace(/"|"|{|}|\'/g,'');

  z.push(v);

}


const myLogger  = async  (req, res, next) => {

  try {
      const y = await classify();
      console.log('<<<------------------------------------------->>>')
      console.log(z);
  } catch (e) {
         next(e);
      }
      next()
}


app.post('/', upload, (req, res, next) => {

  console.log("server uploaded!");
  res.send("res.send - server UPL");

  next();
          });


app.post('/1', myLogger, (req, res, next) => {

  console.log("server analysed!");
  const latest = z[z.length-1];
  res.send(latest.toString());

  next();
});


app.listen(port, () => console.log(`Server listening on port ${port}`));


