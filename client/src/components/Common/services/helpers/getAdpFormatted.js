export const getAdpFormatted = (adp) => {
  return `${parseFloat(Math.ceil(adp / 12))}.${(
    (Math.floor(adp) % 12) +
    1
  ).toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
};
