document.addEventListener("DOMContentLoaded", function () {
  const bgInput = document.getElementById("bg-image");
  const fgInput = document.getElementById("fg-image");
  const textInput = document.getElementById("text-input");
  const fontSelect = document.getElementById("font-select");
  const fontSize = document.getElementById("font-size");
  const opacityRange = document.getElementById("opacity-range");
  const apiEndpoint = document.getElementById("api-endpoint");
  const previewArea = document.getElementById("preview-area");

  let background,
    foregrounds = [],
    texts = [];

  bgInput.addEventListener("change", handleBgUpload);
  fgInput.addEventListener("change", handleFgUpload);
  document.getElementById("add-text").addEventListener("click", addText);
  document
    .getElementById("generate-svg")
    .addEventListener("click", generateSVG);

  function handleBgUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        background = e.target.result;
        renderPreview();
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFgUpload(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function (e) {
        foregrounds.push({
          src: e.target.result,
          opacity: opacityRange.value / 100,
          x: 0,
          y: 0,
        });
        renderPreview();
      };
      reader.readAsDataURL(file);
    }
  }

  function addText() {
    texts.push({
      content: textInput.value,
      font: fontSelect.value,
      size: fontSize.value,
      color: "#000000",
      x: 0,
      y: 0,
    });
    renderPreview();
  }

  function renderPreview() {
    previewArea.innerHTML = "";
    if (background) {
      const bgImg = document.createElement("img");
      bgImg.src = background;
      bgImg.style.width = "100%";
      previewArea.appendChild(bgImg);
    }

    foregrounds.forEach((fg, index) => {
      const fgImg = document.createElement("img");
      fgImg.src = fg.src;
      fgImg.style.opacity = fg.opacity;
      fgImg.style.left = `${fg.x}px`;
      fgImg.style.top = `${fg.y}px`;
      fgImg.draggable = true;
      fgImg.ondragend = (e) => {
        fg.x = e.clientX - previewArea.offsetLeft;
        fg.y = e.clientY - previewArea.offsetTop;
        renderPreview();
      };
      previewArea.appendChild(fgImg);
    });

    texts.forEach((txt, index) => {
      const txtElem = document.createElement("div");
      txtElem.textContent = txt.content;
      txtElem.style.position = "absolute";
      txtElem.style.fontFamily = txt.font;
      txtElem.style.fontSize = `${txt.size}px`;
      txtElem.style.color = txt.color;
      txtElem.style.left = `${txt.x}px`;
      txtElem.style.top = `${txt.y}px`;
      txtElem.draggable = true;
      txtElem.ondragend = (e) => {
        txt.x = e.clientX - previewArea.offsetLeft;
        txt.y = e.clientY - previewArea.offsetTop;
        renderPreview();
      };
      previewArea.appendChild(txtElem);
    });
  }

  function generateSVG() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");

    if (background) {
      const bgImg = document.createElementNS(svgNamespace, "image");
      bgImg.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        background
      );
      bgImg.setAttribute("width", "500");
      bgImg.setAttribute("height", "500");
      svg.appendChild(bgImg);
    }

    foregrounds.forEach((fg, index) => {
      const fgImg = document.createElementNS(svgNamespace, "image");
      fgImg.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        fg.src
      );
      fgImg.setAttribute("x", fg.x);
      fgImg.setAttribute("y", fg.y);
      fgImg.setAttribute("opacity", fg.opacity);
      svg.appendChild(fgImg);
    });

    texts.forEach((txt, index) => {
      const text = document.createElementNS(svgNamespace, "text");
      text.textContent = txt.content;
      text.setAttribute("x", txt.x);
      text.setAttribute("y", txt.y);
      text.setAttribute("font-family", txt.font);
      text.setAttribute("font-size", txt.size);
      text.setAttribute("fill", txt.color);
      svg.appendChild(text);
    });

    const cdataScript = document.createElementNS(svgNamespace, "script");
    cdataScript.setAttribute("type", "text/javascript");
    const cdata = `
        <![CDATA[
            fetch('${apiEndpoint.value}')
            .then(response => response.json())
            .then(data => {
                const attributes = data.attributes;
                attributes.forEach(attr => {
                    if (attr.trait_type === 'usage_count' && attr.value > 0) {
                        // Show image and text if condition is met
                    } else {
                        // Hide image and text if condition is not met
                    }
                });
            });
        ]]>`;
    cdataScript.appendChild(document.createTextNode(cdata));
    svg.appendChild(cdataScript);

    previewArea.innerHTML = "";
    previewArea.appendChild(svg);
  }
});
