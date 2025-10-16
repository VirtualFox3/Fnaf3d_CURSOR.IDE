import * as THREE from 'three';

interface StaticNoiseUniforms {
  tDiffuse: { value: THREE.Texture | null };
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uIntensity: { value: number };
}

export class StaticNoisePass {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly uniforms: StaticNoiseUniforms;

  constructor(width: number, height: number, intensity: number = 0.22) {
    this.uniforms = {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uIntensity: { value: intensity }
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uIntensity;

        float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          vec4 base = texture2D(tDiffuse, uv);

          float time = uTime * 60.0;
          float grain = random(uv * uResolution + time);
          float grain2 = random((uv.yx + time) * 0.5);
          float noise = (grain + grain2) * 0.5 - 0.5;

          float scanline = sin(uv.y * uResolution.y * 0.9 + uTime * 80.0) * 0.08;
          float flicker = sin(uTime * 12.0) * 0.05;

          vec3 color = base.rgb;
          color += noise * uIntensity;
          color -= scanline * uIntensity * 0.6;
          color += flicker * 0.15 * uIntensity;

          float vignette = smoothstep(0.9, 0.2, length(uv - 0.5));
          color *= mix(1.0, 0.85, vignette * 0.7);

          gl_FragColor = vec4(clamp(color, 0.0, 1.0), base.a);
        }
      `,
      depthTest: false,
      depthWrite: false
    });
    material.transparent = false;

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, material);
    this.scene.add(this.quad);
  }

  public setSize(width: number, height: number): void {
    this.uniforms.uResolution.value.set(width, height);
  }

  public setIntensity(value: number): void {
    this.uniforms.uIntensity.value = value;
  }

  public render(renderer: THREE.WebGLRenderer, inputTarget: THREE.WebGLRenderTarget): void {
    this.uniforms.tDiffuse.value = inputTarget.texture;
    this.uniforms.uTime.value = performance.now() / 1000;

    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }
}
