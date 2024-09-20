#version 300 es
precision mediump float;

in vec3 rgb;  // Received from vertex shader
in float alpha; // Received from vertex shader
uniform sampler2D u_gradientTexture; // Your texture

out vec4 fragColor;

void main() {
    // Use gl_PointCoord to sample the texture
    vec4 textureColor = texture(u_gradientTexture, gl_PointCoord);
    // Combine the texture color with the rgb input
    fragColor = vec4(textureColor.rgb * rgb, textureColor.a * alpha);
}
