const processFile = async (options) => {
  const file = await options.getFile();
  return file.handle = options, file;
};

var openFile = async (options = [{}]) => {
  if (!Array.isArray(options)) {
    options = [options];
  }

  const fileTypes = [];
  options.forEach((option, index) => {
    fileTypes[index] = {
      description: option.description || "",
      accept: {}
    };

    if (option.mimeTypes) {
      option.mimeTypes.map(mimeType => {
        fileTypes[index].accept[mimeType] = option.extensions || [];
      });
    } else {
      fileTypes[index].accept["*/*"] = option.extensions || [];
    }
  });

  const filePickerOptions = {
    id: options[0].id,
    startIn: options[0].startIn,
    types: fileTypes,
    multiple: options[0].multiple || false,
    excludeAcceptAllOption: options[0].excludeAcceptAllOption || false
  };

  const selectedFiles = await window.showOpenFilePicker(filePickerOptions);
  const processedFiles = await Promise.all(selectedFiles.map(processFile));

  return options[0].multiple ? processedFiles : processedFiles[0];
};

export default openFile;
