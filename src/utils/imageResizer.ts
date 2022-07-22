interface IResizeImageOptions {
  maxSize: number;
  quality: number;
  file: File;
}

export const resizeImage = (settings: IResizeImageOptions) => {
  const file = settings.file;
  const maxSize = settings.maxSize;
  const quality = settings.quality;
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.createElement('canvas');

  const dataURItoBlob = (dataURI: string) => {
    const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ? atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (var i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
    return new Blob([ia], { type: mime });
  };

  const resize = () => {
    let crop;
    let cropCoords = {
      sx: 0,
      sy: 0,
      size: image.width,
    };

    if (image.width > image.height) {
      if (image.width > maxSize) {
        crop = image.width - image.height;
        cropCoords = {
          sx: crop / 2,
          sy: 0,
          size: image.height,
        };
      }
    } else {
      if (image.height > maxSize) {
        crop = image.height - image.width;
        cropCoords = {
          sx: 0,
          sy: crop / 2,
          size: image.width,
        };
      }
    }

    canvas.width = maxSize;
    canvas.height = maxSize;

    canvas.getContext('2d')!.drawImage(image, cropCoords.sx, cropCoords.sy, cropCoords.size, cropCoords.size, 0, 0, maxSize, maxSize);
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    return dataURItoBlob(dataUrl);
  };

  return new Promise((ok, no) => {
    if (!file.type.match(/image.*/)) {
      no(new Error('Not an image'));
      return;
    }

    reader.onload = (readerEvent: any) => {
      image.onload = () => ok(resize());
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
};
