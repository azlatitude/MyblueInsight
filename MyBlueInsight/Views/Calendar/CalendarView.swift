import SwiftUI
import SwiftData

struct CalendarView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MoodEntry.date) private var allEntries: [MoodEntry]
    @State private var viewModel = CalendarViewModel()

    private let weekdaySymbols = Calendar.current.veryShortWeekdaySymbols
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7)

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                monthHeader
                weekdayHeader
                calendarGrid
                Spacer()
            }
            .padding(.horizontal)
            .navigationTitle("MyBlueInsight")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                viewModel.configure(modelContext: modelContext, entries: allEntries)
            }
            .onChange(of: allEntries.map(\.updatedAt)) { _, _ in
                viewModel.configure(modelContext: modelContext, entries: allEntries)
            }
            .sheet(isPresented: $viewModel.showingMoodPicker) {
                if let date = viewModel.selectedDate {
                    MoodPickerSheet(
                        date: date,
                        existingEntry: viewModel.mood(for: date),
                        onSave: { mood, note in
                            viewModel.saveMood(date: date, mood: mood, note: note)
                        }
                    )
                    .presentationDetents([.medium, .large])
                }
            }
        }
    }

    private var monthHeader: some View {
        HStack {
            Button {
                viewModel.navigateMonth(offset: -1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3)
            }

            Spacer()

            Text(viewModel.currentMonth, format: .dateTime.month(.wide).year())
                .font(.title2.bold())

            Spacer()

            Button {
                viewModel.navigateMonth(offset: 1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.title3)
            }
        }
        .padding(.top, 8)
    }

    private var weekdayHeader: some View {
        LazyVGrid(columns: columns, spacing: 4) {
            ForEach(weekdaySymbols, id: \.self) { symbol in
                Text(symbol)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var calendarGrid: some View {
        let weeks = viewModel.daysForMonth()
        return LazyVGrid(columns: columns, spacing: 6) {
            ForEach(Array(weeks.joined().enumerated()), id: \.offset) { item in
                let date = item.element
                if let date {
                    DayCell(
                        date: date,
                        moodEntry: viewModel.mood(for: date),
                        onTap: {
                            viewModel.presentMoodPicker(for: date)
                        }
                    )
                } else {
                    Color.clear
                        .aspectRatio(1, contentMode: .fit)
                }
            }
        }
    }
}
