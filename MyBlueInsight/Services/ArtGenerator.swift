import UIKit
import GameplayKit

enum ArtGenerator {
    static let canvasSize: CGFloat = 1080

    static func generateArt(style: ArtStyle, entries: [MoodEntry], seed: UInt64) -> UIImage {
        let colorWeights = calculateColorWeights(entries: entries)
        let rng = GKMersenneTwisterRandomSource(seed: seed)

        switch style {
        case .watercolor: return generateWatercolor(weights: colorWeights, rng: rng)
        case .mosaic:     return generateMosaic(weights: colorWeights, rng: rng)
        case .flowField:  return generateFlowField(weights: colorWeights, rng: rng)
        case .nebula:     return generateNebula(weights: colorWeights, rng: rng)
        }
    }

    private static func calculateColorWeights(entries: [MoodEntry]) -> [(UIColor, Double)] {
        guard !entries.isEmpty else { return [] }
        let grouped = Dictionary(grouping: entries.compactMap(\.moodColor), by: { $0 })
        let total = Double(entries.count)
        return grouped.map { mood, values in
            (UIColor(mood.color), Double(values.count) / total)
        }.sorted { $0.1 > $1.1 }
    }

    private static func weightedRandomColor(weights: [(UIColor, Double)], rng: GKMersenneTwisterRandomSource) -> UIColor {
        let roll = Double(rng.nextUniform())
        var cumulative = 0.0
        for (color, weight) in weights {
            cumulative += weight
            if roll <= cumulative { return color }
        }
        return weights.last?.0 ?? .gray
    }

    // MARK: - Watercolor Blend

    private static func generateWatercolor(weights: [(UIColor, Double)], rng: GKMersenneTwisterRandomSource) -> UIImage {
        let size = CGSize(width: canvasSize, height: canvasSize)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { ctx in
            UIColor.white.setFill()
            ctx.fill(CGRect(origin: .zero, size: size))

            for (color, weight) in weights {
                let circleCount = Int(weight * 120) + 10
                for _ in 0..<circleCount {
                    let x = CGFloat(rng.nextUniform()) * canvasSize
                    let y = CGFloat(rng.nextUniform()) * canvasSize
                    let radius = CGFloat(rng.nextUniform()) * 150 + 50
                    let alpha = CGFloat(rng.nextUniform()) * 0.2 + 0.05

                    let rect = CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2)
                    color.withAlphaComponent(alpha).setFill()
                    ctx.cgContext.fillEllipse(in: rect)
                }
            }

            for _ in 0..<200 {
                let color = weightedRandomColor(weights: weights, rng: rng)
                let x = CGFloat(rng.nextUniform()) * canvasSize
                let y = CGFloat(rng.nextUniform()) * canvasSize
                let radius = CGFloat(rng.nextUniform()) * 30 + 10
                let alpha = CGFloat(rng.nextUniform()) * 0.15 + 0.05

                let rect = CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2)
                color.withAlphaComponent(alpha).setFill()
                ctx.cgContext.fillEllipse(in: rect)
            }
        }
    }

    // MARK: - Geometric Mosaic

    private static func generateMosaic(weights: [(UIColor, Double)], rng: GKMersenneTwisterRandomSource) -> UIImage {
        let size = CGSize(width: canvasSize, height: canvasSize)
        let renderer = UIGraphicsImageRenderer(size: size)

        let pointCount = 300
        var points: [CGPoint] = []
        for _ in 0..<pointCount {
            let x = CGFloat(rng.nextUniform()) * canvasSize
            let y = CGFloat(rng.nextUniform()) * canvasSize
            points.append(CGPoint(x: x, y: y))
        }

        var pointColors: [UIColor] = []
        for _ in 0..<pointCount {
            pointColors.append(weightedRandomColor(weights: weights, rng: rng))
        }

        return renderer.image { ctx in
            UIColor.white.setFill()
            ctx.fill(CGRect(origin: .zero, size: size))

            let cellSize: CGFloat = 6
            for y in stride(from: CGFloat(0), to: canvasSize, by: cellSize) {
                for x in stride(from: CGFloat(0), to: canvasSize, by: cellSize) {
                    let pixel = CGPoint(x: x + cellSize / 2, y: y + cellSize / 2)
                    var minDist = CGFloat.greatestFiniteMagnitude
                    var nearestIdx = 0

                    for (idx, pt) in points.enumerated() {
                        let dx = pixel.x - pt.x
                        let dy = pixel.y - pt.y
                        let dist = dx * dx + dy * dy
                        if dist < minDist {
                            minDist = dist
                            nearestIdx = idx
                        }
                    }

                    pointColors[nearestIdx].setFill()
                    ctx.cgContext.fill(CGRect(x: x, y: y, width: cellSize, height: cellSize))
                }
            }

            UIColor.white.withAlphaComponent(0.6).setStroke()
            ctx.cgContext.setLineWidth(1.0)
            for y in stride(from: CGFloat(0), to: canvasSize, by: cellSize) {
                for x in stride(from: CGFloat(0), to: canvasSize - cellSize, by: cellSize) {
                    let p1 = CGPoint(x: x + cellSize / 2, y: y + cellSize / 2)
                    let p2 = CGPoint(x: x + cellSize * 1.5, y: y + cellSize / 2)

                    let n1 = nearestPointIndex(to: p1, points: points)
                    let n2 = nearestPointIndex(to: p2, points: points)

                    if n1 != n2 {
                        ctx.cgContext.move(to: CGPoint(x: x + cellSize, y: y))
                        ctx.cgContext.addLine(to: CGPoint(x: x + cellSize, y: y + cellSize))
                        ctx.cgContext.strokePath()
                    }
                }
            }
        }
    }

    private static func nearestPointIndex(to pixel: CGPoint, points: [CGPoint]) -> Int {
        var minDist = CGFloat.greatestFiniteMagnitude
        var idx = 0
        for (i, pt) in points.enumerated() {
            let dx = pixel.x - pt.x
            let dy = pixel.y - pt.y
            let dist = dx * dx + dy * dy
            if dist < minDist {
                minDist = dist
                idx = i
            }
        }
        return idx
    }

    // MARK: - Flow Field

    private static func generateFlowField(weights: [(UIColor, Double)], rng: GKMersenneTwisterRandomSource) -> UIImage {
        let size = CGSize(width: canvasSize, height: canvasSize)
        let renderer = UIGraphicsImageRenderer(size: size)

        let gridSize = 40
        let scale = canvasSize / CGFloat(gridSize)
        var field: [[CGFloat]] = Array(repeating: Array(repeating: 0, count: gridSize + 1), count: gridSize + 1)
        let noiseFreq = CGFloat(rng.nextUniform()) * 3 + 2

        for row in 0...gridSize {
            for col in 0...gridSize {
                let x = CGFloat(col) / CGFloat(gridSize)
                let y = CGFloat(row) / CGFloat(gridSize)
                let angle = sin(x * noiseFreq * .pi) * cos(y * noiseFreq * .pi) * .pi * 2
                    + CGFloat(rng.nextUniform()) * 0.5
                field[row][col] = angle
            }
        }

        return renderer.image { ctx in
            UIColor(white: 0.97, alpha: 1).setFill()
            ctx.fill(CGRect(origin: .zero, size: size))

            let particleCount = 1500
            let steps = 80

            for _ in 0..<particleCount {
                let color = weightedRandomColor(weights: weights, rng: rng)
                let alpha = CGFloat(rng.nextUniform()) * 0.3 + 0.15
                color.withAlphaComponent(alpha).setStroke()
                ctx.cgContext.setLineWidth(CGFloat(rng.nextUniform()) * 1.5 + 0.5)

                var x = CGFloat(rng.nextUniform()) * canvasSize
                var y = CGFloat(rng.nextUniform()) * canvasSize

                let path = UIBezierPath()
                path.move(to: CGPoint(x: x, y: y))

                for _ in 0..<steps {
                    let col = Int(x / scale)
                    let row = Int(y / scale)
                    guard row >= 0, row < gridSize, col >= 0, col < gridSize else { break }

                    let angle = field[row][col]
                    let stepLen: CGFloat = 2.0
                    x += cos(angle) * stepLen
                    y += sin(angle) * stepLen

                    guard x >= 0, x < canvasSize, y >= 0, y < canvasSize else { break }
                    path.addLine(to: CGPoint(x: x, y: y))
                }

                path.stroke()
            }
        }
    }

    // MARK: - Nebula

    private static func generateNebula(weights: [(UIColor, Double)], rng: GKMersenneTwisterRandomSource) -> UIImage {
        let size = CGSize(width: canvasSize, height: canvasSize)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { ctx in
            UIColor(red: 0.04, green: 0.04, blue: 0.18, alpha: 1).setFill()
            ctx.fill(CGRect(origin: .zero, size: size))

            let cgCtx = ctx.cgContext

            for (color, weight) in weights {
                let cloudCount = Int(weight * 30) + 3
                for _ in 0..<cloudCount {
                    let cx = CGFloat(rng.nextUniform()) * canvasSize
                    let cy = CGFloat(rng.nextUniform()) * canvasSize
                    let radius = CGFloat(rng.nextUniform()) * 300 + 100
                    let alpha = CGFloat(rng.nextUniform()) * 0.15 + 0.03

                    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
                    color.getRed(&r, green: &g, blue: &b, alpha: &a)

                    let colorSpace = CGColorSpaceCreateDeviceRGB()
                    let colors = [
                        CGColor(colorSpace: colorSpace, components: [r, g, b, alpha])!,
                        CGColor(colorSpace: colorSpace, components: [r, g, b, 0])!
                    ] as CFArray
                    let locations: [CGFloat] = [0.0, 1.0]

                    if let gradient = CGGradient(colorsSpace: colorSpace, colors: colors, locations: locations) {
                        cgCtx.saveGState()
                        cgCtx.drawRadialGradient(
                            gradient,
                            startCenter: CGPoint(x: cx, y: cy),
                            startRadius: 0,
                            endCenter: CGPoint(x: cx, y: cy),
                            endRadius: radius,
                            options: []
                        )
                        cgCtx.restoreGState()
                    }
                }
            }

            for _ in 0..<50 {
                let color = weightedRandomColor(weights: weights, rng: rng)
                let cx = CGFloat(rng.nextUniform()) * canvasSize
                let cy = CGFloat(rng.nextUniform()) * canvasSize
                let radius = CGFloat(rng.nextUniform()) * 60 + 20

                color.withAlphaComponent(0.08).setFill()
                cgCtx.fillEllipse(in: CGRect(x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2))
            }

            for _ in 0..<300 {
                let x = CGFloat(rng.nextUniform()) * canvasSize
                let y = CGFloat(rng.nextUniform()) * canvasSize
                let starRadius = CGFloat(rng.nextUniform()) * 1.5 + 0.5
                let starAlpha = CGFloat(rng.nextUniform()) * 0.7 + 0.3

                UIColor.white.withAlphaComponent(starAlpha).setFill()
                cgCtx.fillEllipse(in: CGRect(x: x - starRadius, y: y - starRadius, width: starRadius * 2, height: starRadius * 2))
            }

            for _ in 0..<20 {
                let x = CGFloat(rng.nextUniform()) * canvasSize
                let y = CGFloat(rng.nextUniform()) * canvasSize
                let r = CGFloat(rng.nextUniform()) * 2 + 1.5

                UIColor.white.setFill()
                cgCtx.fillEllipse(in: CGRect(x: x - r, y: y - r, width: r * 2, height: r * 2))

                UIColor.white.withAlphaComponent(0.1).setFill()
                cgCtx.fillEllipse(in: CGRect(x: x - r * 3, y: y - r * 3, width: r * 6, height: r * 6))
            }
        }
    }
}
