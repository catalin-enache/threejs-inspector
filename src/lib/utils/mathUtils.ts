export const degToRad = (deg: number) => {
  return (deg / 180) * Math.PI;
};

export const radToDegFormatter = (rad: number) => {
  return ((rad / Math.PI) * 180).toFixed(1);
};
