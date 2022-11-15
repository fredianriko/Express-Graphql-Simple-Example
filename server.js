// dependencies
const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const {GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLList} = require('graphql')



// express instance
const app = express()
const port = 5000


// dummy object
let authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

let books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]



// book type

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent a book written by author',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        authorId:  {
            type: new GraphQLNonNull(GraphQLInt)
        },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})


// Author type
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent an author of a book',

    // fields
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        authorId: {
            type: new GraphQLNonNull(GraphQLInt)    
        },
        author: {
            type: new GraphQLList(BookType),
            resolve : (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})


// Root Query
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parents, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve : () => books
        },
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parents, args) => {
                // if id passed is beyond the authors length
                if(args.id > authors.length){
                    return Error("no author id or id is more than the length of authors data")
                }
                return authors.find(author => author.id === args.id)
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of author',
            resolve: () => authors
        }
    })
})


// Root Mutation
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (parent, args) => {

                const newBook = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }

                books.push(newBook)
                return newBook
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an Author',
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (parent, args) => {
                const newAuthor = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(newAuthor)
                return newAuthor
            }
        },
        removeBooks: {
            type: BookType,
            description: 'remove one book from database',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (parent, args) => {
                books = books.filter(book => book.id !== args.id)
                return books
            }
        },
    })
})




// schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))



app.listen(port, () => {
    console.log(`server start at port ${port}`)
})