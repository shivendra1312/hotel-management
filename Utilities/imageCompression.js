const sharp = require("sharp");

const compressImage = async (buffer) => {
    const compressed = await sharp(buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    return compressed;
};

module.exports = compressImage;
