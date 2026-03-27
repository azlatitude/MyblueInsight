import Foundation
import Observation
import UIKit

struct ArtMoodSample: Sendable {
    let mood: MoodColor
    let date: Date
}

enum ArtPeriod: String, CaseIterable, Identifiable, Sendable {
    case week = "Week"
    case month = "Month"
    case year = "Year"

    var id: String { rawValue }
}

enum ArtStyle: String, CaseIterable, Identifiable, Sendable {
    case watercolor
    case mosaic
    case flowField
    case nebula

    var id: String { rawValue }

    var title: String {
        switch self {
        case .watercolor: "Watercolor Blend"
        case .mosaic: "Geometric Mosaic"
        case .flowField: "Flow Field"
        case .nebula: "Nebula"
        }
    }

    var subtitle: String {
        switch self {
        case .watercolor: "Soft translucent color blooms"
        case .mosaic: "Crisp cells with bright seams"
        case .flowField: "Particle trails guided by motion"
        case .nebula: "Layered cosmic clouds and stars"
        }
    }
}

@MainActor
@Observable
final class ArtViewModel {
    var selectedStyle: ArtStyle = .watercolor
    var selectedPeriod: ArtPeriod = .month
    var generatedImage: UIImage?
    var isGenerating = false

    private(set) var lastSeed: UInt64 = UInt64.random(in: 1...UInt64.max)

    func generateArt(entries: [MoodEntry]) {
        let samples = entries.compactMap { entry -> ArtMoodSample? in
            guard let mood = entry.moodColor else { return nil }
            return ArtMoodSample(mood: mood, date: entry.date)
        }

        guard !samples.isEmpty else {
            generatedImage = nil
            return
        }

        isGenerating = true
        let style = selectedStyle
        let seed = UInt64.random(in: 1...UInt64.max)
        lastSeed = seed

        Task {
            let image = await Task.detached(priority: .userInitiated) {
                ArtGenerator.generateArt(style: style, samples: samples, seed: seed)
            }.value

            self.generatedImage = image
            self.isGenerating = false
        }
    }
}
