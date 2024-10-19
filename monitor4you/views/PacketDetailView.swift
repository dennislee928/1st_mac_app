import SwiftUI

struct PacketDetailView: View {
    var packet: HTTPPacket
    
    var body: some View {
        VStack {
            Text("Source IP: \(packet.sourceIP)")
            Text("Destination IP: \(packet.destinationIP)")
            // 顯示更多封包詳細信息
        }
        .padding()
    }
}

struct PacketDetailView_Previews: PreviewProvider {
    static var previews: some View {
        PacketDetailView(packet: HTTPPacket(sourceIP: "192.168.1.1", destinationIP: "192.168.1.2", headers: [:]))
    }
}