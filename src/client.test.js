import {createRequest, Api} from './client'
import {test} from 'zora'

let defaultParams = {endpoint: 'someendpoint', serviceName: 'service', methodName: 'method'}

test('createRequest', t => {
  t.test('should create a proper url', t => {
    const {url} = createRequest({}, {endpoint: 'https://localhost:3030/rpc', serviceName: 'someService', methodName: 'someMethod'})
    t.eq(url, `https://localhost:3030/rpc/someService/someMethod`)
  })
  
  t.test('should choose the correct method', t => {
    const {method} = createRequest({some: 'object'}, defaultParams)
    t.eq(method, 'POST')

    let {method: method2} = createRequest(null, defaultParams)
    t.eq(method2, 'GET')
  })

  t.test('should set correct headers', t => {
    const {headers} = createRequest({}, defaultParams)
    t.deepEqual(headers['Content-type'], 'application/json')
  })

  t.test('should set correct body', t => {
    const {body} = createRequest(null, defaultParams)
    t.equal(body, undefined)

    let bod = {some: 'obj'}
    const {body: body2} = createRequest(bod, defaultParams)
    t.eq(body2, JSON.stringify(bod))
  })
})

const fakeFetch = (resp) => (endpoint, params) => {
  fakeFetch.calledWith = {endpoint, params}
  return Promise.resolve({json: _ => Promise.resolve(resp)})
}

const endpoint = 'https://localhost:5050/rpc'
const params = {fetch: fakeFetch(null), endpoint}

test('Api()', t => {
  t.test('should return a getter proxy that returns another getter proxy that returns a request method', t => {
    let api = Api(params)
    let service = api.users
    let method = service.someMethod

    t.eq(typeof method, 'function')
  })
})


test('integration testing', async t => {
  let req = {some: 'id'}
  let resp = {id: 'some-id'}

  let api = Api({endpoint: 'someendpoint/rpc', fetch: fakeFetch(resp)})
  let response = await api.someService.methodName(req)

  t.deepEqual(response, resp)

  t.deepEqual(fakeFetch.calledWith, {endpoint: 'someendpoint/rpc/someService/methodName', params: {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify(req)
  }}, 'called fetch with')
})
