const fs = require("fs");
const path = require("path");
const { pathExists, ensureFile, writeFile } = require("fs-extra");

const relativePath = "";
const defaultPath = path.join(__dirname, relativePath);

const getFilesInDir = (wholeArr, watchPath) => {
  const filterData = [];

  wholeArr.forEach((item) => {
    const itemPath = path.join(watchPath, item);
    if (path.extname(itemPath) === ".js") {
      filterData.push(item);
    }
  });

  return filterData;
};

const getFileName = (item, watchPath) => {
  const itemPath = path.join(watchPath, item);
  const fileBaseName = path.basename(itemPath);
  const fileExtName = path.extname(itemPath);

  return fileBaseName.replace(fileExtName, "");
};
const getTestFilePath = (fileName, watchPath) => {
  return path.join(watchPath, `/__test__/${fileName}.spec.js`);
};

const generateTestFileContent = (fileName) => {
  return `

  
test("测试${fileName}", () => {
  const paramOne = "";
  const paramTwo = "";
  const paramThree = "";
  const paramsArr = [paramOne, paramTwo, paramThree];
  
  const res = "";

  const testFunc = require("../${fileName}.js");
  const result = testFunc(...paramsArr);
  

  expect(result).toBe(res);
});
  `;
};
const generateTestFile = async (itemsArr, watchPath) => {
  await Promise.all(
    itemsArr.map(async (item) => {
      const fileName = getFileName(item, watchPath);
      const testFileName = getTestFilePath(fileName, watchPath);
      const testFileContent = generateTestFileContent(fileName);

      await ensureFile(testFileName);
      await writeFile(testFileName, testFileContent);
    })
  );
};
const deleteTestFile = async (itemsArr, watchPath) => {
  await Promise.all(
    itemsArr.map(async (item) => {
      const fileName = getFileName(item, watchPath);
      const testFileName = getTestFilePath(fileName, watchPath);

      if (await pathExists(testFileName)) {
        fs.unlinkSync(testFileName);
      }
    })
  );
};

module.exports = function (watchPath = defaultPath) {
  const oldDir = fs.readdirSync(watchPath);
  let oldFilesArr = getFilesInDir(oldDir, watchPath);

  fs.watch(watchPath, async () => {
    const newDir = fs.readdirSync(watchPath);

    const newFilesArr = getFilesInDir(newDir, watchPath);

    const newFilesLen = newFilesArr.length;
    const oldFilesLen = oldFilesArr.length;

    if (newFilesLen !== oldFilesLen) {
      if (newFilesLen > oldFilesLen) {
        const newAddItems = newFilesArr?.filter(
          (item) => !oldFilesArr.includes(item)
        );

        await generateTestFile(newAddItems, watchPath);

        console.log(`添加文件${newAddItems}成功!`);
      } else {
        const newDeleteItems = oldFilesArr?.filter(
          (item) => !newFilesArr.includes(item)
        );

        await deleteTestFile(newDeleteItems, watchPath);
        console.log(`删除文件${newDeleteItems}成功!`);
      }

      oldFilesArr = [...newFilesArr];
    }
  });
};
