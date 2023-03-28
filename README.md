# GPT-4 & LangChain - Create a ChatGPT Chatbot for Your PDF Docs

Use the new GPT-4 api to build a chatGPT chatbot for Large PDF docs (56 pages used in this example).

Tech stack used includes LangChain, Pinecone, Typescript, Openai, and Next.js. LangChain is a framework that makes it easier to build scalable AI/LLM apps and chatbots. Pinecone is a vectorstore for storing embeddings and your PDF in text to later retrieve similar docs.

[Tutorial video](https://www.youtube.com/watch?v=ih9PBGVVOO4)

[Get in touch via twitter if you have questions](https://twitter.com/mayowaoshin)

The visual guide of this repo and tutorial is in the `visual guide` folder.

## Development

1. Clone the repo

```
git clone [github https url]
```

2. Install packages

```
pnpm install
```

3. Set up your `.env` file

- Copy `.env.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

```
