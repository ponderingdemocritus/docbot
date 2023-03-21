import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { pinecone } from '@/utils/pinecone-client';
// import { PDFLoader } from 'langchain/document_loaders';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { TextLoader } from "langchain/document_loaders";

import fs from 'fs';
import path from 'path';

/* Name of directory to retrieve files from. You can change this as required */
// const filePath = 'docs/230310130.pdf';

const processDirectory = async (directoryPath: any) => {
  try {
    const items = await fs.promises.readdir(directoryPath);

    for (const item of items) {
      const itemPath = path.join(directoryPath, item);
      const stats = await fs.promises.stat(itemPath);

      if (stats.isDirectory()) {
        await processDirectory(itemPath);
      } else if (stats.isFile() && path.extname(itemPath) === '.adoc') {
        console.log(`Processing file: ${itemPath}`);
        await run(itemPath);
        console.log('Ingestion complete for', itemPath);
      }
    }
  } catch (error) {
    console.log('Error processing directory:', error);
    throw new Error('Failed to process the directory');
  }
};

export const run = async (filePath: string) => {
  try {
    /*load raw docs from the pdf file in the directory */
    // const loader = new PDFLoader(filePath);
    const loader = new TextLoader(filePath);
    // const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    console.log(rawDocs);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
    //embed the PDF documents
    await PineconeStore.fromDocuments(
      index,
      docs,
      embeddings,
      'text',
      PINECONE_NAME_SPACE,
    );
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  const rootDirectoryPath = '/home/os/Documents/GPT/starknet-docs'
  await processDirectory(rootDirectoryPath);
  console.log('ingestion complete');
})();
