import Foundation

extension Date {
    private var calendar: Calendar { Calendar.current }

    var startOfDay: Date {
        calendar.startOfDay(for: self)
    }

    var startOfMonth: Date {
        let components = calendar.dateComponents([.year, .month], from: self)
        return calendar.date(from: components) ?? self.startOfDay
    }

    var endOfMonth: Date {
        guard let nextMonth = calendar.date(byAdding: .month, value: 1, to: startOfMonth),
              let end = calendar.date(byAdding: .day, value: -1, to: nextMonth.startOfDay) else {
            return self
        }
        return end
    }

    var daysInMonth: Int {
        calendar.range(of: .day, in: .month, for: self)?.count ?? 0
    }

    var firstWeekdayOfMonth: Int {
        calendar.component(.weekday, from: startOfMonth)
    }

    var isToday: Bool {
        calendar.isDateInToday(self)
    }

    var isFuture: Bool {
        startOfDay > Date().startOfDay
    }

    func isSameDay(as other: Date) -> Bool {
        calendar.isDate(self, inSameDayAs: other)
    }

    var startOfWeek: Date {
        var isoCalendar = Calendar(identifier: .iso8601)
        isoCalendar.timeZone = calendar.timeZone
        let components = isoCalendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        return isoCalendar.date(from: components) ?? startOfDay
    }

    var endOfWeek: Date {
        guard let date = calendar.date(byAdding: .day, value: 6, to: startOfWeek) else {
            return self
        }
        return date.startOfDay
    }

    var startOfYear: Date {
        let components = calendar.dateComponents([.year], from: self)
        return calendar.date(from: components) ?? startOfDay
    }

    var endOfYear: Date {
        guard let nextYear = calendar.date(byAdding: .year, value: 1, to: startOfYear),
              let end = calendar.date(byAdding: .day, value: -1, to: nextYear.startOfDay) else {
            return self
        }
        return end
    }
}
