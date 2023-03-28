# GPT-4 & LangChain - GPT Chatbot trained on your docs

Thanks to the OG Mayooear<twitter:@mayowaoshin> for the original repo

Firstly generates docs from any file type and saves in a Document json. Then uploads to a pinecone db where you can then talk with the bot.

```
// generate .md files from directory and output document files
yarn gen <directory path> <file name>

yarn gen /cairo .cairo

```

```
// load into pinecone
yarn ingest

yarn gen /cairo .cairo

```


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
