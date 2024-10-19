import Foundation

struct HTTPPacket {
    var sourceIP: String
    var destinationIP: String
    var headers: [String: String]
    var body: Data?
    
    init(sourceIP: String, destinationIP: String, headers: [String: String], body: Data? = nil) {
        self.sourceIP = sourceIP
        self.destinationIP = destinationIP
        self.headers = headers
        self.body = body
    }
}