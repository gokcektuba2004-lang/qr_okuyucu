const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let lastValue = null;

function handleCode(value) {
  if (value === lastValue) return;

  lastValue = value;

  document.getElementById('result').textContent =
    'Okunan kod: ' + value;
}

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment'
    }
  });

  video.srcObject = stream;
  video.play();

  scanLoop();
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

function scanLoop() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const code = jsQR(
      imageData.data,
      imageData.width,
      imageData.height
    );

    if (code) {
      handleCode(code.data);
    }
  }

  requestAnimationFrame(scanLoop);
}

startBtn.addEventListener('click', startCamera);

document
  .getElementById('stopBtn')
  .addEventListener('click', stopCamera);

document
  .getElementById('fileInput')
  .addEventListener('change', function (e) {

    const file = e.target.files[0];

    if (!file) return;

    const img = new Image();

    img.onload = function () {

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      );

      if (code) {
        handleCode(code.data);
      } else {
        alert('Bu resimde QR kod bulunamadı.');
      }
    };

    img.src = URL.createObjectURL(file);
  });