
self.outputsim = {};

outputsim.init = function init(container) {
  return new Promise(function(resolve, reject) {
    if (container.classList.contains('zx-spectrum')) {
      const pageSize = 64 * 1024;
      const systemMemoryBufferSize = 128 * 1024;
      const systemMemoryPageOffset = 0;
      const systemMemoryPageSize = Math.ceil(systemMemoryBufferSize / pageSize);
      const viewportWidth = 256;
      const viewportHeight = 192;
      const borderWidth = 48;
      const borderHeight = 48;
      const totalWidth = borderWidth + viewportWidth + borderWidth;
      const totalHeight = borderHeight + viewportHeight + borderHeight;
      const pixelBufferSize = 4 * totalWidth * totalHeight;
      const paletteBufferSize = 256 * 4;
      const imageMemoryPageOffset = systemMemoryPageOffset + systemMemoryPageSize;
      const imageMemoryPageSize = Math.ceil((pixelBufferSize + paletteBufferSize) / pageSize);
      container.memory = new WebAssembly.Memory({
        initial: systemMemoryPageSize + imageMemoryPageSize,
      });
      container.palette = new Uint32Array(
        container.memory.buffer,
        imageMemoryPageOffset * pageSize + pixelBufferSize,
        256);
      const imageData = container.imageData = new ImageData(
        new Uint8ClampedArray(
          container.memory.buffer,
          imageMemoryPageOffset * pageSize,
          pixelBufferSize),
        totalWidth, totalHeight);
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(container.canvas = document.createElement('CANVAS'));
      const ctx2d = container.ctx2d = container.canvas.getContext('2d');
      container.canvas.width = totalWidth;
      container.canvas.height = totalHeight;
      var nextFrameAt = performance.now();
      function nextFrame(t) {
        if (t >= nextFrameAt) {
          nextFrameAt += 1/50;
          if (nextFrameAt <= t) nextFrameAt = t + 1/50;
          ctx2d.putImageData(imageData, 0, 0);
        }
        requestAnimationFrame(nextFrame);
      }
      nextFrame(nextFrameAt);
      return container;
    }
    else {
      return Promise.reject('invalid or unspecified target');
    }
  });
};
