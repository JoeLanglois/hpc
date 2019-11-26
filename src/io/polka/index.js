import polka from 'polka'
import bodyParser from 'body-parser'
import cors from 'cors'
import {HPC} from '../../hpc'

export function makeServer(){
  let hpc = HPC()

  let app = polka()
    .options('*', cors())
    .use(cors(), bodyParser.json())
    .all('rpc/:service/:methodName', cors(), async (req, res) => {
      const {service, methodName} = req.params
      const {method} = req
      if(method !== 'POST' && method !== 'GET') return res.writeHead(400, {'Content-type': 'application/json'}).end()
      
      let resp = await hpc.call(service, methodName, req.body)

      res.writeHead(200, {'Content-type': 'application/json'})
      res.end(JSON.stringify(resp))
    })  

  return {
    service: hpc.service,
    start:  (port) => {
      return new Promise((res, rej) => {
        app.listen(port, err => {
          if(err) return rej(err)
          res()
        })
      })
    }
  }
}
