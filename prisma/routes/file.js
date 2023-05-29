const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) handlers.throwError(400, 'No File is selected.');
    const dataFile = await prisma.file.create({
      data: {
        id: file.filename,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path
      }
    });
    res.status(200).send({
      success: true,
      data: dataFile
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const download = async (req, res) => {
  try {
    const id = req.params.id;
    const file = await prisma.file.findUnique({
      where: { id }
    });
    res.download(file.path, file.name);
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  upload,
  download
}