// Client
export function createRequest(req, {endpoint, serviceName, methodName}){
  if(!req) req = {}
  let hasBody = Object.keys(req).length !== 0

  let url = `${endpoint}/${serviceName}/${methodName}`
  let method = hasBody ? 'POST': 'GET'
  let headers = {'Content-type': 'application/json'}
  let body = hasBody ? JSON.stringify(req) : undefined

  return {
    url, method, headers, body
  }
}

export async function processRequest(resp){
  let body = await resp.json()
  return body
}

export function Api({endpoint, fetch} = {}){
  return new Proxy({}, {
    get(_, serviceName){
      return new Proxy({}, {
        get(_, methodName){
          return async (req = {}) => {
            let requestParams = createRequest(req, {endpoint, serviceName, methodName})
            try {
              let resp = await fetch(requestParams.url, {method: requestParams.method, body: requestParams.body, headers: requestParams.headers})
              return processRequest(resp)
            } catch (err) {
              console.log(err)
            }
          }
        }
      })
    }
  })
}