import Foundation
import SwiftData

@Model
final class Artwork {
    @Attribute(.unique) var id: UUID
    var imageData: Data
    var timeRangeStart: Date
    var timeRangeEnd: Date
    var style: String
    var generatedAt: Date

    init(
        id: UUID = UUID(),
        imageData: Data,
        timeRangeStart: Date,
        timeRangeEnd: Date,
        style: String,
        generatedAt: Date = .now
    ) {
        self.id = id
        self.imageData = imageData
        self.timeRangeStart = timeRangeStart
        self.timeRangeEnd = timeRangeEnd
        self.style = style
        self.generatedAt = generatedAt
    }
}
