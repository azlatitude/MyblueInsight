import Photos
import SwiftData
import SwiftUI
import UIKit

struct ArtView: View {
    @Query(sort: \MoodEntry.date) private var allEntries: [MoodEntry]
    @State private var viewModel = ArtViewModel()
    @State private var showingDetail = false
    @State private var showingShareSheet = false
    @State private var showingSaveAlert = false
    @State private var saveAlertMessage = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    periodSelector
                    styleSelector
                    generateButton
                    artDisplay
                }
                .padding()
            }
            .navigationTitle("Mood Art")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var periodSelector: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Time Period")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)

            Picker("Period", selection: $viewModel.selectedPeriod) {
                ForEach(ArtPeriod.allCases) { period in
                    Text(period.rawValue).tag(period)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var styleSelector: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Art Style")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(ArtStyle.allCases) { style in
                        ArtStyleCard(
                            style: style,
                            isSelected: viewModel.selectedStyle == style,
                            onTap: { viewModel.selectedStyle = style }
                        )
                    }
                }
            }
        }
    }

    private var generateButton: some View {
        Button {
            let entries = entriesForPeriod()
            viewModel.generateArt(entries: entries)
        } label: {
            HStack {
                if viewModel.isGenerating {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: "wand.and.stars")
                }
                Text(viewModel.isGenerating ? "Generating..." : "Generate Art")
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .disabled(viewModel.isGenerating || entriesForPeriod().isEmpty)
    }

    @ViewBuilder
    private var artDisplay: some View {
        if let image = viewModel.generatedImage {
            VStack(spacing: 16) {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(radius: 8)
                    .onTapGesture {
                        showingDetail = true
                    }

                HStack(spacing: 16) {
                    Button {
                        saveToPhotos(image)
                    } label: {
                        Label("Save", systemImage: "square.and.arrow.down")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)

                    Button {
                        showingShareSheet = true
                    } label: {
                        Label("Share", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)

                    Button {
                        let entries = entriesForPeriod()
                        viewModel.generateArt(entries: entries)
                    } label: {
                        Label("Again", systemImage: "arrow.clockwise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
            }
            .sheet(isPresented: $showingShareSheet) {
                ShareSheet(items: [image])
            }
            .alert("Save to Photos", isPresented: $showingSaveAlert) {
                Button("OK") {}
            } message: {
                Text(saveAlertMessage)
            }
            .fullScreenCover(isPresented: $showingDetail) {
                ArtDetailView(image: image)
            }
        } else if !viewModel.isGenerating {
            VStack(spacing: 12) {
                Image(systemName: "paintpalette")
                    .font(.system(size: 48))
                    .foregroundStyle(.tertiary)
                Text("Select a period and style, then generate your mood art!")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.vertical, 40)
        }
    }

    private func entriesForPeriod() -> [MoodEntry] {
        switch viewModel.selectedPeriod {
        case .week:
            return allEntries.filter {
                $0.date >= Date().startOfWeek && $0.date <= Date().endOfWeek
            }
        case .month:
            return allEntries.filter {
                $0.date >= Date().startOfMonth && $0.date <= Date().endOfMonth
            }
        case .year:
            return allEntries.filter {
                $0.date >= Date().startOfYear && $0.date <= Date().endOfYear
            }
        }
    }

    private func saveToPhotos(_ image: UIImage) {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            DispatchQueue.main.async {
                if status == .authorized || status == .limited {
                    UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
                    saveAlertMessage = "Art saved to Photos!"
                } else {
                    saveAlertMessage = "Please allow photo access in Settings."
                }
                showingSaveAlert = true
            }
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
