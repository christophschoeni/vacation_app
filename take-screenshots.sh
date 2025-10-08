#!/bin/bash

# Ferien Budget App - Screenshot Script für App Store

echo "📸 Erstelle App Store Screenshots..."

# Geräte definieren
DEVICES=(
  "iPhone 15 Pro Max"
  "iPhone 14 Plus"
  "iPhone 8 Plus"
)

# Screenshot-Verzeichnis erstellen
mkdir -p screenshots

# Für jedes Gerät
for DEVICE in "${DEVICES[@]}"; do
  echo "📱 Starte $DEVICE..."
  
  # Gerät ID ermitteln
  DEVICE_ID=$(xcrun simctl list devices available | grep "$DEVICE" | head -1 | grep -o '([A-F0-9-]*)' | tr -d '()')
  
  if [ -z "$DEVICE_ID" ]; then
    echo "⚠️  Gerät $DEVICE nicht gefunden. Überspringe..."
    continue
  fi
  
  # Gerät starten
  xcrun simctl boot "$DEVICE_ID" 2>/dev/null
  
  # App öffnen (anpassen an deine App)
  echo "🚀 Öffne App auf $DEVICE..."
  open -a Simulator
  
  # Warte auf Simulator-Start
  sleep 5
  
  # Erstelle Unterordner für Gerät
  DEVICE_FOLDER="screenshots/${DEVICE// /_}"
  mkdir -p "$DEVICE_FOLDER"
  
  echo "✅ $DEVICE bereit. Bitte mache Screenshots mit Cmd+S"
  echo "   Screenshots werden in: $DEVICE_FOLDER gespeichert"
  echo ""
  read -p "   Drücke Enter wenn fertig..."
  
  # Gerät herunterfahren
  xcrun simctl shutdown "$DEVICE_ID"
done

echo "✅ Screenshot-Session abgeschlossen!"
echo "📁 Screenshots sind in: ./screenshots/"
