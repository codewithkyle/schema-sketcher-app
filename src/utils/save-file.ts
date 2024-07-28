var saveFile = async (e:Blob|Response, t = [{}], s = null) => {
  if (!Array.isArray(t)) {
    t = [t];
  }
  t[0].fileName = t[0].fileName || "Untitled";
  const types = [];

  let fileType = null;

  if (e instanceof Blob && e.type) {
    fileType = e.type;
  } else if (e.headers && e.headers.get("content-type")) {
    fileType = e.headers.get("content-type");
  }

  t.forEach((item, index) => {
    types[index] = {
      description: item.description || "",
      accept: {}
    };

    if (item.mimeTypes) {
      if (index === 0 && fileType) {
        item.mimeTypes.push(fileType);
      }

      item.mimeTypes.map(mimeType => {
        types[index].accept[mimeType] = item.extensions || [];
      });
    } else if (fileType) {
      types[index].accept[fileType] = item.extensions || [];
    }
  });

  if (s) {
    try {
      await s.getFile();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const chosenFile = s || await window.showSaveFilePicker({
    suggestedName: t[0].fileName,
    id: t[0].id,
    types: types,
    excludeAcceptAllOption: t[0].excludeAcceptAllOption || false
  });

  const writable = await chosenFile.createWritable();

  if ("stream" in e) {
    await e.stream().pipeTo(writable);
    return chosenFile;
  } else if ("body" in e) {
    await e.body.pipeTo(writable);
    return chosenFile;
  } else {
    await writable.write(await e);
    await writable.close();
    return chosenFile;
  }
};

export default saveFile;
