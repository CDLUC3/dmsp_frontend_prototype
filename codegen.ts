import type { CodegenConfig } from "@graphql-codegen/cli"
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
  documents: [
    'graphql/**/*.graphql',
  ],
  generates: {
    'generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo' // generates React hooks like useGetUserQuery
      ]
    }
  }
}

export default config