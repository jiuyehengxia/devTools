const fs = require("fs");
const path = require("path");
const { pathExists, ensureFile, writeFile } = require("fs-extra");

const relativePath = "";
const leetCodePath = path.join(__dirname, relativePath);

const getFilesInDir = wholeArr => {
  const filterData = [];

  wholeArr.forEach(item => {
    const itemPath = path.join(leetCodePath, item);
    if (path.extname(itemPath) === ".js") {
      filterData.push(item);
    }
  });

  return filterData;
};

const oldDir = fs.readdirSync(leetCodePath);
let oldFilesArr;
oldFilesArr = getFilesInDir(oldDir);

const getFileName = item => {
  const itemPath = path.join(leetCodePath, item);
  const fileBaseName = path.basename(itemPath);
  const fileExtName = path.extname(itemPath);

  return fileBaseName.replace(fileExtName, "");
};
const getTestFilePath = fileName => {
  return path.join(leetCodePath, `/__test__/${fileName}.spec.js`);
};

const generateTestFileContent = fileName => {
  return `

  
test("测试${fileName}", () => {
  const testParamOne = "";
  const testParamTwo = "";
  const testParamsArr = [testParamOne, testParamTwo];
  
  const testRes = "";

  const testFunc = require("../${fileName}.js");
  const result = testFunc(...testParamsArr);
  

  expect(result).toBe(testRes);
});
  `;
};
const generateTestFile = async itemsArr => {
  await Promise.all(
    itemsArr.map(async item => {
      const fileName = getFileName(item);
      const testFileName = getTestFilePath(fileName);
      const testFileContent = generateTestFileContent(fileName);

      await ensureFile(testFileName);
      await writeFile(testFileName, testFileContent);
    })
  );
};
const deleteTestFile = async itemsArr => {
  await Promise.all(
    itemsArr.map(async item => {
      const fileName = getFileName(item);
      const testFileName = getTestFilePath(fileName);

      if (await pathExists(testFileName)) {
        fs.unlinkSync(testFileName);
      }
    })
  );
};

fs.watch(leetCodePath, async () => {
  const newDir = fs.readdirSync(leetCodePath);

  const newFilesArr = getFilesInDir(newDir);

  const newFilesLen = newFilesArr.length;
  const oldFilesLen = oldFilesArr.length;

  if (newFilesLen !== oldFilesLen) {
    if (newFilesLen > oldFilesLen) {
      const newAddItems = newFilesArr?.filter(
        item => !oldFilesArr.includes(item)
      );

      await generateTestFile(newAddItems);

      console.log(`添加文件${newAddItems}成功!`);
    } else {
      const newDeleteItems = oldFilesArr?.filter(
        item => !newFilesArr.includes(item)
      );

      await deleteTestFile(newDeleteItems);
      console.log(`删除文件${newDeleteItems}成功!`);
    }

    oldFilesArr = [...newFilesArr];
  }
});
