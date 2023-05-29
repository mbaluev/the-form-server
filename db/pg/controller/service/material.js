const materialEntity = require("../table/material");
const userMaterialEntity = require("../table/userMaterial");
const documentEntity = require("../table/document");
const fileEntity = require("../table/file");
const userBlockEntity = require("../table/userBlock");
const fs = require("fs");
const uuid = require("uuid");

const getMaterialsByBlockId = async (client, blockId) => {
  try {
    const data = { blockId };
    const materialsList = await materialEntity.list(client, data);
    const materials = [];
    for (const { documentId, ...material } of materialsList) {
      const { fileId, ...document } = await documentEntity.get(client, { id: documentId });
      document.file = await fileEntity.get(client, { id: fileId });
      material.document = document;
      materials.push(material);
    }
    return { materials };
  } catch (err) {
    throw err;
  }
}
const getMaterial = async (client, id) => {
  try {
    const data = { id };
    const { documentId, ...material } = await materialEntity.get(client, data);
    const { fileId, ...document } = await documentEntity.get(client, { id: documentId });
    document.file = await fileEntity.get(client, { id: fileId });
    material.document = document;
    return { material };
  } catch (err) {
    throw err;
  }
}
const createMaterial = async (client, dataMaterial, dataDocument, dataFile) => {
  try {
    const document = await documentEntity.create(client, dataDocument);
    const material = await materialEntity.create(client, dataMaterial);
    document.file = dataFile;
    material.document = document;
    return { material };
  } catch (err) {
    throw err;
  }
}
const updateMaterial = async (client, dataMaterial, dataDocument, dataFile) => {
  try {
    const documentOld = await documentEntity.get(client, { id: dataDocument.id });
    await documentEntity.update(client, dataDocument);
    if (documentOld.fileId !== dataDocument.fileId) {
      const file = await fileEntity.get(client, { id: documentOld.fileId });
      if (fs.existsSync(`./${file.path}`)) {
        fs.unlinkSync(`./${file.path}`);
      }
      await fileEntity.del(client, file.id);
    }
    const material = {
      id: dataMaterial.id,
      blockId: dataMaterial.blockId,
      documentId: dataMaterial.documentId,
      document: { ...dataDocument, file: { ...dataFile } }
    };
    return { material };
  } catch (err) {
    throw err;
  }
}
const deleteMaterial = async (client, id) => {
  try {
    // get info
    const material = await materialEntity.get(client, { id });
    const document = await documentEntity.get(client, { id: material.documentId });
    const file = await fileEntity.get(client, { id: document.fileId });

    // file unlink
    if (fs.existsSync(`./${file.path}`)) {
      fs.unlinkSync(`./${file.path}`);
    }

    // delete
    await materialEntity.del(client, material.id);
    await documentEntity.del(client, document.id);
    await fileEntity.del(client, file.id);
  } catch (err) {
    throw err;
  }
}
const deleteMaterials = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteMaterial(client, id);
    }
  } catch (err) {
    throw err;
  }
}

const getMaterialsByBlockIdUser = async (client, blockId, userId) => {
  try {
    const data = { blockId, userId };
    const materialsList = await materialEntity.listUser(client, data);
    const materials = [];
    for (const { documentId, ...material } of materialsList) {
      const { fileId, ...document } = await documentEntity.get(client, { id: documentId });
      document.file = await fileEntity.get(client, { id: fileId });
      material.document = document;
      materials.push(material);
    }
    return { materials };
  } catch (err) {
    throw err;
  }
}
const getMaterialUser = async (client, id, userId) => {
  try {
    const data = { id, userId };
    const { documentId, ...material } = await materialEntity.getUser(client, data);
    const { fileId, ...document } = await documentEntity.get(client, { id: documentId });
    document.file = await fileEntity.get(client, { id: fileId });
    material.document = document;
    return { material };
  } catch (err) {
    throw err;
  }
}
const updateMaterialUser = async (client, id, userId) => {
  try {
    // update userMaterials
    const data = { materialId: id, userId };
    const userMaterial = await userMaterialEntity.get(client, data);
    if (userMaterial) {
      const dataUserMaterial = {
        id: userMaterial.id,
        materialId: userMaterial.materialId,
        userId: userMaterial.userId,
        complete: true
      };
      await userMaterialEntity.update(client, dataUserMaterial);
    } else {
      const dataUserMaterial = {
        id: uuid.v4(),
        materialId: id,
        userId: userId,
        complete: true
      };
      await userMaterialEntity.create(client, dataUserMaterial)
    }

    // update userBlocks.completeMaterials
    const material = await materialEntity.get(client, { id })
    const { materials } = await getMaterialsByBlockIdUser(client, material.blockId, userId);
    const completeMaterials = materials.reduce((prev, curr) => prev && curr.complete, true);
    const userBlock = await userBlockEntity.get(client, { blockId: material.blockId });
    const dataUserBlock = { id: userBlock.id, completeMaterials }
    await userBlockEntity.update(client, dataUserBlock)
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getMaterialsByBlockId,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteMaterials,

  getMaterialsByBlockIdUser,
  getMaterialUser,
  updateMaterialUser
}