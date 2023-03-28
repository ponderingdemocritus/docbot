

import fs from 'fs';
import path from 'path';
import frontMatter from 'front-matter';

const outputPath = './output.json'; // Replace this with your desired output file path

function readDir(dirPath: string) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
      if (err) {
        reject(err);
      } else {
        resolve(entries);
      }
    });
  });
}

function readFile(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err: any, content: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

function writeFile(filePath: string, content: string) {
  if (!filePath.endsWith('.md')) {
    filePath += '.md';
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf8', (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

async function crawlMdFiles(dirPath: any, fileExtension = '.cairo'): Promise<any> {
  const { OpenAI } = await import('langchain');
  const model = new OpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: process.env.OPENAI_API_KEY });

  const entries: any = await readDir(dirPath);
  const mdObjects = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nestedMdObjects = await crawlMdFiles(entryPath);
      mdObjects.push(...nestedMdObjects);
    } else if (entry.isFile() && path.extname(entry.name) === '.cairo') {
      const content: any = await readFile(entryPath);

      console.log(content)

      const finalResponse = await model.call("Cairo is a new programming language for writing smart contracts for the starknet blockchain. It has similar semantics to rust but has a simpler, more limited feature set. Some important differences are: - Rust lifetime syntax are not supported. - Cairo does not support for loops. For example for i in 0..10 is not supported. - Only recursion is supported. No for loops and no while loops. - Functional operators such as map, filter, and iter are not supported. Write write documentation for these and return in a .md file: " + content)

      const parsedContent = frontMatter(content);

      await writeFile("./docs/" + entry.name.split(".cairo")[0] + '.md', finalResponse);

      mdObjects.push({
        pageContent: parsedContent.body,
        metadata: { name: entry.name },
      });
    }
  }

  return mdObjects;
}

(async () => {
  const dirPath = process.argv[2];
  const fileExtension = process.argv[3];

  try {
    const mdObjects = await crawlMdFiles(dirPath, fileExtension);
    const jsonContent = JSON.stringify(mdObjects, null, 2);
    await writeFile(outputPath, jsonContent);
    console.log(`Output written to ${outputPath}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();