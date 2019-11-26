let internalService = services => ({
  endpoints: () => {
    let data = Object.keys(services).filter(name => name !== 'internal').map(name => {
      return {name, endpoints: Object.keys(services[name])}
    })

    return {
      services: data
    }
  }
})

export function HPC(){
  let services = {}

  services.internal = internalService(services)

  function service(serviceObj, name){
    services[name] = serviceObj
  }

  async function call(serviceName, methodName, request){
    let service = services[serviceName]
    if(!service) return {internal: 'ServiceNotFound', message: `Service not found: ${serviceName}`}
    
    let method = service[methodName]
    if(!method) return {internal: 'MethodNotFound', message: `Method not found: ${methodName}`}
    
    
    // Call the method
    try {
      let res = await method(request)  
      return res
    } catch (err) {
      console.log(err)
      return {internal: 'InternalError'}
    }
  }

  return {service, call, services}
}
