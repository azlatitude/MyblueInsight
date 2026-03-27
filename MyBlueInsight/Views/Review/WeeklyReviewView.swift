import SwiftUI

struct WeeklyReviewView: View {
    let viewModel: ReviewViewModel
    @State private var currentWeekDate: Date = .now

    private var weekEntries: [MoodEntry] {
        viewModel.moodsForWeek(containing: currentWeekDate)
    }

    private var weekDates: [Date] {
        let start = currentWeekDate.startOfWeek
        return (0..<7).compactMap {
            Calendar.current.date(byAdding: .day, value: $0, to: start)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                weekNavigator
                colorStrip
                distributionChart
            }
            .padding()
        }
    }

    private var weekNavigator: some View {
        HStack {
            Button {
                currentWeekDate = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: currentWeekDate) ?? currentWeekDate
            } label: {
                Image(systemName: "chevron.left")
            }

            Spacer()

            let start = currentWeekDate.startOfWeek
            let end = currentWeekDate.endOfWeek
            Text("\(start, format: .dateTime.month(.abbreviated).day()) - \(end, format: .dateTime.month(.abbreviated).day().year())")
                .font(.headline)

            Spacer()

            Button {
                currentWeekDate = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: currentWeekDate) ?? currentWeekDate
            } label: {
                Image(systemName: "chevron.right")
            }
        }
    }

    private var colorStrip: some View {
        HStack(spacing: 8) {
            ForEach(weekDates, id: \.self) { date in
                VStack(spacing: 4) {
                    let entry = weekEntries.first { $0.date.isSameDay(as: date) }
                    Circle()
                        .fill(entry?.moodColor?.color ?? Color.secondary.opacity(0.2))
                        .frame(width: 36, height: 36)

                    Text(date, format: .dateTime.weekday(.narrow))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var distributionChart: some View {
        let distribution = viewModel.moodDistribution(entries: weekEntries)
        return VStack(alignment: .leading, spacing: 8) {
            Text("Mood Distribution")
                .font(.headline)

            if distribution.isEmpty {
                Text("No moods recorded this week")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, 20)
            } else {
                WeeklyPieCanvas(distribution: distribution)
                    .frame(height: 220)

                ForEach(distribution, id: \.0) { item in
                    let mood = item.0
                    let ratio = item.1
                    HStack(spacing: 8) {
                        Circle()
                            .fill(mood.color)
                            .frame(width: 12, height: 12)

                        Text(mood.displayName)
                            .font(.caption)
                        Spacer()

                        Text("\(Int(ratio * 100))%")
                            .font(.caption2.monospacedDigit())
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

private struct WeeklyPieCanvas: View {
    let distribution: [(MoodColor, Double)]

    var body: some View {
        GeometryReader { proxy in
            let side = min(proxy.size.width, proxy.size.height)
            let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
            let radius = side * 0.36

            Canvas { context, _ in
                var startAngle = Angle(degrees: -90)

                for item in distribution {
                    let mood = item.0
                    let ratio = item.1
                    let endAngle = startAngle + .degrees(ratio * 360)
                    var path = Path()
                    path.move(to: center)
                    path.addArc(center: center, radius: radius, startAngle: startAngle, endAngle: endAngle, clockwise: false)
                    path.closeSubpath()
                    context.fill(path, with: .color(mood.color))
                    startAngle = endAngle
                }
            }
        }
    }
}
