precision mediump float;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform float progress;
uniform vec2 resolution;
varying vec2 v_texCoord;

float heart(vec2 p, vec2 size) {
    p = (p - 0.5) * size;
    p.y -= 0.25;
    float a = atan(p.x, p.y) / 3.0;
    float r = length(p);
    return step(r, 0.2 + 0.1 * sin(6.0 * a));
}

void main() {
    vec2 size = vec2(1.6, 1.6 * resolution.x / resolution.y);
    vec4 color1 = texture2D(u_texture1, v_texCoord);
    vec4 color2 = texture2D(u_texture2, v_texCoord);
    float t = heart(v_texCoord, size);
    gl_FragColor = mix(color1, color2, step(progress, t));
}