import Foundation
import SwiftData

@Model
final class MoodEntry {
    @Attribute(.unique) var id: UUID
    @Attribute(.unique) var date: Date
    var colorHex: String
    var moodName: String
    var note: String?
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        date: Date,
        colorHex: String,
        moodName: String,
        note: String? = nil,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        let normalizedDate = Calendar.current.startOfDay(for: date)

        self.id = id
        self.date = normalizedDate
        self.colorHex = colorHex
        self.moodName = moodName
        self.note = MoodEntry.trimmedNote(note)
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    var moodColor: MoodColor? {
        MoodColor.from(hex: colorHex)
    }

    func update(mood: MoodColor, note: String?) {
        colorHex = mood.colorHex
        moodName = mood.displayName
        self.note = MoodEntry.trimmedNote(note)
        updatedAt = .now
    }

    private static func trimmedNote(_ note: String?) -> String? {
        guard let note else { return nil }

        let trimmed = String(note.trimmingCharacters(in: .whitespacesAndNewlines).prefix(280))
        return trimmed.isEmpty ? nil : trimmed
    }
}
