# v1.7.7 - Enhanced Rule Suggestion System

## 🎯 Major Rule Suggestion Improvements

This release brings significant enhancements to the rule suggestion system, making it smarter, more accurate, and less annoying!

### 🧠 Intelligent Pattern Detection

- **N-gram Analysis**: Detects meaningful phrases like "anytime fitness" instead of suggesting fragmented words
- **Noise Filtering**: Automatically ignores transaction IDs, reference codes, and random strings (e.g., `000000163246`, `ppha01hpxc`)
- **Pattern Normalization**: Removes duplicate words within patterns for cleaner suggestions
- **Advanced Deduplication**: Merges overlapping suggestions that match the same transactions

### ✅ Smarter Rule Management

- **Skip Existing Rules**: Never suggests patterns that you already have rules for
- **Rejection Memory**: Remembers when you decline creating a rule and won't ask again
- **Auto-fill Category**: Pre-selects the category when accepting a suggestion
- **Auto-remove Accepted**: Suggestions disappear from the list after you save them as rules

### 💡 Better User Experience

- **Rule Creation Prompts**: When categorizing transactions, offers to create rules for future automation
- **Smart Prompting**: Only asks about rule creation when a detectable pattern exists
- **No Nagging**: Respects your decisions and doesn't repeatedly suggest rejected patterns

### 🎨 Dark Mode Fixes

- **Comprehensive Dark Mode**: All modals, forms, and inputs now properly support dark theme
- **Material Design 3**: Consistent use of MD3 color variables throughout
- **Fixed Components**:
  - Rule editor modal
  - Manual transaction form  
  - CSV import wizard
  - Delete confirmation dialogs

### 📚 Documentation

- **AGENTS.md**: New file with coding guidelines for AI agents working in this codebase

### 🐛 Bug Fixes

- Fixed category dropdown not pre-selecting when accepting rule suggestions
- Fixed suggestions not being removed from list after acceptance
- Fixed duplicate suggestions piling up on re-detection

---

**Full Changelog**: https://github.com/jimartincorral/priperfin/compare/v1.7.6...v1.7.7
