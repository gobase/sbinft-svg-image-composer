document.addEventListener("DOMContentLoaded", function () {
  let backgroundImageInput = document.getElementById("background-image");
  let foregroundImagesContainer = document.getElementById("foreground-images");
  let textInputsContainer = document.getElementById("text-inputs");
  let previewContainer = document.getElementById("preview");
  let addForegroundBtn = document.getElementById("add-foreground");
  let addTextBtn = document.getElementById("add-text");
  let downloadBtn = document.getElementById("download-svg");

  let foregroundImagesCount = 0;
  let textInputsCount = 0;

  backgroundImageInput.addEventListener("change", updatePreview);
  addForegroundBtn.addEventListener("click", addForegroundImage);
  addTextBtn.addEventListener("click", addTextInput);
  downloadBtn.addEventListener("click", downloadSVG);

  function updatePreview() {
    // Create the base SVG
    let svgNS = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");
    svg.setAttribute("viewBox", "0 0 500 500");

    // Add background image
    let backgroundImage = backgroundImageInput.files[0];
    if (backgroundImage) {
      let reader = new FileReader();
      reader.onload = function (e) {
        let image = document.createElementNS(svgNS, "image");
        image.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          e.target.result
        );
        image.setAttribute("width", "100%");
        image.setAttribute("height", "100%");
        svg.appendChild(image);
      };
      reader.readAsDataURL(backgroundImage);
    }

    // Add foreground images
    let foregroundImages = document.querySelectorAll(".foreground-image-input");
    foregroundImages.forEach(function (input, index) {
      let file = input.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
          let image = document.createElementNS(svgNS, "image");
          image.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "href",
            e.target.result
          );
          image.setAttribute("x", "50");
          image.setAttribute("y", "50");
          image.setAttribute("width", "100");
          image.setAttribute("height", "100");
          image.setAttribute("opacity", input.dataset.opacity || 1);
          image.style.cursor = "move";
          image.classList.add("draggable");
          svg.appendChild(image);
        };
        reader.readAsDataURL(file);
      }
    });

    // Add text inputs
    let textInputs = document.querySelectorAll(".text-input-group");
    textInputs.forEach(function (group) {
      let textElement = document.createElementNS(svgNS, "text");
      textElement.textContent = group.querySelector(".text-input").value;
      textElement.setAttribute("x", "100");
      textElement.setAttribute("y", "100");
      textElement.setAttribute(
        "font-size",
        group.querySelector(".font-size").value + "px"
      );
      textElement.setAttribute(
        "fill",
        group.querySelector(".text-color").value
      );
      textElement.style.fontWeight = group.querySelector(".bold").checked
        ? "bold"
        : "normal";
      textElement.style.fontStyle = group.querySelector(".italic").checked
        ? "italic"
        : "normal";
      textElement.style.textDecoration = group.querySelector(".strikethrough")
        .checked
        ? "line-through"
        : "none";
      textElement.style.cursor = "move";
      textElement.classList.add("draggable");
      svg.appendChild(textElement);
    });

    // Clear previous preview and add the new SVG
    while (previewContainer.firstChild) {
      previewContainer.removeChild(previewContainer.firstChild);
    }
    previewContainer.appendChild(svg);

    // Enable drag-and-drop functionality
    enableDragAndDrop();
  }

  function enableDragAndDrop() {
    let draggables = document.querySelectorAll(".draggable");
    draggables.forEach(function (element) {
      element.addEventListener("mousedown", function (e) {
        let offsetX = e.clientX - element.getBoundingClientRect().left;
        let offsetY = e.clientY - element.getBoundingClientRect().top;

        function onMouseMove(e) {
          element.setAttribute("x", e.clientX - offsetX);
          element.setAttribute("y", e.clientY - offsetY);
        }

        document.addEventListener("mousemove", onMouseMove);

        document.addEventListener(
          "mouseup",
          function () {
            document.removeEventListener("mousemove", onMouseMove);
          },
          { once: true }
        );
      });
    });
  }

  function addForegroundImage() {
    foregroundImagesCount++;
    let div = document.createElement("div");
    div.innerHTML = `
            <input type="file" class="foreground-image-input" accept="image/*" data-index="${foregroundImagesCount}">
            <label for="opacity-${foregroundImagesCount}">Opacity:</label>
            <input type="range" min="0" max="1" step="0.01" id="opacity-${foregroundImagesCount}" class="opacity-input" value="1">
        `;
    div
      .querySelector(".foreground-image-input")
      .addEventListener("change", updatePreview);
    div.querySelector(".opacity-input").addEventListener("input", function () {
      div.querySelector(".foreground-image-input").dataset.opacity = this.value;
      updatePreview();
    });
    foregroundImagesContainer.appendChild(div);
  }

  function addTextInput() {
    textInputsCount++;
    let div = document.createElement("div");
    div.classList.add("text-input-group");
    div.innerHTML = `
            <input type="text" class="text-input" placeholder="Enter text">
            <label for="font-size-${textInputsCount}">Font Size:</label>
            <input type="number" id="font-size-${textInputsCount}" class="font-size" value="16">
            <label for="text-color-${textInputsCount}">Color:</label>
            <input type="color" id="text-color-${textInputsCount}" class="text-color" value="#000000">
            <label><input type="checkbox" class="bold"> Bold</label>
            <label><input type="checkbox" class="italic"> Italic</label>
            <label><input type="checkbox" class="strikethrough"> Strikethrough</label>
            <button class="remove-text">Remove</button>
        `;
    div.querySelector(".text-input").addEventListener("input", updatePreview);
    div.querySelectorAll("input, select").forEach(function (input) {
      input.addEventListener("change", updatePreview);
    });
    div.querySelector(".remove-text").addEventListener("click", function () {
      div.remove();
      updatePreview();
    });
    textInputsContainer.appendChild(div);
  }

  function downloadSVG() {
    let svgElement = previewContainer.querySelector("svg");
    if (svgElement) {
      let serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      let svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      let url = URL.createObjectURL(svgBlob);

      let downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "composed-image.svg";
      downloadLink.click();

      URL.revokeObjectURL(url);
    }
  }
});
