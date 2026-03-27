import SwiftUI

struct MoodPickerSheet: View {
    let date: Date
    let existingEntry: MoodEntry?
    let onSave: (MoodColor, String?) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var selectedMood: MoodColor?
    @State private var noteText: String = ""

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    dateLabel
                    moodGrid
                    noteField
                    saveButton
                }
                .padding()
            }
            .navigationTitle("How are you feeling?")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                if let entry = existingEntry {
                    selectedMood = entry.moodColor
                    noteText = entry.note ?? ""
                }
            }
        }
    }

    private var dateLabel: some View {
        Text(date, format: .dateTime.weekday(.wide).month(.wide).day().year())
            .font(.subheadline)
            .foregroundStyle(.secondary)
    }

    private var moodGrid: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(MoodColor.allCases) { mood in
                moodButton(mood)
            }
        }
    }

    private func moodButton(_ mood: MoodColor) -> some View {
        Button {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            selectedMood = mood
        } label: {
            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(mood.color)
                        .frame(width: 50, height: 50)

                    if selectedMood == mood {
                        Image(systemName: "checkmark")
                            .font(.title3.bold())
                            .foregroundStyle(.white)
                    }
                }
                .overlay {
                    if selectedMood == mood {
                        Circle()
                            .strokeBorder(Color.primary, lineWidth: 3)
                            .frame(width: 56, height: 56)
                    }
                }

                Text(mood.displayName)
                    .font(.caption)
                    .foregroundStyle(.primary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
        }
        .buttonStyle(.plain)
    }

    private var noteField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Note (optional)")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)

            TextField("How was your day?", text: $noteText, axis: .vertical)
                .lineLimit(3...5)
                .textFieldStyle(.roundedBorder)
                .onChange(of: noteText) { _, newValue in
                    if newValue.count > 280 {
                        noteText = String(newValue.prefix(280))
                    }
                }

            Text("\(noteText.count)/280")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }

    private var saveButton: some View {
        Button {
            guard let mood = selectedMood else { return }
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            onSave(mood, noteText.isEmpty ? nil : noteText)
            dismiss()
        } label: {
            Text("Save")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .disabled(selectedMood == nil)
    }
}
