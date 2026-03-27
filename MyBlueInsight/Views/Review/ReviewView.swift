import SwiftUI
import SwiftData

enum ReviewPeriod: String, CaseIterable, Identifiable {
    case week = "Week"
    case month = "Month"
    case year = "Year"
    var id: String { rawValue }
}

struct ReviewView: View {
    @Query(sort: \MoodEntry.date) private var allEntries: [MoodEntry]
    @State private var viewModel = ReviewViewModel()
    @State private var selectedPeriod: ReviewPeriod = .month

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Period", selection: $selectedPeriod) {
                    ForEach(ReviewPeriod.allCases) { period in
                        Text(period.rawValue).tag(period)
                    }
                }
                .pickerStyle(.segmented)
                .padding()

                switch selectedPeriod {
                case .week:
                    WeeklyReviewView(viewModel: viewModel)
                case .month:
                    MonthlyReviewView(viewModel: viewModel)
                case .year:
                    YearlyReviewView(viewModel: viewModel)
                }
            }
            .navigationTitle("Review")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear { viewModel.configure(entries: allEntries) }
            .onChange(of: allEntries.map(\.updatedAt)) { _, _ in
                viewModel.configure(entries: allEntries)
            }
        }
    }
}
