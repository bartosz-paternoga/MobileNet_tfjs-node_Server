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
let img;
let mn_model;


const storage = multer.memoryStorage()
const upload =  multer({ storage }).single('selectedFile');


app.post('/', upload, (req, res, next) => {

    console.log('Uploaded: ', req.file)
    console.log('<<<----------------------------------------->>>')

    img = req.file.buffer;

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
  mn.path = `file://./client/public/mobilenet/model.json`
  await mn.load()
  return mn
}

const classify = async () => {

  console.log("------------------------------------------");
  console.log("memoryUsage classify start:", memoryUsage())

  const image = readImage()
  console.log("memoryUsage classify readImage:", memoryUsage())

  const input = imageToInput(image, NUMBER_OF_CHANNELS)
  console.log("memoryUsage classify input:", memoryUsage())


  if (!mn_model) {
    mn_model = await loadModel()
  }

  console.log("memoryUsage classify loadModel:", memoryUsage())

  const predictions = await mn_model.classify(input)
  console.log("memoryUsage classify predictions:", memoryUsage())

  const x = JSON.stringify(predictions);

  const y = x.toString();

  z = y.replace(/"|"|{|}|\'/g,'');

  console.log("------------------------------------------");
  console.log("memoryUsage BEFORE dispose:", memoryUsage())
  
  // free memory from TF-internal libraries from input image
  input.dispose()
  
  console.log("------------------------------------------");
  console.log("memoryUsage AFTER dispose:", memoryUsage())
}


const prediction  = async  (req, res, next) => {

  try {
      const pred = await classify();

  } catch (e) {
        next(e);
      }
      next()
}


const memoryUsage = () => {
  let used = process.memoryUsage();
  const values = []
  for (let key in used) {
    values.push(`${key}=${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }

  return `memory used: ${values.join(', ')}`
}



app.post('/', prediction, (req, res, next) => {

  console.log("server side analysed!");
  console.log(z);
  res.send(z);

  next();
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => console.log(`Server listening on port ${port}`));


