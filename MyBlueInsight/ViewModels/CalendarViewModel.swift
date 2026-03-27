import Foundation
import Observation
import SwiftData

@Observable
final class CalendarViewModel {
    var currentMonth: Date
    var selectedDate: Date?
    var showingMoodPicker = false

    private var entries: [MoodEntry] = []
    private var modelContext: ModelContext?
    private var calendar: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.firstWeekday = 1
        return calendar
    }()

    init(currentMonth: Date = .now, selectedDate: Date? = nil) {
        self.currentMonth = currentMonth.startOfMonth
        self.selectedDate = selectedDate
    }

    func configure(modelContext: ModelContext, entries: [MoodEntry]) {
        self.modelContext = modelContext
        self.entries = entries
    }

    func daysForMonth() -> [[Date?]] {
        let monthStart = currentMonth.startOfMonth
        let daysInMonth = monthStart.daysInMonth
        let leadingPadding = max(0, monthStart.firstWeekdayOfMonth - calendar.firstWeekday)

        var days: [Date?] = Array(repeating: nil, count: leadingPadding)

        for offset in 0..<daysInMonth {
            if let date = calendar.date(byAdding: .day, value: offset, to: monthStart) {
                days.append(date)
            }
        }

        while days.count % 7 != 0 {
            days.append(nil)
        }

        return stride(from: 0, to: days.count, by: 7).map {
            Array(days[$0..<min($0 + 7, days.count)])
        }
    }

    func mood(for date: Date) -> MoodEntry? {
        let targetDate = date.startOfDay
        return entries.first { $0.date.isSameDay(as: targetDate) }
    }

    func saveMood(date: Date, mood: MoodColor, note: String?) {
        guard let modelContext else { return }

        let targetDate = date.startOfDay

        if let existing = mood(for: targetDate) {
            existing.update(mood: mood, note: note)
        } else {
            let entry = MoodEntry(date: targetDate, colorHex: mood.colorHex, moodName: mood.displayName, note: note)
            modelContext.insert(entry)
            entries.append(entry)
        }

        do {
            try modelContext.save()
        } catch {
            assertionFailure("Failed to save mood: \(error)")
        }
    }

    func navigateMonth(offset: Int) {
        guard let newDate = calendar.date(byAdding: .month, value: offset, to: currentMonth) else { return }
        currentMonth = newDate.startOfMonth
    }

    func presentMoodPicker(for date: Date) {
        guard !date.isFuture else { return }
        selectedDate = date.startOfDay
        showingMoodPicker = true
    }
}
