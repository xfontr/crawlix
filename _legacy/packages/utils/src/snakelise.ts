const snakelise = (text: string): string =>
  text
    .split(/(?=[A-Z])/)
    .join("_")
    .toLowerCase();

export default snakelise;
