const fs = require('fs');
const path = require("path");
const getExtensions = (fileName) => {
    fileName = fileName + ""
    return fileName.slice(fileName.lastIndexOf('.') + 1)
}

const saveMenuItemPhoto = (data, filename) => {
    fs.writeFileSync(path.join(__dirname, 'menuPhoto', filename), data);
}
const deleteMenuPhoto = async (filename) => {
    try {
        fs.unlinkSync(path.join(__dirname, 'menuPhoto', filename))
    } catch (e) {
    }
}

module.exports = {
    getExtensions,
    saveMenuItemPhoto,
    deleteMenuPhoto
}
