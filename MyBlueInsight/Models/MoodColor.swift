import SwiftUI

enum MoodColor: String, CaseIterable, Codable, Identifiable, Sendable {
    case red
    case orange
    case yellow
    case green
    case lightBlue
    case darkBlue
    case purple
    case pink
    case gray
    case black

    var id: String { rawValue }

    var colorHex: String {
        switch self {
        case .red: "#FF3B30"
        case .orange: "#FF9500"
        case .yellow: "#FFCC00"
        case .green: "#34C759"
        case .lightBlue: "#5AC8FA"
        case .darkBlue: "#007AFF"
        case .purple: "#AF52DE"
        case .pink: "#FF2D55"
        case .gray: "#8E8E93"
        case .black: "#1C1C1E"
        }
    }

    var displayName: String {
        switch self {
        case .red: "Angry / Frustrated"
        case .orange: "Anxious / Stressed"
        case .yellow: "Happy / Cheerful"
        case .green: "Energetic / Motivated"
        case .lightBlue: "Calm / Peaceful"
        case .darkBlue: "Sad / Blue"
        case .purple: "Creative / Inspired"
        case .pink: "Loving / Grateful"
        case .gray: "Neutral / Indifferent"
        case .black: "Exhausted / Drained"
        }
    }

    var color: Color {
        Color(hex: colorHex)
    }

    static func from(hex string: String) -> MoodColor? {
        let normalized = string
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
            .uppercased()

        return allCases.first {
            $0.colorHex.replacingOccurrences(of: "#", with: "").uppercased() == normalized
        }
    }
}
