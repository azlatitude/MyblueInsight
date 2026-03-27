import SwiftUI

struct MonthlyReviewView: View {
    let viewModel: ReviewViewModel
    @State private var currentMonth: Date = .now

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 3), count: 7)

    private var monthEntries: [MoodEntry] {
        viewModel.moodsForMonth(date: currentMonth)
    }

    private var daysInMonth: [Date] {
        let start = currentMonth.startOfMonth
        let count = start.daysInMonth
        return (0..<count).compactMap {
            Calendar.current.date(byAdding: .day, value: $0, to: start)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                monthNavigator
                colorGrid
                statisticsCard
                distributionBars
            }
            .padding()
        }
    }

    private var monthNavigator: some View {
        HStack {
            Button {
                currentMonth = Calendar.current.date(byAdding: .month, value: -1, to: currentMonth) ?? currentMonth
            } label: {
                Image(systemName: "chevron.left")
            }

            Spacer()

            Text(currentMonth, format: .dateTime.month(.wide).year())
                .font(.headline)

            Spacer()

            Button {
                currentMonth = Calendar.current.date(byAdding: .month, value: 1, to: currentMonth) ?? currentMonth
            } label: {
                Image(systemName: "chevron.right")
            }
        }
    }

    private var colorGrid: some View {
        let startWeekday = currentMonth.startOfMonth.firstWeekdayOfMonth - 1
        let padding = Array(repeating: nil as Date?, count: startWeekday)
        let dates: [Date?] = padding + daysInMonth.map { $0 as Date? }

        return VStack(alignment: .leading, spacing: 4) {
            Text("Mood Grid")
                .font(.headline)

            LazyVGrid(columns: columns, spacing: 3) {
                ForEach(Array(dates.enumerated()), id: \.offset) { item in
                    let date = item.element
                    if let date {
                        let entry = monthEntries.first { $0.date.isSameDay(as: date) }
                        RoundedRectangle(cornerRadius: 3)
                            .fill(entry?.moodColor?.color ?? Color.secondary.opacity(0.15))
                            .aspectRatio(1, contentMode: .fit)
                    } else {
                        Color.clear
                            .aspectRatio(1, contentMode: .fit)
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var statisticsCard: some View {
        let entries = monthEntries
        let mostCommon = viewModel.mostCommonMood(entries: entries)
        let streak = viewModel.longestStreak(entries: entries)
        let diversity = viewModel.diversityScore(entries: entries)

        return VStack(alignment: .leading, spacing: 12) {
            Text("Statistics")
                .font(.headline)

            HStack(spacing: 16) {
                statItem(
                    title: "Most Common",
                    value: mostCommon?.displayName ?? "N/A",
                    color: mostCommon?.color
                )

                Divider().frame(height: 40)

                statItem(
                    title: "Longest Streak",
                    value: streak.map { "\($0.1) days" } ?? "N/A",
                    color: streak?.0.color
                )

                Divider().frame(height: 40)

                statItem(
                    title: "Diversity",
                    value: "\(diversity)/100",
                    color: nil
                )
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func statItem(title: String, value: String, color: Color?) -> some View {
        VStack(spacing: 4) {
            if let color {
                Circle().fill(color).frame(width: 16, height: 16)
            }
            Text(value)
                .font(.subheadline.bold())
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var distributionBars: some View {
        let distribution = viewModel.moodDistribution(entries: monthEntries)
        return VStack(alignment: .leading, spacing: 8) {
            Text("Distribution")
                .font(.headline)

            if distribution.isEmpty {
                Text("No moods recorded")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(distribution, id: \.0) { item in
                    let mood = item.0
                    let ratio = item.1
                    HStack(spacing: 8) {
                        Circle().fill(mood.color).frame(width: 10, height: 10)
                        Text(mood.displayName)
                            .font(.caption)
                            .frame(width: 110, alignment: .leading)
                        GeometryReader { geo in
                            RoundedRectangle(cornerRadius: 3)
                                .fill(mood.color)
                                .frame(width: geo.size.width * ratio)
                        }
                        .frame(height: 14)
                        Text("\(Int(ratio * 100))%")
                            .font(.caption2.monospacedDigit())
                            .foregroundStyle(.secondary)
                            .frame(width: 30, alignment: .trailing)
                    }
                    .frame(height: 18)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
