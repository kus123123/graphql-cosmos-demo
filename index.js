require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server-express')
const { CosmosClient } = require('@azure/cosmos')
const express = require('express')


const client = new CosmosClient({
  endpoint: process.env.ENDPOINT,
  key: process.env.KEY
})

const container = client
  .database(process.env.DATABASE)
  .container(process.env.CONTAINER)

const typeDefs = gql`
 

  type Heroes {
    id: ID!
    name: String!
    course: String!
  }
  type Query {
    datas: [Heroes]
    data(id: ID!): Heroes
  }
  type Mutation {
    createData(id: ID! , name: String! , course: String!): Heroes
  }
`

const resolvers = {
  Query: {
    datas: async () => {
      const response = await container.items.query('SELECT * from c').fetchAll()
      return response.resources
    },
    data: async (root, { id }) => {
      const response = await container.item(id, undefined).read()
      return response.resource
    }
  },
  Mutation: {
    createData: async (root, args) => {
      const response = await container.items.create(args)
      return response.resource
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
const app = express();

server.start().then(() => {
server.applyMiddleware({ app });
});
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
