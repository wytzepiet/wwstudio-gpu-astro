#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_velocity;

uniform vec3 u_gridSize;
uniform vec3 u_canvasSize;
uniform float u_boidsPerCell;
uniform vec2 u_gridTextureSize;

out vec3 v_position;
out vec3 v_velocity;

vec2 texCoord(vec3 gridPos, float count) {
    float x = gridPos.x * u_gridSize.y + gridPos.y;
    float y = gridPos.z * u_boidsPerCell + count;
    return vec2(x, y) / u_gridTextureSize;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    v_position = a_position;
    v_velocity = a_velocity;

    vec3 normalPos = (a_position / u_canvasSize) + 0.5;

    vec3 gridPos = floor(normalPos * u_gridSize);
    float count = floor(rand(a_position.xy) * u_boidsPerCell);

    vec2 texCoord = texCoord(gridPos, count);
    texCoord = mod(texCoord, 1.0) * 2.0 - 1.0;

    gl_PointSize = 1.0;
    gl_Position = vec4(texCoord, 1.0, 1.0);
}
