<template>
  <canvas
    id="webgl"
    width="500"
    height="500"
    style="background-color: blue"
  ></canvas>
</template>

<script>
export default {
  mounted() {
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl');
    var vertexShaderSource =
      'attribute vec4 apos;' +
      'void main(){' +
      '    mat4 m4 = mat4(1,0,0,0,  0,1,0,0,  0,0,1,0,  -0.4,0,0,1);' +
      '   gl_PointSize=20.0;' +
      '   gl_Position = m4*apos;' +
      '}';
    var fragShaderSource =
      '' +
      'void main(){' +
      //定义片元颜色
      '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);' +
      '}';
    this.initShader(gl, vertexShaderSource, fragShaderSource);
    gl.drawArrays(gl.POINTS, 0, 10);
  },
  methods: {
    initShader(gl, vertexShaderSource, fragmentShaderSource) {
      //创建顶点着色器对象
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      //创建片元着色器对象
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      //引入顶点、片元着色器源代码
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      //编译顶点、片元着色器
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      //创建程序对象program
      var program = gl.createProgram();
      //附着顶点着色器和片元着色器到program
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      //链接program
      gl.linkProgram(program);
      //使用program
      gl.useProgram(program);
      //返回程序program对象
      return program;
    },
  },
};
</script>
<style></style>
