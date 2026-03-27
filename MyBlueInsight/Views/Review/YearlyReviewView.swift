import SwiftUI

struct YearlyReviewView: View {
    let viewModel: ReviewViewModel
    @State private var currentYear: Int = Calendar.current.component(.year, from: .now)
    @State private var selectedEntry: MoodEntry?

    private var yearEntries: [MoodEntry] {
        viewModel.moodsForYear(year: currentYear)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                yearNavigator
                yearGrid
                yearStatistics
            }
            .padding()
        }
    }

    private var yearNavigator: some View {
        HStack {
            Button {
                currentYear -= 1
            } label: {
                Image(systemName: "chevron.left")
            }

            Spacer()

            Text(String(currentYear))
                .font(.headline)

            Spacer()

            Button {
                currentYear += 1
            } label: {
                Image(systemName: "chevron.right")
            }
        }
    }

    private var yearGrid: some View {
        let months = (1...12).map { month -> (String, [Date]) in
            var components = DateComponents()
            components.year = currentYear
            components.month = month
            let cal = Calendar.current
            let firstDay = cal.date(from: components) ?? .now
            let daysCount = firstDay.daysInMonth
            let dates = (0..<daysCount).compactMap {
                cal.date(byAdding: .day, value: $0, to: firstDay)
            }
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM"
            return (formatter.string(from: firstDay), dates)
        }

        return VStack(alignment: .leading, spacing: 8) {
            Text("Year at a Glance")
                .font(.headline)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 4) {
                    ForEach(months, id: \.0) { monthName, dates in
                        VStack(spacing: 2) {
                            Text(monthName)
                                .font(.system(size: 9))
                                .foregroundStyle(.secondary)

                            ForEach(dates, id: \.self) { date in
                                let entry = yearEntries.first { $0.date.isSameDay(as: date) }
                                RoundedRectangle(cornerRadius: 1.5)
                                    .fill(entry?.moodColor?.color ?? Color.secondary.opacity(0.1))
                                    .frame(width: 10, height: 10)
                                    .onTapGesture {
                                        selectedEntry = entry
                                    }
                            }
                        }
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .popover(item: $selectedEntry) { entry in
            VStack(spacing: 8) {
                Circle()
                    .fill(entry.moodColor?.color ?? .gray)
                    .frame(width: 30, height: 30)
                Text(entry.moodName)
                    .font(.subheadline.bold())
                Text(entry.date, format: .dateTime.month(.abbreviated).day())
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .presentationCompactAdaptation(.popover)
        }
    }

    private var yearStatistics: some View {
        let entries = yearEntries
        let mostCommon = viewModel.mostCommonMood(entries: entries)
        let diversity = viewModel.diversityScore(entries: entries)
        let totalDays = entries.count
        let totalDaysInYear = Calendar.current.isLeapYear(currentYear) ? 366 : 365
        let coverage = totalDaysInYear > 0 ? Int(Double(totalDays) / Double(totalDaysInYear) * 100) : 0

        return VStack(alignment: .leading, spacing: 12) {
            Text("Year Summary")
                .font(.headline)

            HStack(spacing: 16) {
                VStack {
                    Text("\(totalDays)")
                        .font(.title2.bold())
                    Text("Days Logged")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)

                VStack {
                    Text("\(coverage)%")
                        .font(.title2.bold())
                    Text("Coverage")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)

                VStack {
                    if let mood = mostCommon {
                        Circle().fill(mood.color).frame(width: 20, height: 20)
                    }
                    Text(mostCommon?.displayName ?? "N/A")
                        .font(.caption)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("Most Common")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)

                VStack {
                    Text("\(diversity)")
                        .font(.title2.bold())
                    Text("Diversity")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

private extension Calendar {
    func isLeapYear(_ year: Int) -> Bool {
        let components = DateComponents(year: year, month: 2, day: 29)
        return date(from: components)?.startOfDay != nil && component(.day, from: date(from: components)!) == 29
    }
}
