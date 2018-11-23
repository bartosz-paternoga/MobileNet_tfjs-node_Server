const port = process.env.PORT || 3001;
const express = require('express');
const path = require('path');
const multer = require('multer');
const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
require('@tensorflow/tfjs-node')

const app = express();
app.use(express.static('client/build'));

let z;
let img ;


const storage = multer.memoryStorage()
const upload =  multer({ storage }).single('selectedFile');


app.post('/', upload, (req, res, next) => {

    console.log('Uploaded: ', req.file)
    console.log('<<<----------------------------------------->>>')
    console.log('buffor: ', req.file.buffer)

    img = req.file.buffer;
    console.log('img: ', img)
    next();
});


const fs = require('fs');
const jpeg = require('jpeg-js');

const NUMBER_OF_CHANNELS = 3

const readImage = () => {
  const buf = img;
  const pixels = jpeg.decode(buf, true)
  return pixels
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
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
  mn.path = `file://./client/build/mobilenet/model.json`
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

  z = y.replace(/"|"|{|}|\'/g,'');

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



app.post('/', myLogger, (req, res, next) => {

  console.log("server side analysed!");
  res.send(z);

  next();
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => console.log(`Server listening on port ${port}`));


