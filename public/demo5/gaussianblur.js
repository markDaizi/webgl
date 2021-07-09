var __extends = (this && this.__extends) || function (d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p)) d[p] = b[p];

  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
  var GaussianBlur = (function (_super) {
    __extends(GaussianBlur, _super);

    function GaussianBlur() {
      var vert = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform vec2 delta;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vDelta;\n\nvoid main(void)\n{\n\tgl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n\tvTextureCoord = aTextureCoord;\n\n\tvDelta = delta;\n\n\tvColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}";
      var frag = "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vDelta;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nfloat random(vec3 scale, float seed) {\n    /* use the fragment position for a different seed per-pixel */\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main() {\n\tvec4 color = vec4(0.0);\n\tfloat total = 0.0;\n\t\n\t/* randomize the lookup values to hide the fixed number of samples */\n\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\t\n\tfor (int t = -30; t <= 30; t++) {\n\t\tfloat percent = (float(t) + offset - 0.5) / 30.0;\n\t\tfloat weight = 1.0 - abs(percent);\n\t\tvec4 sample = texture2D(uSampler, vTextureCoord + vDelta * percent);\n\t\t\n\t\t/* switch to pre-multiplied alpha to correctly blur transparent images */\n\t\tsample.rgb *= sample.a;\n\t\t\n\t\tcolor += sample * weight;\n\t\ttotal += weight;\n\t}\n\t\n\tgl_FragColor = color / total;\n\t\n\t/* switch back from pre-multiplied alpha */\n\tgl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}";
      _super.call(this, vert, frag, {
        delta: {
          type: 'v2',
          value: {
            x: 0,
            y: 0
          }
        }
      });
      this._delta = 0;
    }
    GaussianBlur.prototype.applyFilter = function (renderer, input, output, clear) {
      var shader = this.getShader(renderer);
      var renderTarget = renderer.filterManager.getRenderTarget(true);
      this.uniforms.delta.value = {
        x: this._delta / input.size.width,
        y: 0,
      };
      renderer.filterManager.applyFilter(shader, input, renderTarget, clear);
      this.uniforms.delta.value = {
        x: 0,
        y: this._delta / input.size.height,
      };
      renderer.filterManager.applyFilter(shader, renderTarget, output, clear);
      // 很重要，不加的话会引发内存泄漏
      renderer.filterManager.returnRenderTarget(renderTarget);
    };
    Object.defineProperty(GaussianBlur.prototype, "blur", {
      get: function () {
        return this._delta;
      },
      set: function (value) {
        this._delta = value;
      },
      enumerable: true,
      configurable: true
    });
    return GaussianBlur;
  })(PIXI.AbstractFilter);
  exports.default = GaussianBlur;
});