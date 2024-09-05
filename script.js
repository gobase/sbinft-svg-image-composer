let backgroundImage, foregroundImage;
let svgWidth = 500,
  svgHeight = 500;
let backgroundImageState = { x: 0, y: 0, width: svgWidth, height: svgHeight };

document.getElementById("background").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    backgroundImage = new Image();
    backgroundImage.onload = function () {
      svgWidth = this.width;
      svgHeight = this.height;
      backgroundImageState = { x: 0, y: 0, width: svgWidth, height: svgHeight };
      document.getElementById("canvas").setAttribute("width", svgWidth);
      document.getElementById("canvas").setAttribute("height", svgHeight);
      updateCanvas();
    };
    backgroundImage.src = event.target.result;
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
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);

  // Add background image
  if (backgroundImage) {
    const bgImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    bgImage.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      backgroundImage.src
    );
    bgImage.setAttribute("width", backgroundImageState.width);
    bgImage.setAttribute("height", backgroundImageState.height);
    bgImage.setAttribute("x", backgroundImageState.x);
    bgImage.setAttribute("y", backgroundImageState.y);
    bgImage.setAttribute("id", "background-img");
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
    fgImage.setAttribute("width", svgWidth / 2);
    fgImage.setAttribute("height", svgHeight / 2);
    fgImage.setAttribute("x", svgWidth / 4);
    fgImage.setAttribute("y", svgHeight / 4);
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
    svgText.setAttribute("x", svgWidth / 2);
    svgText.setAttribute("y", svgHeight * 0.9);
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

  // Make the background image, foreground image and text draggable and resizable
  makeElementDraggableAndResizable(
    document.getElementById("background-img"),
    true
  );
  makeElementDraggableAndResizable(document.getElementById("foreground-img"));
  makeElementDraggableAndResizable(document.getElementById("svg-text"));
}

function makeElementDraggableAndResizable(element, isBackground = false) {
  if (!element) return;

  let isDragging = false;
  let isResizing = false;
  let resizeHandle = "";
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  element.addEventListener("mousedown", startDragOrResize);
  document.addEventListener("mousemove", dragOrResize);
  document.addEventListener("mouseup", stopDragOrResize);
  element.addEventListener("mousemove", updateCursor);

  function updateCursor(e) {
    const rect = element.getBoundingClientRect();
    const edge = 8; // Distance from edge to activate resize cursor

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isTop = y < edge;
    const isBottom = y > rect.height - edge;
    const isLeft = x < edge;
    const isRight = x > rect.width - edge;

    if (isTop && isLeft) element.style.cursor = "nw-resize";
    else if (isTop && isRight) element.style.cursor = "ne-resize";
    else if (isBottom && isLeft) element.style.cursor = "sw-resize";
    else if (isBottom && isRight) element.style.cursor = "se-resize";
    else if (isTop) element.style.cursor = "n-resize";
    else if (isBottom) element.style.cursor = "s-resize";
    else if (isLeft) element.style.cursor = "w-resize";
    else if (isRight) element.style.cursor = "e-resize";
    else element.style.cursor = "move";
  }

  function startDragOrResize(e) {
    e.preventDefault();
    const rect = element.getBoundingClientRect();
    const edge = 8;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isTop = y < edge;
    const isBottom = y > rect.height - edge;
    const isLeft = x < edge;
    const isRight = x > rect.width - edge;

    if (isTop || isBottom || isLeft || isRight) {
      isResizing = true;
      resizeHandle = element.style.cursor;
    } else {
      isDragging = true;
    }

    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseFloat(element.getAttribute("width"));
    startHeight = parseFloat(element.getAttribute("height"));
    startLeft = parseFloat(element.getAttribute("x"));
    startTop = parseFloat(element.getAttribute("y"));
  }

  function dragOrResize(e) {
    if (!isDragging && !isResizing) return;

    const svg = document.getElementById("canvas");
    const CTM = svg.getScreenCTM();
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    if (isDragging) {
      const dx = mouseX - startX;
      const dy = mouseY - startY;
      const newX = startLeft + dx;
      const newY = startTop + dy;
      element.setAttribute("x", newX);
      element.setAttribute("y", newY);
      if (element.tagName === "text") {
        element.setAttribute("x", mouseX);
        element.setAttribute("y", mouseY);
      }
      if (isBackground) {
        backgroundImageState.x = newX;
        backgroundImageState.y = newY;
      }
    } else if (isResizing) {
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      const dx = mouseX - startX;
      const dy = mouseY - startY;

      switch (resizeHandle) {
        case "nw-resize":
          newWidth = startWidth - dx;
          newHeight = startHeight - dy;
          newX = startLeft + dx;
          newY = startTop + dy;
          break;
        case "ne-resize":
          newWidth = startWidth + dx;
          newHeight = startHeight - dy;
          newY = startTop + dy;
          break;
        case "sw-resize":
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          newX = startLeft + dx;
          break;
        case "se-resize":
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
          break;
        case "n-resize":
          newHeight = startHeight - dy;
          newY = startTop + dy;
          break;
        case "s-resize":
          newHeight = startHeight + dy;
          break;
        case "w-resize":
          newWidth = startWidth - dx;
          newX = startLeft + dx;
          break;
        case "e-resize":
          newWidth = startWidth + dx;
          break;
      }

      // Ensure minimum size
      newWidth = Math.max(newWidth, 20);
      newHeight = Math.max(newHeight, 20);

      element.setAttribute("width", newWidth);
      element.setAttribute("height", newHeight);
      element.setAttribute("x", newX);
      element.setAttribute("y", newY);

      if (isBackground) {
        backgroundImageState.width = newWidth;
        backgroundImageState.height = newHeight;
        backgroundImageState.x = newX;
        backgroundImageState.y = newY;
        svgWidth = newWidth;
        svgHeight = newHeight;
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);
      }
    }
  }

  function stopDragOrResize() {
    isDragging = false;
    isResizing = false;
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
        const fgImage = document.getElementById('foreground-img');
        const textInput = document.getElementById('svg-text');
        if (textInput) {
          textInput.style.display = 'none';
        }
        if (fgImage) {
          fgImage.style.display = 'none';
        }

        const apiEndpoint = "${document.getElementById("api").value}";
        if (!apiEndpoint) return;

        fetch(apiEndpoint)
          .then(response => response.json())
          .then(data => {
            const attributes = data.attributes;
            const usageCount = attributes.find(attr => attr.trait_type === "usage_count");

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
