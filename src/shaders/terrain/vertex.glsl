// Uniforms
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFrequency;
uniform float uWarpStrength;
uniform float uElevation;

// Attributes

// Varyings

// Includes
#include ../includes/simplexNoise2d.glsl

// Functions
float getElevation(vec2 position)
{
    float regulation = 2.0;
    float frequency = 1.0;

    vec2 warpedPosition = position;
    warpedPosition += simplexNoise2d(warpedPosition * uPositionFrequency * uWarpFrequency) * uWarpStrength;

    float elevation = 0.0;
    for (float i = 0.0; i < uElevation; i++) {
        elevation += simplexNoise2d(warpedPosition * uPositionFrequency * frequency) / regulation;
        regulation *= 2.0;
        frequency *= 2.0;
    }

    float elevationSign = sign(elevation);
    elevation = pow(abs(elevation), 2.0) * elevationSign;
    elevation *= uStrength;

    return elevation;
}

void main()
{
    // Neighbours position
    float shift = 0.01;
    vec3 positionA = csm_Position + vec3(shift, 0.0, 0.0);
    vec3 positionB = csm_Position + vec3(0.0, 0.0, -shift);

    // Elevation
    float elevation = getElevation(csm_Position.xz);
    csm_Position.y += elevation;
    positionA.y = getElevation(positionA.xz);
    positionB.y = getElevation(positionB.xz);

    // Compute Normals
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);
}
