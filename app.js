const URL = "./model/";

let model, webcam, maxPredictions;
let isWebcamRunning = false;

// Elements
const result = document.getElementById("result");
const webcamContainer = document.getElementById("webcam-container");
const startWebcamBtn = document.getElementById("startWebcam");
const stopWebcamBtn = document.getElementById("stopWebcam");

// 🔹 Load Model
async function loadModel() {
  try {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
    console.log("Model Loaded");
    // Enable webcam button after model loads
    startWebcamBtn.disabled = false;
  } catch (error) {
    console.error("Error loading model:", error);
    result.innerHTML = "<p>Error loading model. Check console for details.</p>";
  }
}

// Disable webcam button until model loads
startWebcamBtn.disabled = true;

loadModel();

// 🔹 WEBCAM FLOW
startWebcamBtn.addEventListener("click", async () => {
  try {
    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(webcam.canvas);

    isWebcamRunning = true;
    startWebcamBtn.disabled = true;
    stopWebcamBtn.disabled = false;

    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("Error starting webcam:", error);
    result.innerHTML = "<p>Error accessing webcam. Please allow camera permission and try again.</p>";
  }
});

stopWebcamBtn.addEventListener("click", () => {
  if (webcam) {
    webcam.stop();
    isWebcamRunning = false;
  }
  webcamContainer.innerHTML = "";
  startWebcamBtn.disabled = false;
  stopWebcamBtn.disabled = true;
  result.innerHTML = "";
});

async function loop() {
  if (webcam && model && isWebcamRunning) {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
  }
}

// 🔹 PREDICTION FUNCTION
async function predict(image) {
  if (!model) return;

  try {
    const predictions = await model.predict(image);

    predictions.sort((a, b) => b.probability - a.probability);
    const top = predictions[0];

    displayResult(top);
  } catch (error) {
    console.error("Error predicting:", error);
    result.innerHTML = "<p>Error during prediction. Check console for details.</p>";
  }
}

// 🔹 DISPLAY RESULT
function displayResult(top) {
  const percent = (top.probability * 100).toFixed(2);

  result.innerHTML = `
    <div class="card">
      <h2>${top.className}</h2>
      <p>Confidence: ${percent}%</p>
      <div class="confidence-bar" style="width:${percent}%"></div>
    </div>
  `;
}