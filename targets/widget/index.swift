import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Shared payload

/// Mirror of WidgetSnapshot in lib/widgets/widget-snapshot.ts.
///
/// The app writes this as JSON into the shared App Group; the extension has no
/// access to the app's SQLite database, so every value it needs is resolved on
/// the JS side and copied across.
struct WidgetSnapshot: Codable {
    var destination: String?
    var daysRemaining: Int
    var inProgress: Bool
    var targetDate: String?
    var budget: Double
    var spent: Double
    var currency: String
    var updatedAt: String

    static let empty = WidgetSnapshot(
        destination: nil,
        daysRemaining: 0,
        inProgress: false,
        targetDate: nil,
        budget: 0,
        spent: 0,
        currency: "CHF",
        updatedAt: ""
    )

    /// Fraction of the budget already spent, clamped to 0...1.
    var progress: Double {
        guard budget > 0 else { return 0 }
        return min(max(spent / budget, 0), 1)
    }

    var remaining: Double { budget - spent }

    /// Days recomputed from the target date so the number stays right between
    /// timeline refreshes, falling back to the value the app supplied.
    func days(asOf now: Date) -> Int {
        guard
            let targetDate,
            let target = ISO8601DateFormatter().date(from: targetDate)
        else { return daysRemaining }

        let calendar = Calendar.current
        let from = calendar.startOfDay(for: now)
        let to = calendar.startOfDay(for: target)
        return max(0, calendar.dateComponents([.day], from: from, to: to).day ?? 0)
    }
}

/// Mirror of WidgetSnapshotV2 in lib/widgets/widget-snapshot.ts.
///
/// Unlike the legacy `WidgetSnapshot`, this is the per-trip list form used by
/// the configurable widget: it carries a stable `id` (the vacation id, which is
/// also the intent's selection key) and a non-optional `destination`.
struct WidgetSnapshotV2: Codable {
    var id: String
    var destination: String
    var daysRemaining: Int
    var inProgress: Bool
    var targetDate: String
    var budget: Double
    var spent: Double
    var currency: String
    var updatedAt: String

    /// Adapt a V2 trip into the view model the SwiftUI views already consume.
    var asLegacy: WidgetSnapshot {
        WidgetSnapshot(
            destination: destination,
            daysRemaining: daysRemaining,
            inProgress: inProgress,
            targetDate: targetDate,
            budget: budget,
            spent: spent,
            currency: currency,
            updatedAt: updatedAt
        )
    }
}

/// Container written under the V2 key: the list of trips plus the id of the
/// trip the app considers "featured" (used as the fallback selection).
struct WidgetSnapshotV2Container: Codable {
    var featuredId: String?
    var trips: [WidgetSnapshotV2]

    static let empty = WidgetSnapshotV2Container(featuredId: nil, trips: [])
}

private let appGroup = "group.com.vomschoeni.ferien-budget"
private let snapshotKey = "widgetSnapshot"
private let snapshotV2Key = "widgetSnapshotV2"

/// Legacy single-snapshot read (kept as the last fallback).
private func readSnapshot() -> WidgetSnapshot {
    guard
        let defaults = UserDefaults(suiteName: appGroup),
        let raw = defaults.string(forKey: snapshotKey),
        let data = raw.data(using: .utf8),
        let decoded = try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    else { return .empty }

    return decoded
}

/// V2 container read (the per-trip list plus the featured id).
private func readSnapshotV2() -> WidgetSnapshotV2Container {
    guard
        let defaults = UserDefaults(suiteName: appGroup),
        let raw = defaults.string(forKey: snapshotV2Key),
        let data = raw.data(using: .utf8),
        let decoded = try? JSONDecoder().decode(WidgetSnapshotV2Container.self, from: data)
    else { return .empty }

    return decoded
}

/// Resolve the trip to display for a given intent selection.
///
/// Preference order: the intent's selected trip, then the container's
/// `featuredId`, then the first trip, then the legacy single snapshot.
private func resolveSnapshot(selectedId: String?) -> WidgetSnapshot {
    let container = readSnapshotV2()

    if !container.trips.isEmpty {
        if let selectedId, let match = container.trips.first(where: { $0.id == selectedId }) {
            return match.asLegacy
        }
        if let featuredId = container.featuredId,
           let match = container.trips.first(where: { $0.id == featuredId }) {
            return match.asLegacy
        }
        if let first = container.trips.first {
            return first.asLegacy
        }
    }

    return readSnapshot()
}

private func formatAmount(_ value: Double, currency: String) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.maximumFractionDigits = 0
    formatter.groupingSeparator = "'"
    let number = formatter.string(from: NSNumber(value: value)) ?? "0"
    return "\(number) \(currency)"
}

// MARK: - App Intent configuration

/// One selectable trip, backed by the V2 trip list in the App Group.
struct TripEntity: AppEntity {
    let id: String
    let destination: String

    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        TypeDisplayRepresentation(name: "Reise")
    }

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(destination)")
    }

    static var defaultQuery = TripEntityQuery()
}

/// Reads the V2 trips from the App Group so the widget configuration sheet can
/// list the destinations the user can pin the widget to.
struct TripEntityQuery: EntityQuery {
    private func allTrips() -> [TripEntity] {
        readSnapshotV2().trips.map { TripEntity(id: $0.id, destination: $0.destination) }
    }

    func entities(for identifiers: [TripEntity.ID]) async throws -> [TripEntity] {
        let byId = Dictionary(allTrips().map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        return identifiers.compactMap { byId[$0] }
    }

    func suggestedEntities() async throws -> [TripEntity] {
        allTrips()
    }
}

/// Widget configuration intent: lets the user pick which trip the widget shows.
struct SelectTripIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Reise auswählen"
    static var description = IntentDescription("Wähle die Reise, die im Widget angezeigt wird.")

    @Parameter(title: "Reise")
    var trip: TripEntity?
}

// MARK: - Timeline

struct SnapshotEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
}

struct Provider: AppIntentTimelineProvider {
    typealias Intent = SelectTripIntent
    typealias Entry = SnapshotEntry

    func placeholder(in context: Context) -> SnapshotEntry {
        SnapshotEntry(date: Date(), snapshot: .empty)
    }

    func snapshot(for configuration: SelectTripIntent, in context: Context) async -> SnapshotEntry {
        SnapshotEntry(date: Date(), snapshot: resolveSnapshot(selectedId: configuration.trip?.id))
    }

    func timeline(for configuration: SelectTripIntent, in context: Context) async -> Timeline<SnapshotEntry> {
        let now = Date()
        let snapshot = resolveSnapshot(selectedId: configuration.trip?.id)

        // The day count only changes at midnight, so refresh then rather than
        // on an interval. The app also reloads the timeline directly whenever
        // the underlying data changes.
        let nextMidnight = Calendar.current.nextDate(
            after: now,
            matching: DateComponents(hour: 0, minute: 0),
            matchingPolicy: .nextTime
        ) ?? now.addingTimeInterval(3600)

        return Timeline(
            entries: [SnapshotEntry(date: now, snapshot: snapshot)],
            policy: .after(nextMidnight)
        )
    }
}

// MARK: - Views

private struct EmptyView_: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("FERIEN BUDGET")
                .font(.system(size: 10, weight: .bold))
                .kerning(1.5)
                .foregroundStyle(.white.opacity(0.55))
            Text("Keine geplante Reise")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

private struct BudgetBar: View {
    let progress: Double

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(.white.opacity(0.18))
                Capsule()
                    .fill(Color(red: 0.35, green: 0.78, blue: 0.98))
                    .frame(width: max(0, geo.size.width * progress))
            }
        }
        .frame(height: 5)
    }
}

/// Small 2x2: destination and the day count.
struct SmallWidgetView: View {
    let entry: SnapshotEntry

    var body: some View {
        if entry.snapshot.destination == nil {
            EmptyView_()
        } else {
            VStack(alignment: .leading, spacing: 0) {
                Text(entry.snapshot.destination!.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1.5)
                    .foregroundStyle(.white.opacity(0.55))
                    .lineLimit(1)

                Spacer()

                Text("\(entry.snapshot.days(asOf: entry.date))")
                    .font(.system(size: 52, weight: .heavy))
                    .foregroundStyle(.white)

                Text(entry.snapshot.inProgress ? "Tage bis Rückreise" : "Tage bis Abreise")
                    .font(.system(size: 12))
                    .foregroundStyle(.white.opacity(0.65))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }
}

/// Medium 4x2: day count beside the remaining budget.
struct MediumWidgetView: View {
    let entry: SnapshotEntry

    var body: some View {
        if entry.snapshot.destination == nil {
            EmptyView_()
        } else {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(entry.snapshot.destination!.uppercased())
                        .font(.system(size: 10, weight: .bold))
                        .kerning(1.5)
                        .foregroundStyle(.white.opacity(0.55))
                        .lineLimit(1)

                    Text("\(entry.snapshot.days(asOf: entry.date))")
                        .font(.system(size: 44, weight: .heavy))
                        .foregroundStyle(.white)

                    Text("Tage")
                        .font(.system(size: 11))
                        .foregroundStyle(.white.opacity(0.65))
                }

                if entry.snapshot.budget > 0 {
                    VStack(alignment: .leading, spacing: 7) {
                        HStack {
                            Text("Restbudget")
                                .font(.system(size: 11))
                                .foregroundStyle(.white.opacity(0.6))
                            Spacer()
                            Text(formatAmount(entry.snapshot.remaining, currency: entry.snapshot.currency))
                                .font(.system(size: 11, weight: .bold))
                                .foregroundStyle(.white)
                        }

                        BudgetBar(progress: entry.snapshot.progress)

                        Text("\(Int(entry.snapshot.progress * 100))% von \(formatAmount(entry.snapshot.budget, currency: entry.snapshot.currency)) verwendet")
                            .font(.system(size: 10))
                            .foregroundStyle(.white.opacity(0.5))
                            .lineLimit(1)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }
}

struct FerienBudgetWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: SnapshotEntry

    var body: some View {
        Group {
            switch family {
            case .systemSmall: SmallWidgetView(entry: entry)
            default: MediumWidgetView(entry: entry)
            }
        }
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.11, blue: 0.18),
                    Color(red: 0.09, green: 0.25, blue: 0.36)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
}

@main
struct FerienBudgetWidget: Widget {
    let kind = "FerienBudgetWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: SelectTripIntent.self,
            provider: Provider()
        ) { entry in
            FerienBudgetWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Ferien Budget")
        .description("Countdown und Restbudget der nächsten Reise.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
