#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_velocity;
in vec3 a_deviationVel;

uniform vec3 u_color1;
uniform vec3 u_color2;

uniform float u_far;
uniform float u_near;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_inverseProjectionMatrix;
uniform mat4 u_inverseViewMatrix;
uniform vec3 u_canvasSize;
uniform vec3 u_target;
uniform float u_maxSpeed;
uniform float u_maxForce;
uniform float u_pointSize;

uniform float u_viewDist;
uniform vec3 u_gridSize;
uniform float u_boidsPerCell;

uniform vec2 u_mouse;
uniform vec2 u_prevMouse;

uniform vec2 u_gridTextureSize;
uniform sampler2D u_posGridTex;
uniform sampler2D u_velGridTex;


out vec3 v_position;
out vec3 v_velocity;
out vec3 v_deviationVel;

out vec3 rgb;
out float alpha;


vec3 rgbToHsl(vec3 color) {
    float r = color.r;
    float g = color.g;
    float b = color.b;

    float max = max(max(r, g), b);
    float min = min(min(r, g), b);
    float delta = max - min;

    float h = 0.0;
    float s = 0.0;
    float l = (max + min) / 2.0;

    if (delta > 0.0) {
        s = l < 0.5 ? delta / (max + min) : delta / (2.0 - max - min);
        if (max == r) {
            h = (g - b) / delta + (g < b ? 6.0 : 0.0);
        } else if (max == g) {
            h = (b - r) / delta + 2.0;
        } else {
            h = (r - g) / delta + 4.0;
        }
        h /= 6.0;
    }
    return vec3(h, s, l);
}
 float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
}
        
vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    float r, g, b;

    if (s == 0.0) {
        r = g = b = l; // Achromatic (gray)
    } else {
        float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        float p = 2.0 * l - q;
       
        r = hue2rgb(p, q, h + 1.0 / 3.0);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1.0 / 3.0);
    }

    return vec3(r, g, b);
}

vec2 texCoord(vec3 gridPos, float count) {
    float x = gridPos.x * u_gridSize.y + gridPos.y;
    float y = gridPos.z * u_boidsPerCell + count;
    return vec2(x, y) / u_gridTextureSize;
}

vec4 project(vec3 worldPos) {
    return u_projectionMatrix * u_viewMatrix * vec4(worldPos, 1.0);
}

vec3 unproject(vec2 screenPos, float depth) {
    vec2 clipPos = screenPos / u_canvasSize.xy * 2.0;

    // some weird stuff converting the depth to clip space depth
    float d = u_inverseViewMatrix[3][2] - depth;
    float a = (u_far + u_near) / (u_far - u_near);
	float b = (2.0 * u_far * u_near) / (u_far - u_near);
	float clipDepth = (a * d + b) / d;

    vec4 viewSpace = u_inverseProjectionMatrix * vec4(clipPos, clipDepth, 1.0);
    viewSpace.rgb /= viewSpace.a;
    viewSpace.a = 1.0;
    vec3 worldPos = (u_inverseViewMatrix * viewSpace).xyz;
    worldPos.x *= -1.0;
    return worldPos;
}

vec3 limit(vec3 vec, float maxMag) {
    float mag = length(vec);
    if(mag > maxMag) {
        return vec / mag * maxMag; 
    }
    return vec;
}

// Function to calculate the squared distance between a point and a line segment
vec2 diffToLineSegment(vec2 point, vec2 lineStart, vec2 lineEnd) {
    vec2 lineVector = lineEnd - lineStart;
    vec2 pointVector = point - lineStart;

    float lineLengthSquared = dot(lineVector, lineVector);  // Length of the line segment squared

    // Project pointVector onto the line segment and find the projection factor
    float t = dot(pointVector, lineVector) / lineLengthSquared;

    // Clamp t to ensure it is within the line segment
    t = clamp(t, 0.0, 1.0);

    // Find the closest point on the line segment
    vec2 closestPoint = lineStart + t * lineVector;

    // Return the distance from the point to the closest point on the line segment
    return closestPoint - point;
}

void main() {
    vec3 normalPos = (a_position / u_canvasSize) + 0.5;
    vec3 myGridPos = floor(normalPos * u_gridSize);

    float normalDistToCamera = a_position.z / u_far + 0.5;
    
    float viewDistSq = u_viewDist * u_viewDist;
    float texIncrement = 1.0 / u_gridTextureSize.x;
    
    vec3 separate = vec3(0.0);
    vec3 align = vec3(0.0);
    vec3 cohesion = vec3(0.0);

    float count = 1.0;

    for(float x = -1.0; x <= 1.0; x++) {
        for(float y = -1.0; y <= 1.0; y++) {
            for(float z = -1.0; z <= 1.0; z++) {
                vec3 gridPos = myGridPos + vec3(x, y, z);
                vec2 texCoord = texCoord(gridPos, -texIncrement);

                for(float i = 0.0; i < u_boidsPerCell; i++) {
                    texCoord.y += texIncrement;

                    vec3 pos = texture(u_posGridTex, texCoord).xyz;

                    if(pos.x == 0.0) continue;

                    vec3 vel = texture(u_velGridTex, texCoord).xyz;

                    vec3 diff = pos - a_position;
                    float distSq = diff.x * diff.x + diff.y * diff.y + diff.z * diff.z;
         
                    if(distSq > viewDistSq || distSq < 0.1) continue;

                    float factor = u_viewDist / distSq;

                    separate -= diff * factor;
                    align += vel * factor;
                    cohesion += diff;
                    
                    count++;

                }
            }
        }
    }

    float opacity = (count - 1.0) / 8.0;
    alpha = min(opacity, 1.0);

    cohesion /= max(count, 8.0);

    separate *= 0.06;
    align *= 0.35;
    cohesion *= 0.05;

    vec3 flockForce = separate + align + cohesion;
    
    vec3 seekForce = vec3(u_target.xy, 0.0) - a_position; 
    seekForce = normalize(seekForce);
    seekForce *= 0.5;

    float countFactor = 30.0 / count;
    countFactor = clamp(countFactor, 1.0, 2.0);

    float maxForce = u_maxForce * countFactor;
    vec3 boidForce = limit(flockForce + seekForce, maxForce);

    vec3 deviationVel = a_deviationVel * 0.93;
    vec2 deviationForce = vec2(0.0);

    if(u_mouse != u_prevMouse) {
        vec2 mouse = unproject(u_mouse, a_position.z).xy;
        vec2 prevMouse = unproject(u_prevMouse, a_position.z).xy;

        vec2 mouseDiff = diffToLineSegment(a_position.xy, prevMouse, mouse);
        float mouseDist = length(mouseDiff);

        if(mouseDist < 100.0) {  
            vec2 mouseVel = u_prevMouse - u_mouse;
            vec2 alignForce = mouseVel * 4.0;
            vec2 avoidForce = mouseDiff * 0.1 * min(length(mouseVel), 10.0);
            deviationForce = alignForce + avoidForce;
            deviationForce *= -10.0 / (mouseDist * mouseDist);
            deviationVel += vec3(deviationForce, 0.0);

        }
    }

    float maxDeviationVel = 4.0 + 5.0 * normalDistToCamera;

    deviationVel = limit(deviationVel, maxDeviationVel);
    v_deviationVel = deviationVel;

    vec3 force = boidForce + vec3(deviationForce, 0.0);
    float maxSpeed = u_maxSpeed + length(deviationVel);

    vec3 newVelocity = limit(a_velocity + force, maxSpeed);

    vec3 newPosition = a_position + newVelocity ;

    v_position = newPosition;
    v_velocity = newVelocity;
    
    vec4 clipSpace = project(newPosition);
    
    float k = 20.0;
    float activation = 1.0 / (1.0 + exp((0.5 - normalDistToCamera ) * k));

    vec3 hsl = mix(rgbToHsl(u_color1), rgbToHsl(u_color2), activation);
    rgb = hslToRgb(hsl);
    
    gl_Position = clipSpace;
    gl_PointSize = u_pointSize / clipSpace.w * 1000.0; 
}