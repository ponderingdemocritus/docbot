# Generate docs with GPT then discuss

Thanks to the OG Mayooear<twitter:@mayowaoshin> for the original repo.

This repo allows you to generate .md docs from any file type which then can be uploaded into a pinecone db for questions. The preprocess of generating the .md files is essential for the vector db fetching.

```
// generate .md files from directory and output document files
yarn gen <directory path> <file name>

yarn gen /cairo .cairo
```

```
// load into pinecone
// This part is manual, you can freely adjust the document loaders to your liking.
yarn ingest
```

```
// talk to the bot
yarn dev
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

If running Node 17 or less you will need to:

```
export NODE_TLS_REJECT_UNAUTHORIZED='0'
export NODE_OPTIONS='--experimental-fetch'
```