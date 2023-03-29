const crtShader = `
            precision mediump float;
            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            #define distortion 0.3

            vec2 radialDistortion(vec2 coord) {
              vec2 cc = coord - vec2(0.5);
              float dist = dot(cc, cc) * distortion;
              return coord + cc * (1.0 - dist) * dist;
            }

            void main () {
              vec2 crtCoords = radialDistortion(outTexCoord);
              if (crtCoords.x < 0.0 || crtCoords.x > 1.0 || crtCoords.y < 0.0 || crtCoords.y > 1.0) {
                return;
              }
              gl_FragColor = texture2D(uMainSampler, crtCoords);
            }
          `;