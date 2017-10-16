
self.outputsim = (function() {
  
  'use strict';
  
  var outputsim = {};

  outputsim.init = function init(container) {
    const pageSize = 64 * 1024;
    return new Promise(function(resolve, reject) {
      if (container.classList.contains('zx-spectrum')) {
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
        container.canvas.width = totalWidth;
        container.canvas.height = totalHeight;
        const ctx2d = container.ctx2d = container.canvas.getContext('2d');
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
      else if (container.classList.contains('nes')) {
        const systemMemoryBufferSize = 0x10000;
        const systemMemoryPageOffset = 0;
        const systemMemoryPageCount = Math.ceil(systemMemoryBufferSize / pageSize);
        const width = 256;
        const height = 240;
        const paletteBufferSize = 256 * 4;
        const pixelBufferSize = width * height * 4;
        const imageMemoryPageOffset = systemMemoryPageOffset = systemMemoryPageCount;
        const imageMemoryPageCount = Math.ceil((paletteBufferSize + pixelBufferSize) / pageSize);
        container.memory = new WebAssembly.Memory({
          initial: systemMemoryPageCount + imageMemoryPageCount,
        });
        container.patternTables = [];
        container.nameTables = [];
        container.attributeTables = [];
        for (var i = 0; i < 2; i++) {
          container.patternTables.push(new Uint8Array(
            container.memory.buffer,
            systemMemoryPageOffset * pageSize + i * 0x1000,
            0x1000
          ));
        }
        for (var i = 0; i < 4; i++) {
          container.nameTables.push(new Uint8Array(
            container.memory.buffer,
            systemMemoryPageOffset * pageSize + 0x2000 + i * 0x400,
            0x3C0
          ));
          container.attributeTables.push(new Uint8Array(
            container.memory.buffer,
            systemMemoryPageOffset * pageSize + 0x23C0 + i * 0x400,
            0x40
          ));
        }
        container.backgroundPalettes = new Uint8Array(
          container.memory.buffer,
          systemMemoryPageOffset * pageSize + 0x3F00,
          0x10);
        container.spritePalettes = new Uint8Array(
          container.memory.buffer,
          systemMemoryPageOffset * pageSize + 0x3F10,
          0x10);
        container.palette = new Uint32Array(
          container.memory.buffer,
          imageMemoryPageOffset * pageSize + pixelBufferSize,
          256);
        const pal = [
          0x808080, 0x003DA6, 0x0012B0, 0x440096,
          0xA1005E, 0xC70028, 0xBA0600, 0x8C1700,
          0x5C2F00, 0x104500, 0x054A00, 0x00472E,
          0x004166, 0x000000, 0x050505, 0x050505,
          0xC7C7C7, 0x0077FF, 0x2155FF, 0x8237FA,
          0xEB2FB5, 0xFF2950, 0xFF2200, 0xD63200,
          0xC46200, 0x358000, 0x058F00, 0x008A55,
          0x0099CC, 0x212121, 0x090909, 0x090909,
          0xFFFFFF, 0x0FD7FF, 0x69A2FF, 0xD480FF,
          0xFF45F3, 0xFF618B, 0xFF8833, 0xFF9C12,
          0xFABC20, 0x9FE30E, 0x2BF035, 0x0CF0A4,
          0x05FBFF, 0x5E5E5E, 0x0D0D0D, 0x0D0D0D,
          0xFFFFFF, 0xA6FCFF, 0xB3ECFF, 0xDAABEB,
          0xFFA8F9, 0xFFABB3, 0xFFD2B0, 0xFFEFA6,
          0xFFF79C, 0xD7E895, 0xA6EDAF, 0xA2F2DA,
          0x99FFFC, 0xDDDDDD, 0x111111, 0x111111,
        ];
        var palDV = new DataView(
          container.palette.buffer,
          container.palette.byteOffset,
          container.palette.byteLength);
        for (var i = 0; i < pal.length; i++) {
          var v = (pal[i] << 8) | 0xff;
          palDV.setInt32(i * 4, v);
          palDV.setInt32((64 + i) * 4, v);
          palDV.setInt32((128 + i) * 4, v);
          palDV.setInt32((192 + i) * 4, v);
        }
        const imageData = container.imageData = new ImageData(
          new Uint8ClampedArray(
            container.memory.buffer,
            imageMemoryPageOffset * pageSize,
            pixelBufferSize),
          width, height);
        while (container.firstChild) container.removeChild(container.firstChild);
        container.appendChild(container.canvas = document.createElement('CANVAS'));
        container.canvas.width = width;
        container.canvas.height = height;
        const ctx2d = container.ctx2d = container.canvas.getContext('2d');
        return container;
      }
      else {
        return Promise.reject('invalid or unspecified target');
      }
    });
  };
  
  return outputsim;

});
