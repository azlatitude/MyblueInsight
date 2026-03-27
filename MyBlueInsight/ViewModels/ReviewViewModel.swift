import Foundation
import Observation

@Observable
final class ReviewViewModel {
    private var entries: [MoodEntry] = []

    func configure(entries: [MoodEntry]) {
        self.entries = entries.sorted { $0.date < $1.date }
    }

    func moodsForWeek(containing date: Date) -> [MoodEntry] {
        let start = date.startOfWeek
        let end = date.endOfWeek
        return entries.filter { $0.date >= start && $0.date <= end }
    }

    func moodsForMonth(date: Date) -> [MoodEntry] {
        let start = date.startOfMonth
        let end = date.endOfMonth
        return entries.filter { $0.date >= start && $0.date <= end }
    }

    func moodsForYear(year: Int) -> [MoodEntry] {
        var components = DateComponents()
        components.year = year
        let calendar = Calendar.current
        guard let start = calendar.date(from: components)?.startOfYear else { return [] }
        let end = start.endOfYear
        return entries.filter { $0.date >= start && $0.date <= end }
    }

    func moodDistribution(entries: [MoodEntry]) -> [(MoodColor, Double)] {
        guard !entries.isEmpty else { return [] }

        let grouped = Dictionary(grouping: entries.compactMap(\.moodColor), by: { $0 })
        let total = Double(entries.count)

        return grouped
            .map { mood, values in (mood, Double(values.count) / total) }
            .sorted { $0.1 > $1.1 }
    }

    func mostCommonMood(entries: [MoodEntry]) -> MoodColor? {
        moodDistribution(entries: entries).first?.0
    }

    func longestStreak(entries: [MoodEntry]) -> (MoodColor, Int)? {
        let sortedEntries = entries.sorted { $0.date < $1.date }
        guard let firstMood = sortedEntries.first?.moodColor else { return nil }

        var bestMood = firstMood
        var bestCount = 1
        var currentMood = firstMood
        var currentCount = 1
        var previousDate = sortedEntries[0].date

        for entry in sortedEntries.dropFirst() {
            guard let mood = entry.moodColor else { continue }
            let nextExpectedDate = Calendar.current.date(byAdding: .day, value: 1, to: previousDate)?.startOfDay

            if mood == currentMood, nextExpectedDate?.isSameDay(as: entry.date) == true {
                currentCount += 1
            } else {
                currentMood = mood
                currentCount = 1
            }

            if currentCount > bestCount {
                bestCount = currentCount
                bestMood = currentMood
            }

            previousDate = entry.date
        }

        return (bestMood, bestCount)
    }

    func diversityScore(entries: [MoodEntry]) -> Int {
        guard !entries.isEmpty else { return 0 }
        let uniqueMoodCount = Set(entries.compactMap(\.moodColor)).count
        return Int((Double(uniqueMoodCount) / Double(MoodColor.allCases.count)) * 100)
    }
}
