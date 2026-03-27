import SwiftUI
import SwiftData

@main
struct MyBlueInsightApp: App {
    private let modelContainer: ModelContainer

    init() {
        let schema = Schema([
            MoodEntry.self,
            Artwork.self,
        ])

        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            modelContainer = try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(modelContainer)
    }
}
