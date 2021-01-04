const grpc = require('grpc')
const CustomerProto = grpc.load('../Proto/customer.proto')
const Controller = require('./controller')
const Database = require('./db')

async function main() {
    await Database.initialization()

    const serviceRPC = new grpc.Server()
    
    serviceRPC.addService(
        CustomerProto.CustomerService.service, {
            ...Controller
        }
    )

    serviceRPC.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())

    console.log('Server running at http://::1:50051')
    serviceRPC.start()
}


try {
    main()
} catch (error) {
    console.log(error)
    process.exit()
}