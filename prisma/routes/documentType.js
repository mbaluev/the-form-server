const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const documentTypes = await prisma.documentType.findMany({});
    const data = documentTypes?.map(d => ({
      value: d.id,
      label: d.name
    }))
    res.status(200).send({
      success: true,
      data
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  list,
}