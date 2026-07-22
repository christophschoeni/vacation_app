import ExpoModulesCore
import WidgetKit

public class WidgetStorageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetStorage")

    // Writes a string value into the given App Group's UserDefaults suite.
    AsyncFunction("set") { (key: String, value: String, appGroup: String) in
      UserDefaults(suiteName: appGroup)?.set(value, forKey: key)
    }

    // Reloads all widget timelines so the widget picks up the new value.
    Function("reloadAll") {
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
