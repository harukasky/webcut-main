// Author: Fernando Kuteken
// License: MIT

#define PI 3.141592653589

//uniform float startingAngle; // = 90;
float startingAngle=90;

vec4 transition(vec2 uv){
  
  float offset=startingAngle*PI/180.;
  float angle=atan(uv.y-.5,uv.x-.5)+offset;
  float normalizedAngle=(angle+PI)/(2.*PI);
  
  normalizedAngle=normalizedAngle-floor(normalizedAngle);
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    step(normalizedAngle,progress)
  );
}
