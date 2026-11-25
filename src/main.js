import QRCode from "qrcode";
import "./style.css";
import { Html5Qrcode } from "html5-qrcode";

const app = document.querySelector("#app");

const categories = [
  { id: "website", label: "Website", icon: "↗" },
  { id: "text", label: "Text", icon: "T" },
  { id: "wifi", label: "Wi-Fi", icon: "⌁" },
  { id: "phone", label: "Phone", icon: "☎" },
  { id: "sms", label: "SMS", icon: "✉" },
  { id: "email", label: "Email", icon: "✉" },
  { id: "contact", label: "Contact", icon: "♙" },
  { id: "location", label: "Location", icon: "⌖" },
  { id: "instagram", label: "Instagram", icon: "◎" }
];

let selected = "website";
let qrData = "";

app.innerHTML = `
<div class="app-shell">
  <header class="topbar">
    <div class="brand">
      <div class="brand-icon">Q</div>
      <div>
        <h1>QORIX</h1>
        <span>QR EXPERIENCE</span>
      </div>
    </div>
    <div class="brand-tag">BY <b>RUPAK</b></div>
  </header>

  <section class="hero">
    <div class="hero-badge"><span class="pulse"></span> QR STUDIO</div>
    <h2>Create your<br><span>digital identity.</span></h2>
    <p>Generate beautiful QR codes instantly.</p>
  </section>

  <div class="workspace">

<section class="panel scanner-panel">
  <div class="panel-head">
    <h3>QR Scanner</h3>
    <span class="panel-label">SCAN</span>
  </div>

  <div id="scanner-box">
    <div id="reader"></div>
  </div>

  <div class="scanner-actions">
    <button id="scan-start" class="generate-btn">Start Camera</button>
    <button id="scan-stop" class="download-btn" disabled>Stop Camera</button>
  </div>

  <div id="scan-result">
    Scanned result will appear here.
  </div>
</section>
<section class="panel history-panel">
  <div class="panel-head">
    <h3>QR History</h3>
    <span class="panel-label">RECENT</span>
  </div>
  <div id="qrHistory">
    <p class="history-empty">Your recent QR codes will appear here.</p>
  </div>
  <button id="clearHistory" class="download-btn">Clear History</button>
</section>
    <section class="panel generator">
      <div class="panel-head">
        <h3>Create QR</h3>
        <span class="panel-label">01 / CREATE</span>
      </div>

      <div class="categories" id="categories"></div>

      <div id="form-area"></div>

      <button class="generate-btn" id="generate">
        Generate QR <span>↗</span>
      </button>
    </section>

    <section class="panel preview">
      <div class="panel-head">
        <h3>Preview</h3>
        <span class="panel-label">02 / OUTPUT</span>
      </div>

      <div class="qr-stage">
        <div class="qr-card">
          <div id="qr-placeholder">
            <div class="placeholder-icon">⌗</div>
            <p>Your QR will appear here</p>
          </div>
          <canvas id="qr-canvas"></canvas>
          <div id="qr-brand">QORIX · RUPAK</div>
        </div>
      </div>
<div class="custom-panel">
  <h4>QR CUSTOMIZATION</h4>
<div class="logo-upload">
  <label for="logo-input">Upload QR Logo</label>
  <input type="file" id="logo-input" accept="image/*">
  <button type="button" id="remove-logo" class="download-btn">Remove Logo</button>
</div>
  <div class="color-controls">
    <div class="color-field">
      <label>QR Color</label>
      <input type="color" id="qr-color" value="#111827">
    </div>

    <div class="color-field">
      <label>Background</label>
      <input type="color" id="bg-color" value="#ffffff">
    </div>
  </div>

  <div class="presets">
    <button class="preset" data-dark="#111827" data-light="#ffffff" style="background:#111827"></button>
    <button class="preset" data-dark="#7c3aed" data-light="#ffffff" style="background:#7c3aed"></button>
    <button class="preset" data-dark="#0f766e" data-light="#ffffff" style="background:#0f766e"></button>
    <button class="preset" data-dark="#be123c" data-light="#ffffff" style="background:#be123c"></button>
    <button class="preset" data-dark="#ffffff" data-light="#111827" style="background:#ffffff"></button>
    <button class="preset" data-dark="#2563eb" data-light="#fef3c7" style="background:#2563eb"></button>
  </div>
</div>
      <div class="preview-bottom">
        <div>
          <span class="status-dot"></span>
          <span id="status">Waiting for input</span>
        </div>
        <button id="download" class="download-btn" disabled>
          Download PNG ↓
        </button>
      </div>
    </section>
  </div>

  <footer>
    <span>QORIX STUDIO</span>
    <span>CRAFTED BY RUPAK</span>
  </footer>
</div>
`;

const categoryContainer = document.querySelector("#categories");
const formArea = document.querySelector("#form-area");
const canvas = document.querySelector("#qr-canvas");
const placeholder = document.querySelector("#qr-placeholder");
const downloadBtn = document.querySelector("#download");
const statusText = document.querySelector("#status");

function renderCategories() {
  categoryContainer.innerHTML = categories.map(c => `
    <button class="category ${selected === c.id ? "active" : ""}"
      data-id="${c.id}">
      <span class="category-icon">${c.icon}</span>
      <span>${c.label}</span>
    </button>
  `).join("");

  categoryContainer.querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {
      selected = btn.dataset.id;
      renderCategories();
      renderForm();
    });
  });
}

function renderForm() {
  const fields = {
    website: [
      ["url", "Website URL", "https://example.com"]
    ],
    text: [
      ["text", "Your text", "Enter your text"]
    ],
    wifi: [
      ["ssid", "Wi-Fi name", "Network name"],
      ["password", "Wi-Fi password", "Password"],
      ["security", "Security", "WPA"]
    ],
    phone: [
      ["phone", "Phone number", "+91"]
    ],
    sms: [
  ["smsphone", "Recipient phone number", "+91"],
  ["smsmessage", "SMS message", "Write your message"]
],
    email: [
      ["email", "Email address", "example@email.com"],
      ["subject", "Subject", "Subject"],
      ["message", "Message", "Message"]
    ],
    contact: [
      ["name", "Full name", "Name"],
      ["phone", "Phone number", "+91"],
      ["email", "Email address", "Email"]
    ],
    location: [
      ["location", "Location / Coordinates", "Latitude, Longitude"]
    ],
    instagram: [
      ["instagram", "Instagram username", "@username"]
    ]
  };

  const selectedFields = fields[selected] || [];

  formArea.innerHTML = `
    <div class="fields">
      ${selectedFields.map(([id, label, placeholder]) => `
        <div class="field">
          <label for="${id}">${label}</label>
          <input id="${id}" placeholder="${placeholder}"
            ${id === "message" || id === "text" ? "" : ""}
            ${id === "password" ? 'type="password"' : ""}
          />
        </div>
      `).join("")}
    </div>
  `;
}

function getData() {
  const val = id => document.getElementById(id)?.value.trim() || "";

  switch (selected) {
    case "website":
      return val("url");

    case "text":
      return val("text");

    case "wifi":
      return `WIFI:T:${val("security") || "WPA"};S:${val("ssid")};P:${val("password")};;`;

    case "phone":
      return `tel:${val("phone")}`;
      case "sms":
  return `SMSTO:${val("smsphone")}:${val("smsmessage")}`;

    case "email":
      return `mailto:${val("email")}?subject=${encodeURIComponent(val("subject"))}&body=${encodeURIComponent(val("message"))}`;

    case "contact":
      return `BEGIN:VCARD
VERSION:3.0
FN:${val("name")}
TEL:${val("phone")}
EMAIL:${val("email")}
END:VCARD`;

    case "location":
      return `https://maps.google.com/?q=${encodeURIComponent(val("location"))}`;

    case "instagram":
      return `https://instagram.com/${val("instagram").replace("@", "")}`;

    default:
      return "";
  }
}

document.querySelector("#generate").addEventListener("click", async () => {
  qrData = getData();

  if (!qrData) {
    alert("Please enter the required information.");
    return;
  }

  try {
    await QRCode.toCanvas(canvas, qrData, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
  dark: document.querySelector("#qr-color").value,
  light: document.querySelector("#bg-color").value
}
    });

    canvas.style.display = "block";
    if (uploadedLogo && uploadedLogo.complete) {
  const ctx = canvas.getContext("2d");
  const logoSize = 60;
  const x = (canvas.width - logoSize) / 2;
  const y = (canvas.height - logoSize) / 2;

  ctx.fillStyle = document.querySelector("#bg-color").value;
  ctx.beginPath();
  ctx.roundRect(x - 5, y - 5, logoSize + 10, logoSize + 10, 10);
  ctx.fill();

  ctx.drawImage(uploadedLogo, x, y, logoSize, logoSize);
}
    placeholder.style.display = "none";
    document.querySelector("#qr-brand").style.display = "block";
const historyItem = {
  data: qrData,
  date: new Date().toLocaleString()
};

let history = JSON.parse(localStorage.getItem("qorix-history") || "[]");
history.unshift(historyItem);
history = history.slice(0, 10);
localStorage.setItem("qorix-history", JSON.stringify(history));
renderHistory();
    statusText.textContent = "QR successfully generated";
    downloadBtn.disabled = false;

  } catch (error) {
    alert("QR generation failed.");
    console.error(error);
  }
});

downloadBtn.addEventListener("click", () => {
  if (!qrData) return;

  const output = document.createElement("canvas");
  const ctx = output.getContext("2d");

  output.width = 320;
  output.height = 360;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, output.width, output.height);

  ctx.drawImage(canvas, 20, 20, 280, 280);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("QORIX", 160, 325);

  ctx.fillStyle = "#777777";
  ctx.font = "11px Arial";
  ctx.fillText("CREATED BY RUPAK", 160, 344);

  const link = document.createElement("a");
  link.download = "QORIX-RUPAK.png";
  link.href = output.toDataURL("image/png");
  link.click();
});

renderCategories();
renderForm();

document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector("#qr-color").value = btn.dataset.dark;
    document.querySelector("#bg-color").value = btn.dataset.light;
  });
});
let scanner = null;
let scanning = false;

const startScanBtn = document.querySelector("#scan-start");
const stopScanBtn = document.querySelector("#scan-stop");
const scanResult = document.querySelector("#scan-result");

startScanBtn.addEventListener("click", async () => {
  if (scanning) return;

  try {
    scanner = new Html5Qrcode("reader");

    const cameras = await Html5Qrcode.getCameras();

    if (!cameras || cameras.length === 0) {
      scanResult.textContent = "No camera found.";
      return;
    }

    await scanner.start(
      cameras[0].id,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        scanResult.textContent = "Scanned: " + decodedText;

        if (scanner && scanning) {
          await scanner.stop();
          scanning = false;
          startScanBtn.disabled = false;
          stopScanBtn.disabled = true;
        }
      },
      () => {}
    );

    scanning = true;
    startScanBtn.disabled = true;
    stopScanBtn.disabled = false;
    scanResult.textContent = "Camera is scanning...";

  } catch (error) {
    scanResult.textContent = "Camera error: " + error;
  }
});

stopScanBtn.addEventListener("click", async () => {
  if (scanner && scanning) {
    await scanner.stop();
    scanning = false;
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
    scanResult.textContent = "Scanner stopped.";
  }
});
function renderHistory() {
  const container = document.getElementById("qrHistory");
  const history = JSON.parse(localStorage.getItem("qorix-history") || "[]");

  if (!container) return;

  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = '<p class="history-empty">Your recent QR codes will appear here.</p>';
    return;
  }

  history.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "history-item";

    const text = document.createElement("p");
    text.textContent = item.data;

    const date = document.createElement("small");
    date.textContent = item.date;

    const button = document.createElement("button");
    button.textContent = "Copy";
    button.className = "download-btn";

    button.onclick = async () => {
      await navigator.clipboard.writeText(item.data);
      button.textContent = "Copied!";
      setTimeout(() => button.textContent = "Copy", 1500);
    };
const reuseButton = document.createElement("button");
reuseButton.textContent = "Reuse";
reuseButton.className = "download-btn";

reuseButton.onclick = () => {
  const input = document.querySelector("#text");
  if (input) {
    input.value = item.data;
    input.dispatchEvent(new Event("input"));
  }
};
    div.append(text, date, button, reuseButton);
    container.appendChild(div);
  });
}

document.getElementById("clearHistory")?.addEventListener("click", () => {
  localStorage.removeItem("qorix-history");
  renderHistory();
});

renderHistory();let uploadedLogo = null;

const logoInput = document.getElementById("logo-input");
const removeLogoBtn = document.getElementById("remove-logo");

logoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      uploadedLogo = image;

      const canvas = document.getElementById("qr-canvas");

      if (canvas && canvas.style.display === "block") {
        document.getElementById("generate")?.click();
      }
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

removeLogoBtn?.addEventListener("click", () => {
  uploadedLogo = null;
  logoInput.value = "";

  const canvas = document.getElementById("qr-canvas");

  if (canvas && canvas.style.display === "block") {
    document.getElementById("generate")?.click();
  }
});

removeLogoBtn?.addEventListener("click", () => {
  uploadedLogo = null;
  logoInput.value = "";
});
