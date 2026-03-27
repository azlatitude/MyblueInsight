import SwiftUI

struct DayCell: View {
    let date: Date
    let moodEntry: MoodEntry?
    let onTap: () -> Void

    private var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }

    var body: some View {
        Button(action: onTap) {
            ZStack {
                if let entry = moodEntry, let mood = entry.moodColor {
                    Circle()
                        .fill(mood.color)
                } else {
                    Circle()
                        .strokeBorder(Color.secondary.opacity(0.3), lineWidth: 1)
                }

                Text(dayNumber)
                    .font(.system(.callout, design: .rounded, weight: .medium))
                    .foregroundStyle(textColor)

                if date.isToday {
                    Circle()
                        .strokeBorder(Color.primary, lineWidth: 2)
                }
            }
            .aspectRatio(1, contentMode: .fit)
        }
        .buttonStyle(.plain)
        .disabled(date.isFuture)
        .opacity(date.isFuture ? 0.3 : 1)
        .scaleEffect(date.isToday ? 1.05 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: moodEntry?.colorHex)
    }

    private var textColor: Color {
        if let entry = moodEntry {
            let hex = entry.colorHex
            if hex == "#1C1C1E" || hex == "#007AFF" || hex == "#AF52DE" {
                return .white
            }
        }
        return .primary
    }
}
