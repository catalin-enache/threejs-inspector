/*
Why This Formula Works
The formula leverages trigonometry to project the spherical coordinates onto a 3D unit sphere. Here's how:

Latitude (theta) Affects Vertical Position (y):
The cosine of the latitude determines how "high" or "low" the point is on the sphere.

Longitude (phi) Affects Horizontal Position (x and z):
The sine and cosine of the longitude control the direction around the equator (x,z plane).

Combined Effect:
The sine of the latitude adjusts the influence of the longitude on the horizontal plane (x and z).
*/
export const projectLongLatOnSphere = ({
  x: longitude /* equator 0 ... 2PI (phi) */,
  y: latitude /* poles 0 ... PI (theta) */,
  r: radius
}: {
  x: number;
  y: number;
  r: number;
}) => {
  return [
    Math.sin(latitude) * Math.sin(longitude), // X
    Math.cos(latitude), // Y
    Math.sin(latitude) * Math.cos(longitude) // Z
  ].map((coord) => coord * radius) as [number, number, number];
};
