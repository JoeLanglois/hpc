import {HPC} from './hpc'
import {test} from 'zora'

test('should add a service and its methods', t => {
  let hpc = HPC()
  let service = {
    add({}){
      return {res: 321}
    }
  }
  
  hpc.service(service, 'math')

  t.ok(Object.keys(hpc.services).includes('math'))

  let serviceDef = hpc.services.math
  t.ok(Object.keys(serviceDef).includes('add'))
})

test('should return an error on calling a non-existing service or method', async t => {
  let hpc = HPC()

  hpc.service({add(req){return req}}, 'service1')
  hpc.service({}, 'service2')

  let resp = await hpc.call('service', 'kdodwa', {})
  t.eq(resp.internal, 'ServiceNotFound')
  
  resp = await hpc.call('service1', 'someMethod', {})
  t.eq(resp.internal, 'MethodNotFound')

  resp = await hpc.call('service1', 'add', {one: 1})
  t.deepEqual(resp, {one: 1})
})

test('should return a promise of what the handler returns', async t => {
  let hpc = HPC()
  let user = {name: "Joe", id: "u90dwa"}

  hpc.service({getUser(){
    return user
  }}, 'users')

  let resp = hpc.call('users', 'getUser', {})
  t.truthy(resp.then !== undefined)
  t.deepEqual(await resp, user)
})

test('should return the promise the handler returns', async t => {
  let hpc = HPC()
  let user = {name: "Joe", id: "u90dwa"}

  hpc.service({getUser(){
    return Promise.resolve(user)
  }}, 'users')

  let resp = await hpc.call('users', 'getUser', {})
  t.deepEqual(resp, user)
})

test('should return an error message if the promise rejects', async t => {
  let hpc = HPC()
  hpc.service({
    async someMethod(){
      throw new Error('Some error')
    }
  }, 'service')

  let resp = await hpc.call('service', 'someMethod', {})
  t.eq(resp.internal, 'InternalError')
})

test('should have an internal service with an endpoints method', t => {
  let hpc = HPC()
  t.equal(Object.keys(hpc.services), ['internal'])
})
