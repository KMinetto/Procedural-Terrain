// Uniforms

// Attributes

// Varyings

// Includes
#include ../includes/simplexNoise2d.glsl

// Functions
float getElevation(vec2 position)
{
    float elevation = 0.0;
    elevation += simplexNoise2d(position);

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
