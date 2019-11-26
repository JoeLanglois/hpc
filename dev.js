import makeServer from './src/index'

let server = makeServer()

const getById = async ({id}) => {
  if(!id) return {error: 'invalid id'}

  return {id, name: "Some dude!"}
}

server.service({getById}, 'users')

server.start(3030).then(_ => console.log("> Server started on port", 3030))