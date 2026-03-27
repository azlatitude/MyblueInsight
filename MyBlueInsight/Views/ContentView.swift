import SwiftUI
import SwiftData

struct ContentView: View {
    var body: some View {
        TabView {
            CalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar.circle")
                }

            ReviewView()
                .tabItem {
                    Label("Review", systemImage: "chart.bar")
                }

            ArtView()
                .tabItem {
                    Label("Art", systemImage: "paintpalette")
                }
        }
    }
}
