# RecallCards - Anforderungsanalyse

**Version:** 1.0  
**Datum:** Dezember 2025  
**Projekt:** RecallCards - Moderne Lernkarten-Plattform  
**Website:** https://recallcards.net

---

## Zusammenfassung

RecallCards ist eine webbasierte Lernkarten-Plattform, die Nutzern hilft, Lerninhalte effizient zu memorieren und zu wiederholen. Die Anwendung bietet eine intuitive Oberfläche zum Erstellen, Verwalten und Wiederholen von Lernkarten mit Fortschrittsverfolgung. Dieses Dokument analysiert die funktionalen Anforderungen, technischen Einschränkungen, nicht-funktionalen Anforderungen, Projektziele und identifizierte Probleme.

---

## 1. Projektziele

### Geschäftsziele

Das Hauptziel ist es, eine moderne und benutzerfreundliche Plattform für Lernkarten bereitzustellen. Nutzer sollen effizient lernen können, indem sie ihre eigenen Karten erstellen und mit einem einfachen System wiederholen. Die Fortschrittsverfolgung motiviert zu kontinuierlichem Lernen.

Die Anwendung ist kostenlos und für Studenten sowie Berufstätige zugänglich. Sie demonstriert moderne Full-Stack-Entwicklung und ist für zukünftige Erweiterungen skalierbar.

**Erfolgskriterien:**

- Nutzer können erfolgreich Lernkarten erstellen und wiederholen
- Systemverfügbarkeit von 99,5%
- Positive Nutzerrückmeldungen zu Usability und Performance

### Stakeholder

- **Endnutzer:** Einfache Bedienung, zuverlässige Funktionalität
- **Entwickler:** Wartbarer Code, moderne Technologien
- **Systemadministratoren:** Zuverlässiges Deployment, einfache Wartung
- **Projektverantwortlicher:** Vollständige Features, Nutzerzufriedenheit

### Projektumfang

**Im Umfang:**

- Authentifizierung über Auth0
- CRUD-Operationen für Lernkarten
- Zufällige Kartenauswahl zum Wiederholen
- Review-Status-Verwaltung ("Ich weiß das" / "Brauche Wiederholung")
- Fortschrittsverfolgung (Gesamtanzahl, wiederholte, gemeisterte Karten)
- Responsive Web-Oberfläche
- Docker-Deployment
- CI/CD-Pipeline über GitHub Actions

**Nicht im Umfang (zukünftige Überlegungen):**

- Spaced-Repetition-Algorithmus
- Karten-Sharing zwischen Nutzern
- Import/Export-Funktionen
- Native Mobile Apps
- Offline-Modus

---

## 2. Funktionale Anforderungen

### Authentifizierung

**FR-AUTH-001: Benutzerauthentifizierung**
Nutzer müssen sich über Auth0 anmelden können. Die Session bleibt über Seitenaktualisierungen hinweg bestehen. Nicht authentifizierte Nutzer werden zur Anmeldung weitergeleitet.

**FR-AUTH-002: Entwicklungsmodus**
Für lokale Entwicklung kann Auth0 umgangen werden, wenn eine entsprechende Umgebungsvariable gesetzt ist. Ein Mock-User wird für Tests bereitgestellt.

**FR-AUTH-003: Geschützte Routen**
Folgende Routen erfordern Authentifizierung: `/home`, `/addword`, `/flashcards`, `/progress`, `/profile`.

### Lernkarten-Verwaltung

**FR-FLASH-001: Karte erstellen**
Nutzer können neue Lernkarten mit Begriff (Vorderseite) und Definition (Rückseite) erstellen. Beide Felder sind Pflichtfelder. Ein Zeichenzähler wird angezeigt. Doppelte Begriffe aktualisieren die bestehende Karte.

**FR-FLASH-002: Zufällige Karte anzeigen**
Das System liefert eine zufällige Karte aus der Sammlung des Nutzers. Wenn keine Karten vorhanden sind, wird eine entsprechende Meldung angezeigt.

**FR-FLASH-003: Karte bearbeiten**
Nutzer können bestehende Karten bearbeiten. Es gibt einen Bearbeitungsmodus mit Speichern- und Abbrechen-Buttons.

**FR-FLASH-004: Karte löschen**
Karten können über ein Dropdown-Menü gelöscht werden. Vor dem Löschen erfolgt eine Bestätigung.

**FR-FLASH-005: Review-Status**
Nutzer können Karten als "Ich weiß das" (gemeistert) oder "Brauche Wiederholung" markieren. Der Status wird persistent gespeichert und bleibt über Sessions hinweg erhalten.

**FR-FLASH-006: Flip-Animation**
Karten haben eine 3D-Flip-Animation, um die Definition zu zeigen. Die Animation ist flüssig und bietet visuelles Feedback.

### Fortschrittsverfolgung

**FR-PROG-001: Statistiken anzeigen**
Das System zeigt folgende Metriken: Gesamtanzahl Karten, wiederholte Karten, gemeisterte Karten, Karten im Lernprozess.

**FR-PROG-002: Fortschrittsvisualisierung**
Fortschrittsbalken zeigen den Mastery-Progress (gemeistert/gesamt) und Review-Progress (wiederholt/gesamt) mit Prozentangaben.

### Benutzeroberfläche

**FR-UI-001: Landing Page**
Nicht authentifizierte Nutzer sehen eine Landing Page mit Hero-Bereich, drei Feature-Karten und Call-to-Action-Buttons. Die Navigation ist nicht sichtbar.

**FR-UI-002: Dashboard**
Authentifizierte Nutzer sehen ein personalisiertes Dashboard mit Begrüßung, drei Aktionskarten ("Wiederholen starten", "Karte hinzufügen", "Statistiken ansehen") und sichtbarer Navigation.

**FR-UI-003: Responsive Design**
Die Oberfläche passt sich an verschiedene Bildschirmgrößen an: Mobile (320-767px), Tablet (768-1024px), Desktop (1025px+).

**FR-UI-004: Navigation**
Konsistente Navigation mit Home- und Profile-Links, Logout-Button und Nutzerinformationen.

**FR-UI-005: Toast-Benachrichtigungen**
Nutzer erhalten Feedback für Aktionen: Erfolgs-, Fehler- und Informationsmeldungen.

---

## 3. Einschränkungen

### Technische Einschränkungen

**Technologie-Stack:**

- Frontend: React 18.2, Vite 5.4, Tailwind CSS 3.4
- Backend: Flask 2.2.2, Python 3.9+
- Datenbank: MongoDB 7.0
- Authentifizierung: Auth0 (JWT)
- Deployment: Docker, Docker Compose, Nginx
- CI/CD: GitHub Actions

Diese Technologien wurden wegen ihrer modernen Fähigkeiten, Community-Unterstützung und Passung zu den Projektanforderungen gewählt.

**Plattform:**

- Muss über Webbrowser zugänglich sein (keine nativen Apps)
- Muss HTTPS mit SSL-Zertifikaten unterstützen
- Muss mit Docker deploybar sein
- Muss auf modernen Browsern funktionieren (Chrome, Firefox, Safari, Edge - letzte 2 Versionen)

**Architektur:**

- Frontend und Backend sind separate Services
- Kommunikation über REST API
- MongoDB als einzige Datenbank
- Nginx als Reverse Proxy und für SSL-Terminierung

**Backend-Implementierung:**

- Flask-basierte REST API mit JWT-Authentifizierung über Auth0
- PyMongo für MongoDB-Integration mit automatischer Verbindungsverwaltung
- CORS-Unterstützung für Frontend-Kommunikation
- Fehlerbehandlung mit strukturierten JSON-Responses
- Umgebungsvariablen für flexible Konfiguration (MongoDB-Host, Port, Credentials)

### Betriebliche Einschränkungen

**Deployment:**

- Deployment erfolgt auf einem dedizierten Server
- Frontend und Backend werden in separaten Verzeichnissen deployt
- Externes Docker-Netzwerk wird für Service-Kommunikation verwendet

**Wartung:**

- Manuelles Deployment über GitHub Actions
- Docker-Container-Verwaltung
- Nginx-Konfigurationsverwaltung

### Regulatorische Einschränkungen

- Muss GDPR-konform sein, wenn EU-Nutzer bedient werden
- Nutzerdaten-Isolation erforderlich
- Sichere Authentifizierung obligatorisch
- Sollte WCAG 2.1 Level AA Richtlinien entsprechen

---

## 4. Nicht-funktionale Anforderungen

### Performance

**NFR-PERF-001: Ladezeit**
Initiale Seitenladezeit < 3 Sekunden bei 3G-Verbindung. First Contentful Paint < 1,5s, Time to Interactive < 3s, Lighthouse Performance Score > 80.

**NFR-PERF-002: API-Antwortzeit**
API-Endpunkte antworten innerhalb von 500ms für 95% der Anfragen. Durchschnitt < 300ms, 95. Perzentil < 500ms.

**NFR-PERF-003: Gleichzeitige Nutzer**
Unterstützung für mindestens 100 gleichzeitige Nutzer ohne Performance-Einbußen.

### Zuverlässigkeit

**NFR-REL-001: Verfügbarkeit**
System verfügbar zu 99,5% der Zeit. Geplante Wartungsfenster < 4 Stunden/Monat.

**NFR-REL-002: Datenpersistenz**
Nutzerdaten werden zuverlässig in MongoDB gespeichert. Daten werden sofort nach Nutzeraktionen gespeichert. Regelmäßige Backups und Wiederherstellungsverfahren vorhanden.

**NFR-REL-003: Fehlerbehandlung**
System erholt sich elegant von Fehlern. Fehler werden für Debugging geloggt. Nutzerdaten werden nicht beschädigt.

### Sicherheit

**NFR-SEC-001: Authentifizierung**
Sichere Authentifizierung über Auth0 mit JWT-Tokens. Tokens werden bei jeder Anfrage validiert. Abgelaufene Tokens werden abgelehnt.

**NFR-SEC-002: Datenisolation**
Nutzerdaten sind isoliert - Nutzer können nur auf ihre eigenen Karten zugreifen. Ein eindeutiger Benutzer-Identifier wird zur Datenfilterung verwendet. API validiert Nutzereigentum.

**NFR-SEC-003: HTTPS-Verschlüsselung**
Alle Kommunikation nutzt HTTPS mit gültigen SSL-Zertifikaten. HTTP-Anfragen werden zu HTTPS umgeleitet. TLS 1.2+ wird verwendet.

**NFR-SEC-004: Eingabevalidierung**
Alle Nutzereingaben werden validiert und bereinigt. SQL/NoSQL-Injection-Versuche werden blockiert. XSS-Angriffe werden verhindert.

### Usability

**NFR-USE-001: Benutzeroberfläche**
Moderne, saubere, intuitive Oberfläche mit Tailwind CSS und shadcn/ui. Konsistentes Design, intuitive Navigation, klare visuelle Hierarchie.

**NFR-USE-002: Barrierefreiheit**
WCAG 2.1 Level AA Richtlinien befolgen. Tastaturnavigation, Screenreader-Kompatibilität, ausreichender Farbkontrast.

**NFR-USE-003: Browser-Kompatibilität**
Unterstützung für moderne Browser: Chrome, Firefox, Safari, Edge (jeweils letzte 2 Versionen).

### Wartbarkeit

**NFR-MAIN-001: Code-Qualität**
Code folgt Best Practices und ist gut dokumentiert. ESLint/Flake8-Standards, dokumentierte Funktionen, umfassende README-Dateien.

**NFR-MAIN-002: Modulare Architektur**
System mit modularen Komponenten. Wiederverwendbare Komponenten, klare Trennung der Verantwortlichkeiten, niedrige Kopplung.

### Deployment

**NFR-DEP-001: Docker-Containerisierung**
System ist mit Docker und Docker Compose deploybar. Images bauen erfolgreich, Container starten fehlerfrei, Services kommunizieren korrekt.

**NFR-DEP-002: CI/CD-Pipeline**
Automatisiertes Deployment über GitHub Actions. Push zu main/master triggert Deployment, Container werden neu gebaut, Services werden automatisch neu gestartet.

**NFR-DEP-003: Umgebungskonfiguration**
Unterstützung für verschiedene Konfigurationen für Dev/Staging/Production. Umgebungsvariablen für Konfiguration, Secrets nicht im Repository, verschiedene Umgebungen unabhängig konfigurierbar.

---

## 5. Projektprobleme

### Aktuelle Probleme

**ISSUE-001: React Router Context Error**
Footer-Komponente wurde zunächst außerhalb des BrowserRouters gerendert, was zu Context-Fehlern führte. Gelöst durch Verschieben der Komponente in den BrowserRouter-Context.

**ISSUE-002: Docker-Berechtigungen**
GitHub Actions Workflow benötigte sudo für Docker-Befehle. Gelöst durch Entfernen von sudo aus dem Workflow, Benutzer wurde zur docker-Gruppe hinzugefügt.

**ISSUE-003: Hot Module Replacement**
Änderungen werden nicht immer automatisch im Browser reflektiert. Teilweise gelöst - Hard Refresh (Ctrl+Shift+R) oder Dev-Server-Neustart hilft.

**ISSUE-004: Footer-Ausrichtung**
Footer-Elemente stapelten sich auf Mobile nicht korrekt. Gelöst durch verbessertes Grid-Layout mit responsiven Breakpoints.

### Technische Schulden

**DEBT-001: Gemischte UI-Bibliotheken**
Projekt nutzt sowohl PrimeReact als auch shadcn/ui Komponenten. Empfehlung: Vollständige Migration zu shadcn/ui für Konsistenz.

**DEBT-002: Review-Status-Implementierung**
Review-Status wird aktuell über einen String-Suffix verwaltet. Empfehlung: Dediziertes Review-Status-Feld im Datenbankschema erwägen.

**DEBT-003: Fehlerbehandlung**
Einige API-Endpunkte haben unzureichende Fehlerbehandlung. Empfehlung: Konsistente Fehlerbehandlung über alle Endpunkte implementieren.

**DEBT-004: Test-Abdeckung**
Begrenzte Unit- und Integrationstests. Empfehlung: Umfassende Test-Suite hinzufügen.

### Bekannte Limitierungen

**LIMIT-001: Kein Spaced-Repetition-Algorithmus**
System implementiert keine Spaced-Repetition für optimales Lernen. Workaround: Nutzer markieren Karten manuell zur Wiederholung.

**LIMIT-002: Kein Import/Export**
Nutzer können keine Lernkarten importieren oder exportieren. Zukünftige Erweiterung: CSV/JSON Import/Export-Funktionalität.

**LIMIT-003: Einzel-Nutzer-Modus**
Keine Sharing- oder Kollaborations-Features. Zukünftige Erweiterung: Karten-Sharing zwischen Nutzern.

**LIMIT-004: Kein Offline-Support**
Anwendung benötigt Internetverbindung. Zukünftige Erweiterung: Service Worker für Offline-Fähigkeit.

### Risikobewertung

| Risiko   | Beschreibung                                        | Wahrscheinlichkeit | Auswirkung | Minderung                                                |
| -------- | --------------------------------------------------- | ------------------ | ---------- | -------------------------------------------------------- |
| RISK-001 | MongoDB-Verbindungsfehler                           | Niedrig            | Hoch       | Verbindungs-Wiederholungslogik, Connection Pooling       |
| RISK-002 | Auth0-Service-Ausfall                               | Niedrig            | Hoch       | Auth0-Status überwachen, Fallback-Plan                   |
| RISK-003 | Docker-Deployment-Probleme                          | Mittel             | Mittel     | Deployments in Staging testen, Dokumentation pflegen     |
| RISK-004 | Performance-Verschlechterung bei großen Datensätzen | Mittel             | Mittel     | Paginierung implementieren, Datenbankabfragen optimieren |
| RISK-005 | Datenverlust                                        | Niedrig            | Kritisch   | Regelmäßige Backups, Wiederherstellungsverfahren testen  |
| RISK-006 | Sicherheitslücken                                   | Mittel             | Hoch       | Regelmäßige Sicherheitsaudits, Dependency-Updates        |

---

## 6. Anforderungsverfolgbarkeit

### Status der funktionalen Anforderungen

Alle 16 funktionalen Anforderungen sind implementiert:

- Authentifizierung (3 Anforderungen) ✅
- Lernkarten-Verwaltung (6 Anforderungen) ✅
- Fortschrittsverfolgung (2 Anforderungen) ✅
- Benutzeroberfläche (5 Anforderungen) ✅

### Status der nicht-funktionalen Anforderungen

| Anforderung     | Status       | Notizen                                                       |
| --------------- | ------------ | ------------------------------------------------------------- |
| Performance     | ✅ Erfüllt   | Vite sorgt für schnelle Builds, API-Antworten typisch < 200ms |
| Zuverlässigkeit | ⚠️ Teilweise | MongoDB-Persistenz funktioniert, Uptime-Tracking benötigt     |
| Sicherheit      | ✅ Erfüllt   | Auth0 JWT-Validierung, Datenisolation, HTTPS mit SSL          |
| Usability       | ⚠️ Teilweise | Moderne UI vorhanden, Barrierefreiheit benötigt Verbesserung  |
| Wartbarkeit     | ⚠️ Teilweise | Code dokumentiert, mehr Tests benötigt                        |
| Deployment      | ✅ Erfüllt   | Docker Compose funktioniert, GitHub Actions konfiguriert      |

---

## 7. Anhänge

### API-Endpunkte

**Backend REST API (Flask):**

- `GET /api/words` - Alle Lernkarten für alle Nutzer
- `GET /api/words/rand/<user_identifier>` - Zufällige Karte für Nutzer
- `POST /api/sendwords` - Neue Karte erstellen (Body: token, word, ans)
- `POST /api/editword` - Karte bearbeiten (Body: token, oldword, word, ans)
- `DELETE /api/delword/<word>` - Karte löschen (Body: token)
- `POST /api/token` - JWT-Token validieren (Auth0)

**Authentifizierung:** Alle Endpunkte erfordern JWT-Token im Authorization-Header (Bearer Token). Token-Validierung erfolgt über Auth0 mit RS256-Algorithmus.

### Datenbankschema

**Collection:** `flashcards`

```json
{
  "_id": ObjectId,
  "user_identifier": "user@example.com",
  "cards": {
    "begriff1": "definition1",
    "begriff2": "definition2[status_marker]"
  },
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Technologie-Stack

**Frontend:** React 18.2, Vite 5.4, Tailwind CSS 3.4, shadcn/ui, React Router DOM 6.3, Auth0 React SDK 1.11.0, Lucide React

**Backend:** Flask 2.2.2, Python 3.9+, PyMongo 4.6.1, python-jose 3.3.0, Flask-CORS 3.0.10

- **Backend-Struktur:** Monolithische Flask-Anwendung mit modularen Endpunkten
- **Datenbankverbindung:** PyMongo Client mit Umgebungsvariablen-Konfiguration
- **Authentifizierung:** JWT-Validierung über Auth0 mit RS256, Error-Handling für Auth-Fehler

**Infrastruktur:** Docker & Docker Compose, Nginx, MongoDB 7.0, GitHub Actions

---

## 8. Fazit

Diese Anforderungsanalyse dokumentiert die RecallCards-Plattform umfassend. Das System implementiert erfolgreich die Kernfunktionalität für Lernkarten-Verwaltung und Lernen mit modernem Tech-Stack und Deployment-Infrastruktur.

**Stärken:**

- Moderne, responsive Benutzeroberfläche
- Sichere Authentifizierung über Auth0
- Vollständige CRUD-Operationen für Lernkarten
- Fortschrittsverfolgung
- Automatisierte Deployment-Pipeline

**Verbesserungsbereiche:**

- Erweiterte Fehlerbehandlung
- Umfassende Test-Abdeckung
- Verbesserte Barrierefreiheit
- Performance-Optimierung für Skalierung
- Zusätzliche Features (Spaced-Repetition, Import/Export)

Das Projekt ist gut positioniert für zukünftige Erweiterungen und Skalierung mit solidem Fundament.

---

**Ende des Dokuments**
