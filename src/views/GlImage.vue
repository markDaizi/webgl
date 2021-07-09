<template>
  <div class="img">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script  id="vertex-shader-2d" type="x-shader/x-vertex">
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}
</script>
<!-- fragment shader -->
<script  id="fragment-shader-2d" type="x-shader/x-fragment">
precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   gl_FragColor = texture2D(u_image, v_texCoord);
}
</script>
<script>
export default {
  mounted() {
    var vsSource = `attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main() {
      // convert the rectangle from pixels to 0.0 to 1.0
      vec2 zeroToOne = a_position / u_resolution;

      // convert from 0->1 to 0->2
      vec2 zeroToTwo = zeroToOne * 2.0;

      // convert from 0->2 to -1->+1 (clipspace)
      vec2 clipSpace = zeroToTwo - 1.0;

      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

      // pass the texCoord to the fragment shader
      // The GPU will interpolate this value between points.
      v_texCoord = a_texCoord;
    }`;
    var fsSource = `precision mediump float;
      // our texture
      uniform sampler2D u_image;

      // the texCoords passed in from the vertex shader.
      varying vec2 v_texCoord;

      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }`;
    function main() {
      var image = new Image();
      image.src = '/1.jpg'; // 必须在同一域名下
      image.onload = function() {
        render(image);
      };
    }
    function render(image) {
      // Get A WebGL context
      /** @type {HTMLCanvasElement} */
      var canvas = document.querySelector('#canvas');
      var gl = canvas.getContext('webgl');
      if (!gl) {
        return;
      }
      var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
      var positionLocation = gl.getAttribLocation(program, 'a_position');
      var textcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

      //create buffer
      var positionBuffer = gl.createBuffer();
      //bind it to ARRAY_BUFFER
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      setRectangle(gl, 0, 0, image.width, image.height);

      var textcoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textcoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          1.0,
          0.0,
          1.0,
          1.0,
          0.0,
          1.0,
          1.0,
        ]),
        gl.STATIC_DRAW
      );

      //create a texture
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      //upload the image into the texture
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      //clear the canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2; // 2 components per iteration
      var type = gl.FLOAT; // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0; // start at the beginning of the buffer
      gl.vertexAttribPointer(
        positionLocation,
        size,
        type,
        normalize,
        stride,
        offset
      );
      // Turn on the texcoord attribute
      gl.enableVertexAttribArray(texcoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
      var size = 2; // 2 components per iteration
      var type = gl.FLOAT; // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0; // start at the beginning of the buffer
      gl.vertexAttribPointer(
        texcoordLocation,
        size,
        type,
        normalize,
        stride,
        offset
      );
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
    function setRectangle(gl, x, y, width, height) {
      var x1 = x;
      var x2 = x + width;
      var y1 = y;
      var y2 = y + height;
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
        gl.STATIC_DRAW
      );
    }

    main();
  },
};
</script>

<style lang="scss" scoped>
@import url('https://webglfundamentals.org/webgl/resources/webgl-tutorials.css');
body {
  margin: 0;
}
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
