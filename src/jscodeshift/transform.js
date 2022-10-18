module.exports = (fileInfo, api, options) => {
  console.log(fileInfo);
  // transform `fileInfo.source` here
  // ...
  // return changed source
  return fileInfo.source;
};
