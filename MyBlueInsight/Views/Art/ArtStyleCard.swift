import SwiftUI

struct ArtStyleCard: View {
    let style: ArtStyle
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                previewIcon
                    .frame(width: 80, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                Text(style.title)
                    .font(.caption.bold())
                    .lineLimit(1)

                Text(style.subtitle)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 110)
            .padding(10)
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(isSelected ? Color.accentColor : Color.secondary.opacity(0.2), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var previewIcon: some View {
        switch style {
        case .watercolor:
            ZStack {
                Circle().fill(.red.opacity(0.3)).frame(width: 40).offset(x: -10, y: -5)
                Circle().fill(.blue.opacity(0.3)).frame(width: 45).offset(x: 10, y: 0)
                Circle().fill(.green.opacity(0.3)).frame(width: 35).offset(x: 0, y: 12)
            }
            .frame(width: 80, height: 80)
            .background(Color(.systemBackground))

        case .mosaic:
            Canvas { context, size in
                let cellSize: CGFloat = 16
                let colors: [Color] = [.red, .blue, .green, .yellow, .purple, .orange]
                var idx = 0
                for y in stride(from: CGFloat(0), to: size.height, by: cellSize) {
                    for x in stride(from: CGFloat(0), to: size.width, by: cellSize) {
                        let rect = CGRect(x: x + 1, y: y + 1, width: cellSize - 2, height: cellSize - 2)
                        context.fill(Path(rect), with: .color(colors[idx % colors.count]))
                        idx += 1
                    }
                }
            }
            .frame(width: 80, height: 80)

        case .flowField:
            Canvas { context, size in
                for i in 0..<20 {
                    var path = Path()
                    let y = CGFloat(i) * 4 + 2
                    path.move(to: CGPoint(x: 0, y: y))
                    for x in stride(from: CGFloat(0), to: size.width, by: 2) {
                        let yOffset = sin(x * 0.1 + CGFloat(i) * 0.5) * 6
                        path.addLine(to: CGPoint(x: x, y: y + yOffset))
                    }
                    let hue = Double(i) / 20.0
                    context.stroke(path, with: .color(Color(hue: hue, saturation: 0.7, brightness: 0.8)), lineWidth: 1.5)
                }
            }
            .frame(width: 80, height: 80)

        case .nebula:
            ZStack {
                Color(hex: "#0A0A2E")
                Circle().fill(.purple.opacity(0.3)).blur(radius: 15).offset(x: -10, y: -8)
                Circle().fill(.blue.opacity(0.2)).blur(radius: 12).offset(x: 12, y: 5)
                Circle().fill(.pink.opacity(0.15)).blur(radius: 10).offset(x: 5, y: -12)
                ForEach(0..<8, id: \.self) { i in
                    Circle()
                        .fill(.white)
                        .frame(width: 2, height: 2)
                        .offset(x: CGFloat.random(in: -30...30), y: CGFloat.random(in: -30...30))
                }
            }
            .frame(width: 80, height: 80)
        }
    }
}
