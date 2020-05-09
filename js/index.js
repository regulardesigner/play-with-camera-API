const constraints = {
  audio: true,
  video: {
    width: { exact: 480 },
    height: { exact: 480 },
  }
}
//
const error = document.querySelector('.error');
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
const mediaStream = new MediaStream();
const video = document.querySelector('.video');
const audio = document.querySelector('.audio');
let recordedChunks = [];
//
function getVideo() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(mediaStream => {
      video.srcObject = mediaStream;
      audio.srcObject = mediaStream;
      video.onloadedmetadata = function (e) {
        video.play();
        paintOnCanvas();
      }
    })
    .catch(err => {
      error.innerHTML = `Oupssss... ${err.name}: ${err.message}`;
    })
}

function paintOnCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  //
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  //
  const fullDate = `${month}/${day}/${year}`;
  //
  const dayOne = new Date('March 17, 2020');
  const today = new Date(`${month} ${day}, ${year}`);

  function howManyDaysBetween(day0, dayX) {
    const daysBetween = dayX.getTime() - day0.getTime();
    return Math.ceil(daysBetween / (1000 * 60 * 60 * 24));
  }

  const numberOfDays = howManyDaysBetween(dayOne, today) + 1;

  function generateHashtag(nmb) {
    return nmb < 10 ? `#DAY0${nmb}` : `#DAY${nmb}`;
  }

  const effectsSwitcher = document.getElementsByName("effects");
  // get the checked value
  function switchEffects(radio) {
    for (let index = 0; index < radio.length; index++) {
      if(radio[index].checked) return radio[index].value;      
    }
  }
  //
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them switch
    var selectedEffect = switchEffects(effectsSwitcher)

    switch (selectedEffect) {
      case '2':
        pixels = rgbEffect(pixels)
        break;
      case '1':
        pixels = redEffect(pixels)
        break;
    
      default:
        pixels = pixels
        break;
    }
    // put them back
    ctx.putImageData(pixels, 0, 0);
    // add text on canvas
    addTextToCanvas('Daily Journal', fullDate, '20', `#COVID19 ${generateHashtag(numberOfDays)}`);
  }, 40);
}
// canvas effects
function redEffect(pxls) {
  for (let index = 0; index < pxls.data.length; index+=4) {
    pxls.data[index + 0] = pxls.data[index + 0] + 200;  // red
    pxls.data[index + 1] = pxls.data[index + 1] - 50;   // green
    pxls.data[index + 2] = pxls.data[index + 2] * .45;  // blue
  }
  return pxls;
}

function rgbEffect(pxls) {
  for (let index = 0; index < pxls.data.length; index+=4) {
    pxls.data[index - 150] = pxls.data[index + 0];  // red
    pxls.data[index + 100] = pxls.data[index + 1];  // green
    pxls.data[index - 150] = pxls.data[index + 2];  // blue
  }
  return pxls;
}

function addTextToCanvas(title, date, duration, theme) {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 3;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'right';
  function addTitle() {
    ctx.font = 'Bold 16px Monospace';
    ctx.fillText(title, 470, 24);
  }
  function addDuration() {
    ctx.font = '14px Monospace';
    // ctx.fillText(`${date} - ${duration}sec`, 470, 44);
    ctx.fillText(`${date}`, 470, 44);
  }
  function addtheme() {
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#39F';
    var width = ctx.measureText(theme).width;
    var themeTitle = [...theme];
    width = themeTitle.length * 10.8 + 16;
    var center = (canvas.width - width) / 2;
    ctx.fillRect(center, 440, width, 27);
    ctx.font = 'bold 18px Monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(`${theme}`, 240, 460);
  }
  addTitle();
  addDuration();
  addtheme();
}
// start record function 
function startRecord(duration) {
  // Get the Video from the canvas
  var stream = canvas.captureStream(25);
  stream.addTrack(audio.srcObject.getAudioTracks()[0]);
  // Video export extention and MediaRecorder object
  var options = { mineType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
}
// stop record function
function stopRecord() {
  mediaRecorder.stop();
  recordedChunks = [];
}
//
function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();
  } else {
    // ...
  }
}
//
// download the recorded video
function download() {
  var date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  //
  var blob = new Blob(recordedChunks, {
    type: "video/webm"
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = `daily_journal_${month}_${day}_${year}_${hours}h_${minutes}m_${seconds}s_.mp4`;
  a.click();
  window.URL.revokeObjectURL(url);
}
//
getVideo();