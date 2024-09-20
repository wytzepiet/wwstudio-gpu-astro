#version 300 es
precision mediump float;

in vec3 v_position;
in vec3 v_velocity;

layout(location = 0) out vec4 position;
layout(location = 1) out vec4 velocity;

void main() {
    position = vec4(v_position, 1.0);
    velocity = vec4(v_velocity, 1.0);
}