let backgroundImage, foregroundImage;

document.getElementById("background").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    backgroundImage = event.target.result;
    updateCanvas();
  };
  reader.readAsDataURL(e.target.files[0]);
});

document.getElementById("foreground").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    foregroundImage = event.target.result;
    updateCanvas();
  };
  reader.readAsDataURL(e.target.files[0]);
});

document.getElementById("opacity").addEventListener("input", updateCanvas);
document.getElementById("text").addEventListener("input", updateCanvas);
document.getElementById("font").addEventListener("change", updateCanvas);
document.getElementById("fontSize").addEventListener("input", updateCanvas);
document.getElementById("color").addEventListener("input", updateCanvas);
document.getElementById("bold").addEventListener("change", updateCanvas);
document.getElementById("italic").addEventListener("change", updateCanvas);
document
  .getElementById("strikethrough")
  .addEventListener("change", updateCanvas);

function updateCanvas() {
  const text = document.getElementById("text").value;
  const font = document.getElementById("font").value;
  const fontSize = document.getElementById("fontSize").value;
  const color = document.getElementById("color").value;
  const bold = document.getElementById("bold").checked ? "bold" : "normal";
  const italic = document.getElementById("italic").checked
    ? "italic"
    : "normal";
  const strikethrough = document.getElementById("strikethrough").checked
    ? "line-through"
    : "none";
  const opacity = document.getElementById("opacity").value / 100;

  const svg = document.getElementById("canvas");
  svg.innerHTML = ""; // Clear the canvas

  // Add background image
  if (backgroundImage) {
    const bgImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    bgImage.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      backgroundImage
    );
    bgImage.setAttribute("width", "100%");
    bgImage.setAttribute("height", "100%");
    svg.appendChild(bgImage);
  }

  // Add foreground image
  if (foregroundImage) {
    const fgImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    fgImage.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      foregroundImage
    );
    fgImage.setAttribute("width", "50%");
    fgImage.setAttribute("height", "50%");
    fgImage.setAttribute("x", "25%");
    fgImage.setAttribute("y", "25%");
    fgImage.setAttribute("opacity", opacity);
    fgImage.setAttribute("id", "foreground-img");
    svg.appendChild(fgImage);
  }

  // Add text
  if (text) {
    const svgText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    svgText.setAttribute("x", "50%");
    svgText.setAttribute("y", "90%");
    svgText.setAttribute("text-anchor", "middle");
    svgText.setAttribute("font-family", font);
    svgText.setAttribute("font-size", fontSize);
    svgText.setAttribute("fill", color);
    svgText.setAttribute("font-weight", bold);
    svgText.setAttribute("font-style", italic);
    svgText.setAttribute("text-decoration", strikethrough);
    svgText.setAttribute("id", "svg-text");
    svgText.textContent = text;
    svg.appendChild(svgText);
  }

  // Make the foreground image and text draggable
  makeDraggable();
}

function makeDraggable() {
  const svg = document.getElementById("canvas");
  const fgImage = document.getElementById("foreground-img");
  const svgText = document.getElementById("svg-text");

  if (fgImage) {
    fgImage.addEventListener("mousedown", startDrag);
    fgImage.addEventListener("mousemove", drag);
    fgImage.addEventListener("mouseup", endDrag);
    fgImage.addEventListener("mouseleave", endDrag);
  }

  if (svgText) {
    svgText.addEventListener("mousedown", startDrag);
    svgText.addEventListener("mousemove", drag);
    svgText.addEventListener("mouseup", endDrag);
    svgText.addEventListener("mouseleave", endDrag);
  }

  let selectedElement = null;
  let offset = {};

  function startDrag(event) {
    selectedElement = event.target;
    offset = getMousePosition(event);
    offset.x -= parseFloat(selectedElement.getAttribute("x")) || 0;
    offset.y -= parseFloat(selectedElement.getAttribute("y")) || 0;
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      const coord = getMousePosition(event);
      selectedElement.setAttribute("x", coord.x - offset.x);
      selectedElement.setAttribute("y", coord.y - offset.y);
    }
  }

  function endDrag() {
    selectedElement = null;
  }

  function getMousePosition(event) {
    const CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }
}

function fetchDataAndCheckAPI() {
  const apiEndpoint = document.getElementById("api").value;

  if (!apiEndpoint) {
    alert("Please enter an API endpoint.");
    return;
  }

  fetch(apiEndpoint)
    .then((response) => response.json())
    .then((data) => {
      const attributes = data.attributes;
      const usageCount = attributes.find(
        (attr) => attr.trait_type === "usage_count"
      );

      if (usageCount && "value" in usageCount) {
        alert(`Usage count: ${usageCount.value}`);
      } else if (usageCount) {
        alert(`API endpoint does not have value attribute in usage count.`);
      } else {
        alert("API endpoint does not have usage count attribute.");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the console for more details.");
    });
}

function downloadSVG() {
  const svg = document.getElementById("canvas");
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

  // Add namespaces if missing
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  // Add CDATA section with API fetch logic
  const script = `
                <![CDATA[
                    (function () {
                        const apiEndpoint = "${
                          document.getElementById("api").value
                        }";
                        if (!apiEndpoint) return;

                        fetch(apiEndpoint)
                            .then(response => response.json())
                            .then(data => {
                                const attributes = data.attributes;
                                const usageCount = attributes.find(attr => attr.trait_type === "usage_count");
                                const fgImage = document.getElementById('foreground-img');
                                const textInput = document.getElementById('svg-text');

                                if (usageCount && usageCount.value === 0) {
                                    if (textInput) {
                                      textInput.style.display = 'block';
                                    }
                                    if (fgImage) {
                                      fgImage.style.display = 'block';
                                    }
                                } else {
                                    if (textInput) {
                                      textInput.style.display = 'none';
                                    }
                                    if (fgImage) {
                                      fgImage.style.display = 'none';
                                    }
                                }
                            })
                            .catch(console.error);
                    })();
                ]]>
            `;
  source = source.replace("</svg>", `<script>${script}</script></svg>`);

  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "composed_image.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
