const CUTTING_EXPRESSION = /\s+[^\s]*$/;

export const createShortcut = (text: string, limit: number) => {
  if (text.length > limit) {
    const part = text.slice(0, limit);
    if (part.match(CUTTING_EXPRESSION)) {
      return part.replace(CUTTING_EXPRESSION, "...");
    }
    return part + "...";
  }
  return text;
};

export const decodeHtmlEntities = (encodedString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(encodedString, "text/html");
  return doc.documentElement.textContent;
};

export function limitContent(fileName: string, maxLength: number) {
  let truncatedText = "";
  if (fileName.length > maxLength) {
    truncatedText = fileName.substring(0, maxLength) + "...";
  } else {
    truncatedText = fileName.substring(0, maxLength);
  }
  return truncatedText;
}

export const generateRandomString = () => {
  // define the pool of characters to choose from
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters.charAt(randomIndex);
    result += randomCharacter;
    characters =
      characters.slice(0, randomIndex) + characters.slice(randomIndex + 1);
  }
  const now = new Date();
  const timestamp = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  const encryptedTimestamp = btoa(timestamp).substring(0, 7);
  result += encryptedTimestamp;

  return result;
};

export const ordinalSuffixOf = (inputNumber) => {
  const j = inputNumber % 10,
    k = inputNumber % 100;
  if (j === 1 && k !== 11) {
    return inputNumber + "st";
  }
  if (j === 2 && k !== 12) {
    return inputNumber + "nd";
  }
  if (j === 3 && k !== 13) {
    return inputNumber + "rd";
  }
  return inputNumber + "th";
};

export function replacetDotWithDash(inputString) {
  return inputString.replace(/\./g, "-");
}

export const generateRandomName = () => {
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  let name = "";

  const nameLength = Math.floor(Math.random() * (8 - 3 + 1)) + 3;

  for (let i = 0; i < nameLength; i++) {
    if (i % 2 === 0) {
      name += consonants.charAt(Math.floor(Math.random() * consonants.length));
    } else {
      name += vowels.charAt(Math.floor(Math.random() * vowels.length));
    }
  }

  name = name.charAt(0).toUpperCase() + name.slice(1);

  return name;
};

// const extension = fileName.split(".").pop();
// const nameWithoutExtension = fileName.replace(`.${extension}`, "");
// if (nameWithoutExtension.length <= maxLength) return fileName;
// return `${nameWithoutExtension.slice(0, maxLength)}...${extension}`;

export const stringPluralize = (count, str, suffix = "s") => {
  const res = `${str}${count > 1 ? suffix : count < 0 ? suffix : ""}`;
  return `${res}`;
};

export const cutStringWithEllipsis = (
  inputString,
  maxLength,
  cutSpecificLength = 0,
) => {
  if (inputString) {
    const givenLength = cutSpecificLength || maxLength;

    const subString = inputString.substring(0, givenLength);

    return subString.length === inputString.length
      ? inputString
      : subString + "...";
  }
  return;
};
