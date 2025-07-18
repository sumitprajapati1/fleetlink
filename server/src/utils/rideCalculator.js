const calculateRideDuration = (fromPincode, toPincode) => {
  const from = parseInt(fromPincode);
  const to = parseInt(toPincode);
  
  const duration = Math.abs(to - from) % 24;
  
  return Math.max(duration, 1);
};

export {calculateRideDuration};